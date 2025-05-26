import React, { useState } from 'react';
import { proxyWithHostParam, validEhentaiUrl, parseRootDomain } from "../services/utils"

interface ThreadImageProps {
    /** The URL of the image. If not provided, the component renders nothing. */
    imageUrl?: string | null;
    /** Alt text for the image. Defaults to an empty string, indicating it's decorative. */
    altText?: string;
    /** Optional additional CSS classes for the link <a> element */
    linkClassName?: string;
    /** Optional additional CSS classes for the <img> element */
    imageClassName?: string;
}


const previewUrl = (urlString: string) => {
    const originalUrl = new URL(urlString);
    const originalHost = originalUrl.host;
    if (originalHost !== "proxy.moonchan.xyz") {
        originalUrl.searchParams.set('host', originalHost);
    }
    originalUrl.pathname = "/api/v2/preview" + originalUrl.pathname
    originalUrl.host = "moonchan.xyz"

    if (["i.pximg.net"].includes(originalHost)) originalUrl.searchParams.set('proxy_referer', "https://pixiv.net");
    else if (["sinaimg.cn"].includes(parseRootDomain(originalHost))) originalUrl.searchParams.set('proxy_referer', "https://weibo.com/");

    return originalUrl.href
}



export function getTryList(urlString: string): string[] {
    if (!urlString) return ["https://moonchan.xyz/favicon.ico"];

    const originalUrl = new URL(urlString);

    if (["e-hentai.org", "exhentai.org", "ehwb.moonchan.xyz", "ex.moonchan.xyz"].includes(originalUrl.host)) {
        return [validEhentaiUrl(urlString), "https://moonchan.xyz/favicon.ico"]
    }

    return [previewUrl(urlString), urlString, "https://moonchan.xyz/favicon.ico"]
}

const ThreadImage: React.FC<ThreadImageProps> = ({
    imageUrl,
    altText = "", // Defaults to empty string as in the original example
    linkClassName = "",
    imageClassName = "",
}) => {
    // If no imageUrl is provided, render nothing
    if (!imageUrl) {
        return null;
    }

    const [index, setIndex] = useState(0);

    // const tryList = [
    //     previewUrl(imageUrl),
    //     validEhentaiUrl(imageUrl),
    //     proxyWithHostParam(imageUrl),
    //     "https://moonchan.xyz/favicon.ico",
    // ]
    const tryList = getTryList(imageUrl)

    const defaultLinkClasses = "flex w-fit";
    const defaultImageClasses = "max-w-64 max-h-40 object-cover border border-gray-200 rounded-sm";

    return (
        <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${defaultLinkClasses} ${linkClassName}`.trim()}
        >
            <img
                src={tryList[index]}
                alt={altText}
                className={`${defaultImageClasses} ${imageClassName}`.trim()}
                loading="lazy"
                onError={() => setIndex(prev => prev + 1)}
            />
        </a>
    );
};

export default ThreadImage;