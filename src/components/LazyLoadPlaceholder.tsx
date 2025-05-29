import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types'; // 推荐安装 prop-types 用于类型检查

/**
 * 一个延迟加载的占位符组件。
 * 当组件进入浏览器视野时，才会加载并渲染其子元素。
 *
 * @param {object} props - 组件的属性
 * @param {string} [props.className] - 传递给占位符 div 的 CSS 类名
 * @param {object} [props.style] - 传递给占位符 div 的内联样式对象
 * @param {React.ReactNode} props.children - 当组件可见时需要加载和渲染的子元素
 */
const LazyLoadPlaceholder = ({ children, className = "", style = {} }) => {
    // isVisible 状态用于控制是否渲染 children
    const [isVisible, setIsVisible] = useState(false);
    // placeholderRef 用于获取占位符 div 的 DOM 引用
    const placeholderRef = useRef(null);

    // 使用 useCallback 缓存回调函数，避免不必要的重新创建
    const handleIntersect = useCallback((entries, observer) => {
        entries.forEach(entry => {
            // 如果占位符进入了视野
            if (entry.isIntersecting) {
                setIsVisible(true); // 设置状态为可见，触发 children 渲染
                observer.disconnect(); // 一旦可见，停止观察，避免重复触发
            }
        });
    }, []); // 依赖项为空数组，确保函数只创建一次

    useEffect(() => {
        const currentRef = placeholderRef.current;

        // 如果没有 DOM 引用，或者浏览器不支持 IntersectionObserver，则立即显示内容作为备用方案
        if (!currentRef || typeof IntersectionObserver === 'undefined') {
            setIsVisible(true);
            return;
        }

        // 创建 IntersectionObserver 实例
        const observer = new IntersectionObserver(handleIntersect, {
            // root: null (默认为浏览器视口)
            // rootMargin: '0px' (默认为0，可以在视口边缘触发)
            // threshold: 0 (默认为0，只要有一个像素可见就触发)
            // 你可以根据需求调整 rootMargin 或 threshold，例如：
            // rootMargin: '200px' // 在进入视口前200px就触发加载
            // threshold: 0.5 // 元素一半进入视口才触发加载
        });

        // 开始观察占位符元素
        observer.observe(currentRef);

        // 清理函数：组件卸载时停止观察
        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, [handleIntersect]); // 依赖项为 handleIntersect，因为它是 useEffect 内部使用的函数

    if (isVisible) return children;
    else return <div
        ref={placeholderRef} // 将 ref 绑定到这个 div
        className={isVisible ? "" : className} // 传入外部的 className
        style={isVisible ? {} : style} // 传入外部的 style
    />

    // return (
    //     // 渲染占位符 div
    //     <div
    //         ref={placeholderRef} // 将 ref 绑定到这个 div
    //         className={isVisible ? "" : className} // 传入外部的 className
    //         style={isVisible ? {} : style} // 传入外部的 style
    //     >            {/* 根据 isVisible 状态决定是否渲染 children */}
    //         {isVisible ? children : null}
    //     </div>
    // );
};

// 为组件添加 PropTypes 进行类型检查
LazyLoadPlaceholder.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node.isRequired, // children 是必需的
};

export default LazyLoadPlaceholder;