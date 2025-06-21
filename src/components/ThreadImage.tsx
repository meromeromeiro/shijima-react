import React, { useState, useMemo } from 'react';
import { getRandomIntInclusive, validEhentaiUrl, parseRootDomain } from "../services/utils"
import { PhotoView } from 'react-photo-view';

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


const previewUrl = (urlString: string): string => {
    if (!urlString) return "https://moonchan.xyz/favicon.ico"; // Handle empty urlString
    try {
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
    } catch (e) {
        console.error("Error in previewUrl with:", urlString, e);
        return "https://moonchan.xyz/favicon.ico"; // Fallback on error
    }
}

function getHrefUrl(urlString: string): string {
    if (!urlString) return "#"; // Handle empty urlString for href
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

        if (["sinaimg.cn"].includes(parseRootDomain(originalHost))) {
            // originalHost = "wx" + String(getRandomIntInclusive(1, 4)) + ".sinaimg.cn"
            originalUrl.host = 'proxy.moonchan.xyz';
            originalUrl.searchParams.set('proxy_host', originalHost);
            originalUrl.searchParams.set('proxy_referer', "https://weibo.com");
            return originalUrl.href;
        }

    } catch (e) {
        console.log("Error parsing URL in getHrefUrl for:", urlString, e)
    }

    return urlString;
}

function getTryList(urlString: string): string[] {
    if (!urlString) return ["https://moonchan.xyz/favicon.ico"];
    try {
        const originalUrl = new URL(urlString);

        if (["e-hentai.org", "exhentai.org", "ehwb.moonchan.xyz", "ex.moonchan.xyz"].includes(originalUrl.host)) {
            return [validEhentaiUrl(urlString), "https://moonchan.xyz/favicon.ico"]
        }
    } catch (e) {
        console.log("Invalid URL in getTryList:", urlString, e);
        return ["https://moonchan.xyz/favicon.ico"];
    }
    return [urlString, previewUrl(urlString), "https://moonchan.xyz/favicon.ico"]
}

const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-8 h-8 md:w-10 md:h-10 text-white" // Adjusted size
    >
        <path
            fillRule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clipRule="evenodd"
        />
    </svg>
);

const ThreadImage: React.FC<ThreadImageProps> = ({
    imageUrl,
    altText = "", // Defaults to empty string as in the original example
    linkClassName = "",
    imageClassName = "",
}) => {
    if (!imageUrl) {
        return null;
    }

    const [index, setIndex] = useState(0);
    const [onloaded, setOnloaded] = useState(false);

    const hrefUrl = useMemo(() => getHrefUrl(imageUrl), [imageUrl]);
    const tryList = useMemo(() => getTryList(imageUrl), [imageUrl]);

    const shouldShowPlayButton = useMemo(() => {
        if (!hrefUrl || hrefUrl === "#") { // Handle cases where hrefUrl might be a placeholder
            return false;
        }
        try {
            // Parse the hrefUrl to correctly access its pathname
            const url = new URL(hrefUrl); // This assumes hrefUrl is a full URL.
            // getHrefUrl should ideally always return a full URL or a known placeholder.
            const pathname = url.pathname.toLowerCase(); // Get a lowercase version of the path part

            return pathname.endsWith(".gif") ||
                pathname.endsWith(".webm") ||
                pathname.endsWith(".mp4");
        } catch (error) {
            // This might happen if hrefUrl is not a valid absolute URL
            // (e.g., a relative path, or malformed)
            // For robustness, you could fall back to a simpler string manipulation,
            // but ideally, getHrefUrl should prevent this.
            console.warn(`Could not parse hrefUrl for play button check: ${hrefUrl}`, error);

            // Fallback for basic check if URL parsing fails (less robust but better than nothing)
            // This tries to strip query parameters and hash before checking.
            const cleanUrl = hrefUrl.split('?')[0].split('#')[0].toLowerCase();
            return cleanUrl.endsWith(".gif") ||
                cleanUrl.endsWith(".webm") ||
                cleanUrl.endsWith(".mp4");
        }
    }, [hrefUrl]);

    const defaultLinkClasses = "flex w-fit"; // w-fit might be an issue with relative parent for absolute child
    // Changed to inline-flex for better wrapping of content
    const defaultImageClasses = "max-w-64 max-h-40 object-cover border border-gray-200 rounded-sm";

    // Fallback image source if all retries fail
    const currentImageSrc = tryList[index] || "https://moonchan.xyz/favicon.ico";


    const handleImageError = () => {
        if (index < tryList.length) {
            setIndex(prev => prev + 1);
        }
        // If it's already the last image (favicon), do nothing more.
    };

    return (
        <PhotoView key={currentImageSrc} src={currentImageSrc}>
            {/* <a
                href={hrefUrl}
                target="_blank"
                rel="noopener noreferrer"
                // Using inline-flex so the parent takes the size of the content,
                // allowing the absolute positioned play button to center correctly.
                className={`relative inline-flex ${onloaded ? '' : "h-48"} ${linkClassName}`.trim()}
            > */}
            {/* 240620 修改图片显示方式 */}
            <img
                src={currentImageSrc}
                alt={altText}
                className={`${defaultImageClasses} ${imageClassName}`.trim()}
                loading="lazy"
                onError={handleImageError}
                onLoad={() => { console.log(currentImageSrc); setOnloaded(true) }}
                onLoadedData={() => { setOnloaded(true) }}
            />

            {/* {shouldShowPlayButton && (
                <div className="absolute inset-0 flex items-center justify-center bg-black opacity-30 rounded-sm pointer-events-none">
                    <PlayIcon />
                </div>
            )} */}
            {/* </a> */}
        </PhotoView>

    );
};

export default ThreadImage;