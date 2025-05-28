import React, { useState, useRef, useEffect } from 'react';

/**
 * 一个可展开/收起内容的 React 组件。
 * 如果内容超过指定的 maxHeight，则显示“展开/收起”按钮。
 *
 * @param {object} props - 组件的属性。
 * @param {React.ReactNode} props.children - 需要被展开/收起的内容。
 * @param {number} [props.maxHeight=600] - 内容在收起状态下的最大高度（像素）。
 */
function ExpandableContent({ children, maxHeight = 1280 }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsTruncation, setNeedsTruncation] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // 测量内容高度并判断是否需要截断
    useEffect(() => {
        if (contentRef.current) {
            const actualHeight = contentRef.current.scrollHeight;
            //   console.log(actualHeight);
            if (actualHeight > maxHeight) {
                setNeedsTruncation(true);
            } else {
                // setNeedsTruncation(false);
                // 如果内容不再需要截断，确保它不是展开状态，隐藏按钮
                setIsExpanded(true);
            }
        }
    }, [children, maxHeight, contentRef,]); // 当 children 或 maxHeight 改变时重新计算

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="relative">
            {/* 内容区域 */}
            <div
                ref={contentRef}
                className={`overflow-hidden transition-all duration-300 ease-in-out`}
                style={(needsTruncation && !isExpanded) ? { maxHeight: `${maxHeight}px` } : {}}
            >
                {children}
                {/* 在收起且需要截断时显示渐变遮罩 */}
                {needsTruncation && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"></div>
                )}
            </div>

            {/* 展开/收起按钮，仅在需要截断时显示 */}
            {needsTruncation && !isExpanded && (
                <button
                    onClick={toggleExpand}
                    className="mt-4 w-full py-2 px-4 text-blue font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200"
                >
                    {isExpanded ? '收起全部' : '展开全部'}
                </button>
            )}
        </div>
    );
}

export default ExpandableContent;