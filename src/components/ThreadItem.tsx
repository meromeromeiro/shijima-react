import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Thread } from '../services/type';
import ReplyItem from './ReplyItem.tsx';
import ReplyRenderer from './ReplyRenderer.jsx';
import ThreadImage from './ThreadImage.tsx'

function ThreadItem({ thread }: { thread: Thread }) {
  if (!thread) return null;

  const [searchParams, setSearchParams] = useSearchParams();

  function parseURLSearchParams(searchParams: URLSearchParams, tid: number) {
    searchParams.set("tid", String(tid))
    return "/?" + searchParams.toString();
  }

  function onClickThread(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set("pn", "0")
      prev.set("tid", String(thread.no));
      return prev;
    });
  }

  return (
    <article className="px-3 py-3 sm:px-4"> {/* More padding on sm+ */}
      <div className="mb-1 flex flex-wrap items-baseline text-sm">
        <span className="font-semibold text-red-700 mr-2">{thread.t || "无标题"}</span>
        <span className="text-blue-500 mr-2">{thread.n || "无名氏"}</span>
        <a
          href={parseURLSearchParams(searchParams, thread.no)}
          onClick={onClickThread}
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
          <span>{thread.ts}</span>
          <span className="mx-2">ID: {thread.id}</span>
        </div>
        <button
          onClick={onClickThread}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded text-xs min-w-[50px] focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          回应
        </button>
      </div>

      {/* Row 3: Image and Content */}
      <div className="flex gap-3"> {/* Using gap for spacing between image and text */}
        <ThreadImage imageUrl={thread.p}/>
        <div
          className="text-sm text-gray-800 break-words parsed-html-content flex-grow min-w-0" // min-w-0 for flex child truncation
        // dangerouslySetInnerHTML={{ __html: thread.content }}
        >
          <ReplyRenderer text={thread.txt} />
        </div>
      </div>

      {/* Omitted replies message */}
      {((thread.num || 0) > 5) && (
        <p className="text-xs mt-2 text-gray-500">
          回应有 {thread.num || 0} 篇, 其中 {(thread.num || 0) - 5} 篇被省略。
          <button onClick={onClickThread} className="text-blue-500 hover:underline ml-1 focus:outline-none">
            阅读所有回应
          </button>
        </p>
      )}

      {/* Reply List */}
      {(thread.list?.length || 0) > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 space-y-2"> {/* space-y for spacing between replies */}
          {thread!.list!.map((reply) => (
            <ReplyItem
              key={reply.no}
              reply={{ ...reply, isPo: reply.id === thread.id }}
              opNo={thread.no}
            />
          ))}
        </div>
      )}
    </article>
  );
}

export default ThreadItem;