import React, { useState } from 'react';
import { proxyWithHostParam, validEhentaiUrl } from "../services/utils"

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

    const tryList = [
        validEhentaiUrl(imageUrl),
        proxyWithHostParam(imageUrl),
        "https://moonchan.xyz/favicon.ico",
    ]

    const defaultLinkClasses = "flex-shrink-0";
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