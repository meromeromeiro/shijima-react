// BlockquoteLine.jsx
import React, { Fragment } from 'react';
import QuoteLink from '../QuoteLink.tsx'; // Ensure this path is correct

// Regex to find "No.xxxxx" patterns
const NO_NUMBER_REGEX = /No\.(\d+)/g; // Global flag for multiple matches

// 递归函数，用于处理每个节点并去除文本节点开头的换行符
function handler(node) {
  // 1. 如果节点是文本字符串
  if (typeof node === 'string') {
    if (node.startsWith('\n')) {
      return node.trimStart(); // 删除开头的 \n
    }
    return node; // 否则，原样返回字符串
  }

  // 2. 如果节点是一个有效的 React 元素 (例如 <div/>, <MyComponent/>, <></>)
  if (React.isValidElement(node)) {
    // 如果元素有子节点，则递归处理它们
    if (node.props && node.props.children) {
      const newChildren = React.Children.map(node.props.children, handler);
      // 克隆元素，使用新的（处理过的）子节点
      // 我们保留原始 props，只覆盖 children
      return React.cloneElement(node, node.props, newChildren);
    }
    // 如果没有子节点，原样返回元素
    return node;
  }

  // 3. 如果节点是一个节点数组 (有时会发生)
  if (Array.isArray(node)) {
    return node.map(handler);
  }

  // 4. 对于其他类型的节点 (null, undefined, boolean, number)，原样返回
  // React 知道如何处理它们 (通常是不渲染或转换为字符串)
  return node;
}


const BlockquoteLine = ({ children }) => {
    const processedChildren = React.Children.map(children, handler);
    return <div className="text-green-600 greentext-line border-l-2 border-green-600 pl-2">{processedChildren}</div>
};

export default BlockquoteLine;