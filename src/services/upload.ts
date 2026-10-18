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
 * 上传文件：统一使用 Raw Data（原始字节），禁止 FormData / multipart。
 *
 * 后端 azure-go（upload.moonchan.xyz）把请求体原样流式写入存储：
 * r2 驱动 verbatim 存储，multipart 信封会被整段入库——图片损坏、
 * Content-Type 变成 multipart/form-data、后端也读不到文件名（fallback uuid）。
 * 全程不得出现 form-data。
 *
 * 参考 azure-go static/index.html 官方客户端：
 *   PUT /api/upload/<文件名>，请求头 Content-Type = 文件真实 MIME，body = 原始字节。
 * 不带 dest → 服务端按类型分流：webp/png/jpg/jpeg/gif/bmp → p.sda1.dev，其余(含 avif) → r2。
 * 文件名走 URL 路径（后端 filenameFromRequest 优先取路径 fn），
 * 不设 X-File-Name：upload.moonchan.xyz 的 CORS Allow-Headers 不含它，
 * 跨源的 moonchan.xyz 页面带上它 preflight 会被浏览器拦掉。
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
        body: file, // 原始字节，不是 form-data
    });
    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.url;
}
