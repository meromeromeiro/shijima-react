const UPLOAD_ENDPOINT = 'https://upload.moonchan.xyz/api/upload';

/**
 * 把上传文件的原始名清理成可作为存储 key 的安全 basename（保留扩展名）。
 * - 只取 basename：剥离任意目录段（/ 与 \），防目录穿越
 * - 中和连续点号 `..`，避免回到上级 key
 * - 去掉文件系统非法字符与控制字符，折叠空白，限长
 *
 * 浏览器 <input type=file> 给出的 file.name 本就只有 basename，
 * 此处为纵深防御（防粘贴/拖拽/程序构造的 File 携带路径）。
 */
function safeFilename(name: string): string {
    const base = (name.split(/[\\/]/).pop() ?? name).trim();
    let safe = base
        .replace(/\.{2,}/g, '__')             // 中和 .. 穿越
        .replace(/[<>:"|?*\x00-\x1f]/g, '_')  // 非法/控制字符
        .replace(/\s+/g, '_')                 // 折叠空白
        .slice(0, 128);
    if (!safe || /^\.+$/.test(safe)) safe = 'upload';
    return safe;
}

/**
 * 上传文件：Raw Data（原始字节）直传。禁止编码成多部分表单——后端
 * azure-go 对请求体 verbatim 流式存储，任何封装都会被整段入库导致文件损坏、
 * Content-Type 错乱、文件名丢失。本项目历史上从未用过表单编码，也不允许出现。
 *
 * 实现对齐 azure-go 官方前端（static/index.html）：
 *   PUT /api/upload/<文件名>，Content-Type = 文件真实 MIME，body = 原始字节
 * 不带 dest → 服务端按类型分流：webp/png/jpg/jpeg/gif/bmp → p.sda1.dev，其余(含 avif) → r2
 * 文件名放 URL 路径（后端优先取路径 fn）；上传服务器跨源，X-File-Name 不在
 * CORS Allow-Headers 里，带上它 preflight 会被浏览器拦掉，故不设。
 */
export async function uploadFile(file: File): Promise<string> {
    const fileName = safeFilename(file.name);
    const contentType = file.type || 'application/octet-stream';
    const uploadUrl = `${UPLOAD_ENDPOINT}/${encodeURIComponent(fileName)}`;

    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
        },
        body: file,
    });
    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.url;
}