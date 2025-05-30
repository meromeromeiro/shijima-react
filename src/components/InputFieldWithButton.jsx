import React, { useState } from 'react';

/**
 * 一个包含输入框和搜索按钮的组件。
 * 左边是输入框，右边是按钮。
 */
const InputFieldWithButton = ({ handleButtonClick }) => {
    // 使用 useState 来管理输入框的值
    const [inputValue, setInputValue] = useState('');

    return (
        // 最外层容器使用 flex 布局，使子元素并排显示
        // w-full: 宽度占满父容器
        // max-w-md: 最大宽度为 md (512px)，防止在超宽屏幕上拉伸过长
        // mx-auto: 居中显示
        // my-4: 上下外边距
        handleButtonClick && <div className="flex w-full max-w-md mx-auto my-4">
            {/* 输入框 */}
            <input
                type="text" // 文本类型输入框
                value={inputValue} // 绑定 state 变量
                onChange={(e) => setInputValue(e.target.value)} // 监听输入变化更新 state
                placeholder="请输入内容..." // 占位符文本
                // flex-1: 允许输入框占据剩余空间（灵活增长）
                // p-2: 内边距
                // border border-gray-300: 边框和颜色
                // rounded-l-md: 左侧圆角 (只在左边应用圆角，与右侧按钮形成一个整体)
                // focus:outline-none focus:ring-2 focus:ring-blue-500: 聚焦时的样式
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* 按钮 */}
            <button
                onClick={() => handleButtonClick(inputValue)} // 绑定点击事件
                // bg-blue-500 text-white: 背景色和文本颜色
                // p-2: 内边距 (与输入框高度匹配)
                // px-4: 左右内边距，给按钮一些宽度
                // rounded-r-md: 右侧圆角 (只在右边应用圆角，与左侧输入框形成一个整体)
                // hover:bg-blue-600: 鼠标悬停时的背景色
                // focus:outline-none focus:ring-2 focus:ring-blue-500: 聚焦时的样式
                className="bg-blue-500 text-white p-2 px-4 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                发送
            </button>
        </div>
    );
};

export default InputFieldWithButton;