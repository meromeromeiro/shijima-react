import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Thread } from '../services/type';
import ReplyRenderer from './ReplyRenderer';
import ThreadImage from './ThreadImage.tsx'
import { formatUtcToLocalReadableTS } from '../services/utils.ts'
function ReplyItem({ reply, opNo }: { reply: Thread, opNo: number }) {
  if (!reply) return null;

  const [searchParams, setSearchParams] = useSearchParams();


  const isAdmin = (id: string) => {
    return false;
  }

  function parseURLSearchParams(searchParams: URLSearchParams, tid: number, r: number) {
    searchParams.set("tid", String(tid))
    searchParams.set("r", String(r))
    return "/?" + searchParams.toString();
  }

  function onClickThread(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set("pn", "0")
      prev.set("tid", String(opNo));
      prev.set("r", String(reply.no));
      return prev;
    });
  }

  return (
    <div className="py-1.5 pl-3 border-l-2 border-gray-200 hover:bg-gray-50"> {/* Added hover effect */}
      <div className="mb-1 flex flex-wrap items-baseline text-xs">
        {/* Title */}
        <span className="font-semibold text-red-700 mr-1.5">{reply.t || "无标题"}</span>
        {/* Name */}
        <span className="text-blue-500 mr-1.5">{reply.n || "无名氏"}</span>
        {/* Reply Number */}
        <a
          href={parseURLSearchParams(searchParams, opNo, reply.no || 0)}
          onClick={onClickThread}
          className="text-gray-400 hover:underline hover:text-blue-500 mr-1.5" // Added mr-1.5
        >
          No.{reply.no}
        </a>
        {/* Time */}
        <span className="text-gray-500 mr-1.5">{formatUtcToLocalReadableTS(reply.ts, "Asia/Shanghai")}</span>
        {/* UID */}
        <span className="text-gray-500 mr-1.5"> {/* Changed mx-1.5 to mr-1.5 to avoid double margin with PO */}
          ID: {isAdmin(reply.id)
            ? <span className="font-semibold text-red-600">Admin</span>
            : reply.id}
        </span>
        {/* PO indicator */}
        {reply.isPo && (
          <span className="text-blue-600 font-medium">(PO主)</span> // Removed leading margin, relies on previous item's mr-1.5
        )}
      </div>

      {/* Row 3: Image and Content (if replies can have images) */}
      {reply.p && (
        <div className="mb-1.5">
          <ThreadImage imageUrl={reply.p} />
        </div>
      )}

      <div
        className="text-sm text-gray-700 break-words parsed-html-content"
      // dangerouslySetInnerHTML={{ __html: reply.content }}
      >
        <ReplyRenderer text={reply.txt} />
      </div>
    </div>
  );
}

export default ReplyItem;