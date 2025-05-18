import React from 'react';
import ReplyItem from './ReplyItem';

function ThreadItem({ thread, isFullThreadView, onThreadClick }) {
  if (!thread) return null;

  // Determine if replies are previews or full list
  const repliesToShow = isFullThreadView ? thread.replies : (thread.replies || []).slice(0, 5); // Show 5 previews
  const omittedRepliesCount = thread.replyCount - repliesToShow.length; // thread.num is replyCount in API for board view

  const handleContentClick = (e) => {
    // Handle clicks on >>No. links within content if needed
    if (e.target.tagName === 'A' && e.target.textContent.startsWith('>>No.')) {
        // Potentially navigate or show a preview of the quoted post
        // console.log('Clicked on quote link:', e.target.textContent);
    }
  };

  return (
    <div className="px-4 py-3"> {/* h-threads-container style */}
      {/* First Col */}
      <p className="mb-1 text-sm">
        <span className="font-bold text-gray-700 mr-2">{thread.title}</span>
        <span className="text-blue-600 mr-2">{thread.name}</span>
        <a 
            href={onThreadClick ? '#' : `/m/t/${thread.no}?r=${thread.no}`} 
            onClick={onThreadClick ? (e) => { e.preventDefault(); onThreadClick(thread.no); } : undefined}
            className="text-gray-500 hover:underline"
        >
            No.{thread.no}
        </a>
        {thread.isSage && ( /* Logic for sage needs to be determined */
          <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold bg-h-badge-warning-bg text-h-badge-warning-text rounded">
            已SAGE
          </span>
        )}
      </p>

      {/* Second Col */}
      <div className="mb-2 text-xs text-gray-500 flex flex-wrap items-center">
        <span>{thread.time}</span>
        <span className="mx-2">ID: 
          {/* UID often has custom color, handle with dangerouslySetInnerHTML or specific styling */}
          {thread.id === 'Admin' ? <font color="red" className="font-semibold">Admin</font> : thread.id}
        </span>
        {!isFullThreadView && onThreadClick && (
          <button 
            onClick={() => onThreadClick(thread.no)}
            className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
            style={{ minWidth: '50px' }} // uk-button-small approx
          >
            回应
          </button>
        )}
      </div>
      
      {/* Image and Content */}
      <div className="flex">
        {thread.thumbnail && (
          <a href={thread.image} target="_blank" rel="noopener noreferrer" className="mr-3 flex-shrink-0">
            <img 
                src={thread.thumbnail} 
                alt="Thread image" 
                className="w-20 h-20 object-cover border border-gray-200" // h-threads-image style
                style={{ border: '0', hspace: '20' }} // hspace is old, use margin
            />
          </a>
        )}
        <div 
            className="text-sm text-gray-800 break-words parsed-html-content flex-grow" // h-threads-content
            onClick={handleContentClick} // For handling internal links like >>No.12345
            dangerouslySetInnerHTML={{ __html: thread.content }}
        />
      </div>

      {/* Omitted replies message */}
      {omittedRepliesCount > 0 && !isFullThreadView && (
        <p className="text-xs mt-2" style={{ color: '#707070' }}>
          回应有 {thread.replyCount} 篇{omittedRepliesCount > 0 ? `, 其中 ${omittedRepliesCount} 篇被省略` : ''}。
          {onThreadClick && 
            <button onClick={() => onThreadClick(thread.no)} className="text-blue-500 hover:underline ml-1">
                要阅读所有回应请按下回应链接。
            </button>
          }
        </p>
      )}

      {/* Reply List */}
      {repliesToShow.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-2"> {/* h-threads-replylist - adding border-t for separation */}
          {repliesToShow.map((reply, index) => (
            <ReplyItem 
                key={reply.no || index} 
                reply={{...reply, isPo: reply.id === thread.id}} // Mark if reply is by PO
                opNo={thread.no}
            /> 
          ))}
        </div>
      )}
    </div>
  );
}

export default ThreadItem;