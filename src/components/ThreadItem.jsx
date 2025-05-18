import React from 'react';
import ReplyItem from './ReplyItem';

function ThreadItem({ thread, isFullThreadView, onThreadClick }) {
  if (!thread) return null;

  const repliesToShow = isFullThreadView ? thread.replies : (thread.replies || []).slice(0, 5);
  const totalActualReplies = thread.replyCount || (thread.replies ? thread.replies.length : 0);
  const omittedRepliesCount = isFullThreadView ? 0 : Math.max(0, totalActualReplies - repliesToShow.length);
  
  const uidContent = thread.id === 'Admin' 
    ? <span className="font-semibold text-red-600">Admin</span> 
    : thread.id;

  return (
    <article className="px-3 py-3 sm:px-4"> {/* More padding on sm+ */}
      {/* Row 1: Title, Name, No, Sage */}
      <div className="mb-1 flex flex-wrap items-baseline text-sm">
        {thread.title && thread.title !== "无标题" && <h3 className="font-semibold text-gray-800 mr-2">{thread.title}</h3>}
        {thread.name && <span className="text-blue-600 mr-2">{thread.name}</span>}
        <a 
            href={onThreadClick ? '#' : `/m/t/${thread.no}?r=${thread.no}`} 
            onClick={onThreadClick ? (e) => { e.preventDefault(); onThreadClick(thread.no); } : undefined}
            className="text-xs text-gray-500 hover:underline hover:text-blue-500"
        >
            No.{thread.no}
        </a>
        {thread.isSage && (
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-800 rounded-sm">
            SAGE
          </span>
        )}
      </div>

      {/* Row 2: Time, UID, Reply Button */}
      <div className="mb-2 text-xs text-gray-500 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
            <span>{thread.time}</span>
            <span className="mx-2">ID: {uidContent}</span>
        </div>
        {!isFullThreadView && onThreadClick && (
          <button 
            onClick={() => onThreadClick(thread.no)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded text-xs min-w-[50px] focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            回应
          </button>
        )}
      </div>
      
      {/* Row 3: Image and Content */}
      <div className="flex gap-3"> {/* Using gap for spacing between image and text */}
        {thread.thumbnail && (
          <a href={thread.image} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <img 
                src={thread.thumbnail} 
                alt="" // Decorative if content explains it
                className="w-20 h-20 object-cover border border-gray-200 rounded-sm"
                loading="lazy"
            />
          </a>
        )}
        <div 
            className="text-sm text-gray-800 break-words parsed-html-content flex-grow min-w-0" // min-w-0 for flex child truncation
            dangerouslySetInnerHTML={{ __html: thread.content }}
        />
      </div>

      {/* Omitted replies message */}
      {omittedRepliesCount > 0 && !isFullThreadView && (
        <p className="text-xs mt-2 text-gray-500">
          回应有 {totalActualReplies} 篇, 其中 {omittedRepliesCount} 篇被省略。
          {onThreadClick && 
            <button onClick={() => onThreadClick(thread.no)} className="text-blue-500 hover:underline ml-1 focus:outline-none">
                阅读所有回应
            </button>
          }
        </p>
      )}

      {/* Reply List */}
      {repliesToShow.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 space-y-2"> {/* space-y for spacing between replies */}
          {repliesToShow.map((reply) => (
            <ReplyItem 
                key={reply.no} 
                reply={{...reply, isPo: reply.id === thread.id}}
                opNo={thread.no}
            /> 
          ))}
        </div>
      )}
    </article>
  );
}

export default ThreadItem;