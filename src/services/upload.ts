const UPLOAD_ENDPOINT = 'https://upload.moonchan.xyz/api/upload/r2';

/**
 * 把上传文件的原始名清理成可作为 R2 对象 key 的安全 basename（保留扩展名）。
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

export function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // POST multipart：浏览器把 file.name 写入 part 的 Content-Disposition filename，
        // moonchan 后端据此把 R2 对象 key 设为「文件名.ext」，返回的 url 形如
        // https://r2.moonchan.xyz/<unix_ts>/<文件名.ext>。
        // （旧实现用 PUT 原始 body，无文件名，后端回落用 dest 名「r2」当 key，
        //   故链接末段是 r2。）
        const form = new FormData();
        form.append('file', file, safeFilename(file.name));
        fetch(UPLOAD_ENDPOINT, {
            method: 'POST',
            body: form,
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((data) => {
            resolve(data.url);
        }).catch((error) => {
            reject(error);
        });
    });
}
