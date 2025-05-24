import React, { } from 'react';
import ThreadItem from './ThreadItem.tsx';
import Pagination from './Pagination'; // Assuming you have this component

const ITEMS_PER_PAGE = 30; // Or get this from a config

function ThreadListDisplay({
    threads,    // This will be the raw data from API:
    // - For board view: an array of thread objects for the current page.
    // - For thread view: a single thread object, where thread.list contains replies for the current page.
    isLoading,
    error,
}) {

    if (isLoading) {
        return <div className="text-center p-10">正在加载中...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">加载失败: {error}</div>;
    }

    // Welcome message if no bid/tid (effectively, if threads data is null/undefined and not loading/error)
    // And also no specific bid/tid from URL (though parent usually handles this by not rendering or passing empty threads)
    if (!isLoading && !error && !threads) {
        return (
            <div className="text-center p-10 mt-10"> {/* Removed custom text color class */}
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

    return (
        <div id="thread-panel" className="px-2 md:px-4">
            {threads.map(thread => <ThreadItem thread={thread} />)}
        </div>
    );
}

export default ThreadListDisplay;