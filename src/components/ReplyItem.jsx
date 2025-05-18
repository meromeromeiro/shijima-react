import React from 'react';

function ReplyItem({ reply, opNo }) {
  if (!reply) return null;
  
  const handleContentClick = (e) => {
    // Example: if you want to handle clicks on >>No. links
    if (e.target.tagName === 'A' && e.target.textContent.startsWith('>>No.')) {
      // Potentially scroll to that reply if it's on the page, or fetch it
      // console.log('Clicked on quote link:', e.target.textContent);
    }
  };

  return (
    <div className="pt-2 pb-1 pl-2 border-l-2 border-gray-200 mb-2"> {/* h-threads-reply-container style */}
      {/* First Col */}
      <p className="mb-1 text-xs">
        <span className="font-semibold text-gray-700 mr-1.5">{reply.title}</span>
        <span className="text-blue-500 mr-1.5">{reply.name}</span>
        <a 
            href={`/m/t/${opNo}?r=${reply.no}`} // Link to the reply within the main thread
            className="text-gray-500 hover:underline"
        >
            No.{reply.no}
        </a>
      </p>
      {/* Second Col */}
      <p className="mb-1.5 text-xs text-gray-500">
        <span>{reply.time}</span>
        <span className="mx-1.5">ID: 
          {reply.id === 'Admin' ? <font color="red" className="font-semibold">Admin</font> : reply.id}
        </span>
        {reply.isPo && (
          <span className="text-blue-600 text-xs font-medium">(PO主)</span>
        )}
      </p>
      
      {/* Image and Content (Replies usually don't have images in this format, but can be added) */}
      {reply.thumbnail && (
        <div className="flex mb-1.5">
            <a href={reply.image} target="_blank" rel="noopener noreferrer" className="mr-2 flex-shrink-0">
            <img 
                src={reply.thumbnail} 
                alt="Reply image" 
                className="w-16 h-16 object-cover border border-gray-200"
            />
            </a>
        </div>
      )}

      <div 
        className="text-sm text-gray-800 break-words parsed-html-content" // h-threads-content
        onClick={handleContentClick}
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />
    </div>
  );
}

export default ReplyItem;