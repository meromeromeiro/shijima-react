
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
    try {
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
    } catch (e) {
        return urlString;
    }
}

/**
 * 使用URL API解析主域名（需完整URL）
 * @param url 完整URL（如 "https://abc.example.com/path"）
 * @returns 主域名（如 "example.com"）
 */
export function parseRootDomain(hostname: string): string {
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
export function getRandomIntInclusive(min: number, max: number): number {
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

import { parseISO } from 'date-fns'; // To parse the ISO string
import { toZonedTime, format } from 'date-fns-tz'; // For timezone conversion and formatting

/**
 * 将 UTC 时间字符串（如 "2025-02-26T13:39:26Z"）转换为指定时区的
 * 人类可读格式 "YYYY-MM-DD(中文星期几)HH:MM:SS"。
 *
 * @param utcTimeString ISO 8601 格式的 UTC 时间字符串，必须以 'Z' 结尾。
 *                      例如 "2025-02-26T13:39:26Z"。
 * @param targetTimeZoneName 目标时区的名称，遵循 IANA 时区数据库的名称。
 *                           例如 "Asia/Shanghai", "America/New_York", "Europe/London"。
 * @returns 格式化后的本地时间字符串，或者在出错时返回错误信息。
 */
// export function formatUtcToLocalReadableTS(
//     utcTimeString?: string,
//     targetTimeZoneName?: string
// ): string{
//     return utcTimeString || targetTimeZoneName || "undefined"
// }
export function formatUtcToLocalReadableTS(
    utcTimeString?: string,
    targetTimeZoneName?: string
): string {
    if (!utcTimeString || !targetTimeZoneName) return String(utcTimeString)
    // 中文星期几，date-fns getDay() 返回 0 (周日) 到 6 (周六)
    const weekdaysCN = ["日", "一", "二", "三", "四", "五", "六"];

    try {
        // 1. 解析 UTC 时间字符串
        // parseISO 会正确处理以 'Z' 结尾的 UTC 时间字符串
        const utcDate = parseISO(utcTimeString);

        // 验证日期是否有效
        if (isNaN(utcDate.getTime())) {
            return `错误：无效的 UTC 时间字符串格式 '${utcTimeString}'`;
        }

        // 2. 将 UTC Date 对象转换为指定时区的 Date 对象
        // utcToZonedTime 返回一个新的 Date 对象，其时间值已调整到目标时区
        // 但它仍然是一个标准的 JavaScript Date 对象，其内部表示总是 UTC。
        // format 函数配合 timeZone 选项会正确处理它。
        const zonedDate = toZonedTime(utcDate, targetTimeZoneName);

        // 3. 格式化输出
        // 使用 date-fns-tz 的 format 函数，并提供 timeZone 选项
        // 'yyyy-MM-dd' 获取日期部分
        const dateStr = format(zonedDate, 'yyyy-MM-dd', { timeZone: targetTimeZoneName });

        // 'HH:mm:ss' 获取时间部分 (24小时制)
        const timeStr = format(zonedDate, 'HH:mm:ss', { timeZone: targetTimeZoneName });

        // 获取星期几 (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        // 注意：zonedDate.getDay() 也可以，但 format 的 'i' 或 'iii' 等格式化字符
        // 在 date-fns 中通常用于数字星期 (ISO week day 1-7)，而 getDay() 是 0-6。
        // 我们直接使用 getDay() 配合我们的数组。
        const dayOfWeekIndex = zonedDate.getDay(); // 这是在目标时区的星期几
        const weekdayCNStr = weekdaysCN[dayOfWeekIndex];

        return `${dateStr}(${weekdayCNStr})${timeStr}`;

    } catch (error) {
        if (error instanceof Error) {
            // 捕获 date-fns-tz 可能抛出的 RangeError (例如，无效的时区名称)
            if (error.message.includes("Invalid time zone")) {
                return `错误：未知的或无效的目标时区 '${targetTimeZoneName}'。详情: ${error.message}`;
            }
            return `错误：时间转换或格式化时出错。详情: ${error.message}`;
        }
        return `错误：发生未知错误。详情: ${String(error)}`;
    }
}
