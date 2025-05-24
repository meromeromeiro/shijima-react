
export function searchParamToQueryString(searchParams: URLSearchParams) {

}


export function validEhentaiUrl(urlString: string): string {
    // 解析原始URL对象
    const originalUrl = new URL(urlString);

    // 保存原始host（包含端口号）
    let originalHost = originalUrl.host;
    if (["e-hentai.org", "exhentai.org", "ehwb.moonchan.xyz", "ex.moonchan.xyz"].includes(originalHost)) {
        originalUrl.host = "ehwv.moonchan.xyz"
    } else {
        return urlString;
    }

    originalUrl.searchParams.set("redirect_to", "image")

    return originalUrl.href
}




/**
 * 将输入URL的host替换为代理域名，并在查询参数中添加原始host
 * @param urlString 原始URL字符串
 * @returns 修改后的完整URL字符串
 */
export function proxyWithHostParam(urlString: string): string {
    // 解析原始URL对象
    const originalUrl = new URL(urlString);

    // 保存原始host（包含端口号）
    let originalHost = originalUrl.host;

    if (originalHost === "proxy.moonchan.xyz") return urlString;
    if (originalHost === "pbs.twimg.com") {
        originalUrl.host = "twimg.moonchan.xyz"
        return originalUrl.href
    }
    if (originalHost === "i.pximg.net") {
        originalUrl.host = "pximg.moonchan.xyz"
        return originalUrl.href
    }

    if (["toto.im"].includes(parseRootDomain(originalHost))) {
        originalHost = "wx" + String(getRandomIntInclusive(1, 4)) + ".sinaimg.cn"
    }

    // 替换host为代理域名[1](@ref)
    originalUrl.host = 'proxy.moonchan.xyz';

    // 在查询参数中添加原始host[7](@ref)
    originalUrl.searchParams.set('proxy_host', originalHost);

    if (["sinaimg.cn"].includes(parseRootDomain(originalHost))) {
        originalUrl.searchParams.set('proxy_referer', "https://weibo.com");
    }

    return originalUrl.href;
}

/**
 * 使用URL API解析主域名（需完整URL）
 * @param url 完整URL（如 "https://abc.example.com/path"）
 * @returns 主域名（如 "example.com"）
 */
function parseRootDomain(hostname: string): string {
    try {
        const parts = hostname.split('.');
        return parts.length > 2
            ? parts.slice(-2).join('.')
            : hostname;
    } catch {
        throw new Error("Invalid URL format");
    }
}


// [min, max]
function getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // [3,6,7](@ref)
}



/**
 * Sets the document's title.
 *
 * @param title The new title for the document. If null or undefined,
 *              the title will not be changed.
 *
 * @example
 * ```ts
 * import { setDocumentTitle } from './utils';
 *
 * setDocumentTitle("My Awesome Page");
 * setDocumentTitle("New Post - My Forum");
 * ```
 *
 * @warning If using a library like React Helmet or react-helmet-async,
 *          prefer using that library's mechanisms to manage the document title
 *          to avoid conflicts. This function directly manipulates `document.title`.
 */
export const setDocumentTitle = (title?: string | null): void => {
    if (typeof title === 'string' && document.title !== title) {
        document.title = title;
    }
    // If title is null or undefined, we do nothing.
    // You could also choose to set a default title here if title is null/undefined,
    // e.g., document.title = "Default App Title";
};

/**
 * Gets the current document's title.
 *
 * @returns The current value of `document.title`.
 */
export const getDocumentTitle = (): string => {
    return document.title;
};

export function getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}