import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Thread } from '../services/type';
import ReplyRenderer from './ReplyRenderer';
import ThreadImage from './ThreadImage.tsx'
import { formatUtcToLocalReadableTS } from '../services/utils.ts'
import LazyLoadPlaceholder from './LazyLoadPlaceholder.tsx';
function ReplyItem({ reply, opNo, pn }: { reply: Thread, opNo: number, pn: number }) {
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
      prev.set("pn", String(pn))
      prev.set("tid", String(opNo));
      prev.set("r", String(reply.no));
      return prev;
    });
  }

  return (
    <div className="py-1.5 pl-3 border-l-2 border-gray-200 bg-gray-100"> {/* Added hover effect */}
      <div className="mb-1 flex flex-wrap items-baseline text-xs">
        {/* Title */}
        <span className="font-semibold text-red-700 mr-1.5">{reply.t || "无标题"}</span>
        {/* Name */}
        <span className="text-blue-500 mr-1.5">{reply.n || "无名氏"}</span>

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
          <span className="text-blue-600 font-medium mr-1.5">(PO主)</span> // Removed leading margin, relies on previous item's mr-1.5
        )}
        {/* Reply Number */}
        <a
          href={parseURLSearchParams(searchParams, opNo, reply.no || 0)}
          onClick={onClickThread}
          className="text-gray-400 hover:underline hover:text-blue-500 mr-1.5" // Added mr-1.5
        >
          No.{reply.no}
        </a>
      </div>

      {/* Row 3: Image and Content (if replies can have images) */}
      {reply.p && (
        <LazyLoadPlaceholder className='h-5'>
          <div className="mb-1.5">
            <ThreadImage imageUrl={reply.p} />
          </div>
        </LazyLoadPlaceholder>
      )}

      <div
        className="text-sm text-gray-700 break-words parsed-html-content"
      // dangerouslySetInnerHTML={{ __html: reply.content }}
      >
        <ReplyRenderer text={reply.txt} tid={reply.no} />
      </div>
    </div>
  );
}

export default ReplyItem;