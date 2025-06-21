// ReplyRenderer.jsx
import React, { Fragment } from 'react';
import QuoteLink from './QuoteLink.tsx'; // 确保路径正确
import Mention from './Mention.tsx';     // 确保路径正确
import UrlLink from './UrlLink.tsx';     // 确保路径正确

// 将 Regexes 定义在组件外部，避免每次渲染都重新创建，提高性能
const QUOTE_LINK_REGEX = /(No\.(\d+))|(>>?(\d+))/g;
// 修正 Markdown link regex，[.] 只匹配一个点，应为 [^\]]+
// 同时，这个 regex 通常用于匹配整行，而不是内联的。如果真的需要内联，需要更复杂的逻辑。
// 在本例中，它仍被当作一个行级规则处理。
const MARKDOWN_LINK_REGEX = /\s*\[(.+)\]\((.+)\)\s*/; 
const URL_LINK_REGEX = /(https?):\/\/([a-zA-Z0-9.-]+)(?::\d+)?(?:\/[\w\d.%~_/-]*)*\/?(\?[^\s#]*)?(#[^\s]*)?/g;

/**
 * 遍历一行文本，识别并替换其中的引用链接和URL链接为React组件。
 *
 * @param {string} lineContent - 需要解析的文本行。
 * @returns {Array<string|React.ReactElement>} - 包含文本片段和React组件的数组。
 */
const parseInlineContent = (lineContent) => {
  const parts = [];
  let lastIndex = 0;

  // 定义一个包含所有需要处理的正则表达式及其处理逻辑的数组
  const processors = [
    {
      type: 'quote',
      regex: QUOTE_LINK_REGEX,
      handler: (match) => {
        const fullMatchText = match[0];
        let number, type;
        if (match[1]) { // Matched "No.xxxxx" (No.X is match[1], X is match[2])
          number = match[2];
          type = 'no';
        } else if (match[3]) { // Matched ">>xxxxx" or ">xxxxx" (>>X or >X is match[3], X is match[4])
          number = match[4];
          type = 'ref';
        }
        return <QuoteLink key={`quote-${match.index}-${fullMatchText}`} text={fullMatchText} number={number} type={type} />;
      }
    },
    {
      type: 'url',
      regex: URL_LINK_REGEX,
      handler: (match) => {
        const fullMatchText = match[0]; // match[0] 包含整个匹配的 URL 字符串
        return <UrlLink key={`url-${match.index}-${fullMatchText}`} text={fullMatchText} url={fullMatchText} />;
      }
    },
  ];

  while (lastIndex < lineContent.length) {
    let bestMatch = null;
    let bestMatchProcessor = null;

    // 遍历所有处理器，找出最早的匹配项
    for (const processor of processors) {
      // 必须重置每个正则的 lastIndex 到当前行的 lastIndex
      // 这样每个正则都能从当前未解析的位置开始搜索
      processor.regex.lastIndex = lastIndex; 
      const currentMatch = processor.regex.exec(lineContent);

      if (currentMatch) {
        // 如果这是第一个匹配项，或者比当前最佳匹配项更早出现
        if (bestMatch === null || currentMatch.index < bestMatch.index) {
          bestMatch = currentMatch;
          bestMatchProcessor = processor;
        }
      }
    }

    if (bestMatch) {
      // 添加在当前匹配之前的纯文本部分
      if (bestMatch.index > lastIndex) {
        parts.push(lineContent.substring(lastIndex, bestMatch.index));
      }

      // 添加处理后的 React 组件
      parts.push(bestMatchProcessor.handler(bestMatch));

      // 更新 lastIndex 到当前匹配项的末尾
      lastIndex = bestMatch.index + bestMatch[0].length;
    } else {
      // 没有找到更多的匹配项，将剩余的文本作为纯文本添加
      parts.push(lineContent.substring(lastIndex));
      break; // 退出循环
    }
  }

  // 如果 parts 为空（例如，空行），则返回原始行内容
  return parts.length > 0 ? parts : [lineContent];
};


const ReplyRenderer = ({ text, tid }) => {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const lines = text.split('\n');

  return (
    <div className="parsed-reply-content whitespace-pre-wrap break-words text-sm text-gray-700">
      {lines.map((line, index) => {

        if (line.trim() === "") {
            // 为空行添加 <br> 标签，但要确保它在DOM结构中不会导致多余的div
            // 或者，如果只是为了视觉换行，可以返回 null 让父级的 whitespace-pre-wrap 处理
            // 这里为了明确的空行，使用 <br> 是可以的，但通常 <br> 应该放在文本流中
            // 更好的做法是让父级的 div 来处理行分隔，或者为每个 line 返回一个包裹的 div。
            // 考虑到你后续返回了 div，这里直接返回 <br> 可能会导致额外的 div 嵌套。
            // 让我们保持一致性，返回一个空 div 或直接依赖 whitespace-pre-wrap。
            return <div key={index}></div>; // 返回一个空的 div 确保每行都有一个容器
        }

        // NEW RULE: @-prefixed lines
        if (line.startsWith('@')) {
          const firstSpaceIndex = line.indexOf(' ');
          let mentionPrefix = line; 
          let contentAfterMention = '';

          if (firstSpaceIndex !== -1) {
            mentionPrefix = line.substring(0, firstSpaceIndex); 
            contentAfterMention = line.substring(firstSpaceIndex + 1); 
          } 
          
          // 使用合并后的解析函数
          const parsedContentSegments = parseInlineContent(contentAfterMention);

          return (
            <React.Fragment key={index}>
              <div className="mention-line">
                <span className="mention-prefix font-medium text-blue-500 mr-2">{mentionPrefix}</span>
                {parsedContentSegments.map((segment, i) => (
                  <React.Fragment key={`mention-seg-${i}`}>{segment}</React.Fragment>
                ))}
              </div>
              {/* Mentions 的处理逻辑保留，但要注意它是否会重复显示 contentAfterMention */}
              {/* 如果 Mention 组件本身也要解析 query，则需要调整 Mention 组件 */}
              {/* 如果 Mention 只是展示一个触发器，而内容显示在上面，则目前逻辑是合理的 */}
              <Mention bot={mentionPrefix} tid={tid} query={contentAfterMention} />
            </React.Fragment>
          );
        }

        // Rule 1: Markdown H2-style Link (## [Text](URL))
        if (line.startsWith('##')) {
          const contentAfterMarker = line.substring(2); // Remove "##"
          // 使用外部定义的正则
          MARKDOWN_LINK_REGEX.lastIndex = 0;
          const linkMatch = contentAfterMarker.match(MARKDOWN_LINK_REGEX);
          
          if (linkMatch) {
            const linkText = linkMatch[1];
            const linkUrl = linkMatch[2];
            return (
              <a
                key={index}
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
              >
                {linkText}
              </a>
            );
          }
        }

        // Rule 2: Greentext and inline QuoteLinks / UrlLinks
        const isGreenText = line.startsWith('>') || line.startsWith('＞') || line.startsWith('》');
        let textToParseInline = line; // 变量名更通用
        let greentextPrefixElement = null;

        if (isGreenText) {
          greentextPrefixElement = <span className="greentext-prefix"> &gt; </span>;
          textToParseInline = line.substring(1); // Remove the leading '>' for inline parsing
        }

        // 使用合并后的解析函数处理行内容
        const parsedSegments = parseInlineContent(textToParseInline);

        // 如果该行只是一个空的 greentext (例如 ">")，确保渲染它
        if (isGreenText && parsedSegments.length === 1 && parsedSegments[0] === '') {
            return (
                <div key={index} className="text-green-600 greentext-line" style={{ color: '#00aa00' }}>
                    {greentextPrefixElement}
                </div>
            );
        }

        return (
          <div
            key={index}
            className={`${isGreenText ? 'text-green-600 greentext-line' : ''}`}
            style={isGreenText ? { color: '#00aa00' } : {}}
          >
            {isGreenText && greentextPrefixElement}
            {parsedSegments.map((segment, i) => (
              <React.Fragment key={`seg-${i}`}>{segment}</React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ReplyRenderer;