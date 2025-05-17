import React from 'react';
import { formatDateFilter, picCheckerFilter, txtFilter } from '../utils';

function ThreadItem({ item, bid, isReply, onNavigateToThread }) {
    const { t: title, n: name, d: date, id: itemId, no, txt, p: picUrl, num, list } = item;

    const handleViewReplies = (e) => {
        e.preventDefault(); // Prevent default link behavior
        if (onNavigateToThread && !isReply) { // Only top-level threads can navigate
            onNavigateToThread(item, 0); // Navigate to page 0 of this thread
        }
    };

     const handleReplyLinkClick = (e, replyNo) => {
        e.preventDefault();
        if (onNavigateToThread && !isReply) { // Ensure we are on a thread item to navigate to its replies
            onNavigateToThread(item, 0, replyNo); // item is the main thread, replyNo is the specific reply to scroll to (optional)
        }
    };


    const contentClass = isReply ? "ml-8 pl-4 border-l-2 border-shijima-accent" : "";
    const containerClass = `py-3 ${isReply ? 'bg-shijima-reply-bg rounded-md my-1 px-2' : ''}`;

    return (
        <div className={containerClass}>
            <div className={`h-threads-item-main ${contentClass}`}>
                {picUrl && (
                    <div className="h-threads-img-box mb-2 mr-5 float-left clear-left max-w-[150px] md:max-w-[250px]">
                        <a href={picCheckerFilter(picUrl)} target="_blank" rel="noopener noreferrer" className="h-threads-img-a block">
                            <img
                                src={picCheckerFilter(picUrl)}
                                alt={title || 'Image'}
                                className="h-threads-img max-w-full max-h-60 md:max-h-80 object-contain border border-gray-300 rounded"
                                style={{ float: 'left' }} // Mimic original style
                            />
                        </a>
                    </div>
                )}
                <div className="h-threads-info text-xs text-gray-600 mb-1 clear-right">
                    <span className="h-threads-info-title font-bold text-shijima-title mr-2">{title || "无标题"}</span>
                    <span className="h-threads-info-email font-semibold text-shijima-name mr-2">{name || "无名氏"}</span>
                    <span className="h-threads-info-createdat mr-2">{formatDateFilter(date)}</span>
                    {itemId && <span className="h-threads-info-uid mr-2">ID:{itemId}</span>}
                    <a
                        href={`/?bid=${bid}&tid=${isReply ? item.tid : no}${isReply ? `#r${no}`: ''}`} // tid is parent thread for reply
                        className="h-threads-info-id text-shijima-link hover:underline mr-2"
                        onClick={(e) => handleReplyLinkClick(e, no)}
                    >
                        No.{no}
                    </a>
                    {!isReply && bid !== 0 && (
                        <span className="h-threads-info-reply-btn">
                            [<a
                                href={`/?bid=${bid}&tid=${no}`}
                                onClick={handleViewReplies}
                                className="text-shijima-link hover:underline"
                            >
                                回应
                            </a>]
                        </span>
                    )}
                </div>
                <div
                    className="h-threads-content text-shijima-text text-sm md:text-base whitespace-pre-line break-words"
                    style={{ clear: picUrl ? 'both' : 'none' }} // Clear float if image exists
                >
                    {txtFilter(txt)}
                </div>

                {!isReply && num > 5 && (!list || list.length < num) && ( // Show "omitted" if not all replies are loaded
                    <div className="h-threads-tips text-xs text-gray-500 mt-2">
                        {/* Icon would require a library or SVG */}
                        <span className="warn_txt2">回应有 {num - (list ? list.length : 0)} 篇被省略。要阅读所有回应请按下回应链接。</span>
                    </div>
                )}

                {!isReply && list && list.length > 0 && (
                    <div className="h-threads-item-replys mt-3 space-y-2">
                        {list.slice(0, 5).map((reply) => ( // Show first 5 replies or all if less than 5
                            <ThreadItem
                                key={reply.no}
                                item={{ ...reply, tid: no }} // Add parent thread ID to reply item
                                bid={bid}
                                isReply={true}
                                onNavigateToThread={onNavigateToThread} // Pass down for deep linking if needed
                            />
                        ))}
                    </div>
                )}
            </div>
            {!isReply && <hr className="my-3 border-t-2 border-shijima-blue-accent clear-left" />}
        </div>
    );
}

export default ThreadItem;