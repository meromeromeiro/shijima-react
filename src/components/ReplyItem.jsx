import React from 'react';

function ReplyItem({ reply, opNo }) {
  if (!reply) return null;
  
  const uidContent = reply.id === 'Admin' 
    ? <span className="font-semibold text-red-600">Admin</span> 
    : reply.id;

  return (
    <div className="py-1.5 pl-3 border-l-2 border-gray-200 hover:bg-gray-50"> {/* Added hover effect */}
      {/* Row 1: Title, Name, No */}
      <div className="mb-0.5 flex flex-wrap items-baseline text-xs">
        {reply.title && reply.title !== "无标题" && <h4 className="font-semibold text-gray-700 mr-1.5">{reply.title}</h4>}
        {reply.name && <span className="text-blue-500 mr-1.5">{reply.name}</span>}
        <a 
            href={`/m/t/${opNo}?r=${reply.no}`}
            className="text-gray-400 hover:underline hover:text-blue-500"
        >
            No.{reply.no}
        </a>
      </div>
      {/* Row 2: Time, UID, PO indicator */}
      <div className="mb-1 text-xs text-gray-500 flex items-center">
        <span>{reply.time}</span>
        <span className="mx-1.5">ID: {uidContent}</span>
        {reply.isPo && (
          <span className="text-blue-600 font-medium">(PO主)</span>
        )}
      </div>
      
      {/* Row 3: Image and Content (if replies can have images) */}
      {reply.thumbnail && (
        <div className="mb-1.5">
            <a href={reply.image} target="_blank" rel="noopener noreferrer" className="inline-block">
            <img 
                src={reply.thumbnail} 
                alt=""
                className="max-w-[64px] max-h-[64px] object-cover border border-gray-200 rounded-sm" // w-16 h-16 approx
                loading="lazy"
            />
            </a>
        </div>
      )}

      <div 
        className="text-sm text-gray-700 break-words parsed-html-content"
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />
    </div>
  );
}

export default ReplyItem;