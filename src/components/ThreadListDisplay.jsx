import React, { } from 'react';
import ThreadItem from './ThreadItem.tsx';
import Pagination from './Pagination.tsx'; // Assuming you have this component
import ExpandableContent from './ExpandableContent.tsx';

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
    if (!isLoading && !error && threads.length === 0) {
        return (
            <div className="p-4 md:p-10 mt-10"> {/* Outer padding, responsive */}
                {/* 
                Flex container:
                - Default: flex-col (mobile, stacked)
                - md and up: flex-row (PC, side-by-side)
                - md:items-start: Align items to the top when in row layout
                - md:space-x-8: Add horizontal space between image and text on PC
                */}
                <div className="flex flex-col md:flex-row md:items-start md:space-x-8 max-w-4xl mx-auto">
                    {/* Image Column/Section */}
                    {/* 
                    - mb-6 md:mb-0: Margin bottom on mobile, none on PC (space-x handles it)
                    - w-full md:w-1/3 lg:w-1/4: Full width on mobile, 1/3 on medium, 1/4 on large screens for image container
                    - flex-shrink-0: Prevents the image column from shrinking if text is too long
                    */}
                    <div className="w-full md:w-1/3 lg:w-64 flex-shrink-0 mb-6 md:mb-0 flex justify-center md:justify-start">
                        {/* 
                        - w-48 sm:w-64 h-auto: Control image size, responsive.
                        - mx-auto md:mx-0: Center on mobile, align left on PC.
                        - rounded-lg shadow-md: Optional nice styling.
                        - Removed 'fixed' class as it conflicts with flex layout.
                        */}
                        <img
                            className="w-48 sm:w-56 md:w-64 h-auto rounded-lg shadow-md"
                            src="https://moonchan.xyz/api/v2/cover"
                            alt="月島 しじま"
                        />
                    </div>

                    {/* Text Column/Section */}
                    {/* 
                    - text-center md:text-left: Center text on mobile, left-align on PC.
                    - flex-grow: Allows this section to take up remaining space if needed (though specific widths on image column manage this)
                    */}
                    <div className="text-center md:text-left flex-grow">
                        <p className="text-xl font-semibold text-gray-800">月島 しじま</p>
                        <p className="text-lg text-gray-700">月岛 静寂</p>
                        <p className="mt-3 text-sm text-gray-600">《蘑菇的拟态日常》</p>

                        <div className="mt-6 space-y-2 text-sm text-gray-700"> {/* Use space-y for consistent spacing between paragraphs */}
                            <p>1、（手机）点击左上角查看板块信息</p>
                            <p>2、点击右上角（ + ）发言</p>
                        </div>

                        {/* <p className="mt-3 text-xs text-gray-500">请注意获取饼干有次数限制</p> */}
                        <p className="mt-3 font-bold text-red-600 text-base">请使用CN地区IP发言</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="thread-panel" className="px-2 md:px-4">
            {threads.map(thread => <ExpandableContent key={thread.no} maxHeight={threads.length === 1 ? 9999999999999 : 1280}><ThreadItem key={thread.no} thread={thread} /></ExpandableContent>)}
        </div>
    );
}

export default ThreadListDisplay;