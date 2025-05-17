import React from 'react';
import ThreadItem from './ThreadItem';
import Pagination from './Pagination'; // Assuming you'll create this

function ThreadListDisplay({
    threads, // Can be list of threads or a single thread object with a 'list' of replies
    bid,
    tid, // Current thread ID (0 if board view)
    isLoading,
    error,
    currentPage, // tPage for thread view, bPage for board view
    lengthOfLastPage, // For board view's "Next Page"
    onNextBoardPage,
    onNavigateToThread, // Function to handle navigation to a thread view or specific page
}) {

    if (isLoading) {
        return <div className="text-center p-10">正在加载中...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">加载失败: {error}</div>;
    }

    if (!bid && !tid) { // No board or thread selected (initial state)
        return (
            <div className="text-center p-10 mt-10 text-shijima-text">
                <div className="mx-auto">
                    <br /><br />
                    <p className="text-lg">月島 しじま<br />月岛 静寂</p>
                    <p className="mt-2">《蘑菇的拟态日常》</p>
                    <br /><br />
                    <p>1、点击右上角获得饼干<br />2、点击左侧板块游览</p>
                    <p className="mt-2">请注意获取饼干有次数限制</p>
                    <p className="mt-2 font-bold">请使用CN地区IP发言</p>
                </div>
            </div>
        );
    }

    // If tid is present, we are in thread view. 'threads' should be a single thread object.
    const isThreadView = !!tid;
    const displayItems = isThreadView ? (threads && threads.list ? threads.list : []) : threads;
    const mainThreadItem = isThreadView ? threads : null;


    return (
        <div id="thread-panel" className="px-2 md:px-4">
            {isThreadView && mainThreadItem && (
                 <>
                    <ThreadItem
                        item={mainThreadItem}
                        bid={bid}
                        isReply={false}
                        onNavigateToThread={onNavigateToThread}
                    />
                    {/* Replies are rendered inside ThreadItem if they exist on mainThreadItem.list for initial load */}
                    {/* Or if they are loaded separately and passed as `displayItems` */}
                </>
            )}

            {!isThreadView && displayItems && displayItems.map(thread => (
                <ThreadItem
                    key={thread.no}
                    item={thread}
                    bid={bid}
                    isReply={false}
                    onNavigateToThread={onNavigateToThread}
                />
            ))}

            {/* Pagination or "Next Page" button */}
            {isThreadView && mainThreadItem ? (
                <Pagination
                    currentPage={currentPage} // This should be tPage
                    totalItems={mainThreadItem.num || 0} // Total replies for this thread
                    itemsPerPage={30} // As per your original pagination logic
                    onPageChange={(newPage) => onNavigateToThread(mainThreadItem, newPage)}
                    bid={bid}
                    tid={tid}
                />
            ) : ( // Board view
                bid && !tid && (
                    lengthOfLastPage > 0 ? (
                        <button
                            onClick={onNextBoardPage}
                            className="w-full h-16 bg-shijima-accent text-white rounded hover:bg-opacity-80 my-4"
                        >
                            下一页
                        </button>
                    ) : lengthOfLastPage === 0 ? (
                        <div className="text-center py-4 text-gray-500">已经到底了</div>
                    ) : null // No button if initial load or error
                )
            )}
        </div>
    );
}

export default ThreadListDisplay;