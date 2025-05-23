const UPLOAD_ENDPOINT = 'https://upload.moonchan.xyz/api/upload';
function getURL(id: string, filename: string) {
    return `https://upload.moonchan.xyz/api/${id}/${filename}`
}

export function uploadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        fetch(UPLOAD_ENDPOINT, {
            method: 'PUT',
            body: file,
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then((data) => {
            resolve(getURL(data.id, file.name));
        }).catch((error) => {
            reject(error);
        });
    });
}