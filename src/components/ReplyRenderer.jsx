// ReplyRenderer.jsx
import React, { Fragment } from 'react';
import QuoteLink from './QuoteLink.tsx'; 
import Mention from './Mention.tsx';     
import UrlLink from './UrlLink.tsx';     
import CodeBlock from './markdown/CodeBlock'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 
import { remarkCustomInlineParser } from './markdown/remarkCustomInlineParser'; 

// 将 Regexes 定义在组件外部，避免每次渲染都重新创建，提高性能
const QUOTE_LINK_REGEX = /(No\.(\d+))|(>>?(\d+))/g;
const EXTENDED_CODE_CHARS_REGEX = /`([\s()[\]{}<>:;'"=+\-*/\\,.?!@#$%^&|~`\w\d]*?)`/g;
const MARKDOWN_LINK_REGEX = /\s*\[(.+?)\]\((.+?)\)\s*/g;
const URL_LINK_REGEX = /(https?):\/\/([a-zA-Z0-9.-]+)(?::\d+)?(?:\/[\w\d.%~_/-]*)*\/?(\?[^\s#]*)?(#[^\s]*)?/g;

/**
 * 遍历一行文本，识别并替换其中的引用链接和URL链接为React组件。
 *
 * @param {string} lineContent - 需要解析的文本行。
 * @returns {Array<string|React.ReactElement>} - 包含文本片段和React组件的数组。
 */
const parseInlineContent = (lineContent) => {
  const parts =[];
  let lastIndex = 0;

  const processors =[
    {
      type: 'quote',
      regex: QUOTE_LINK_REGEX,
      handler: (match) => {
        const fullMatchText = match[0];
        let number, type;
        if (match[1]) { 
          number = match[2];
          type = 'no';
        } else if (match[3]) { 
          number = match[4];
          type = 'ref';
        }
        return <QuoteLink key={`quote-${match.index}-${fullMatchText}`} text={fullMatchText} number={number} type={type} />;
      }
    },
    {
      type: 'markdownCode',
      regex: EXTENDED_CODE_CHARS_REGEX,
      handler: (match) => {
        const codeText = match[1];
        return (
          <span
            style={{
              color: 'rgb(248, 248, 242)',
              backgroundColor: 'rgb(39, 40, 34)',
              fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
              textAlign: 'left',
              whiteSpace: 'nowrap', 
              wordSpacing: 'normal',
              wordBreak: 'normal',
              overflowWrap: 'normal',
              padding: '4px',
              tabSize: 4,
              hyphens: 'none',
              borderRadius: '0.3em',
              maxWidth: '100%', 
              overflowX: 'auto', 
              overflowY: 'hidden', 
              boxSizing: 'border-box'
            }}
          >
            {codeText}
          </span>
        );
      }
    },
    {
      type: 'markdownLink',
      regex: MARKDOWN_LINK_REGEX,
      handler: (match) => {
        const fullMatchText = match[0];
        const linkText = match[1];
        const linkUrl = match[2];
        return (
          <a
            key={`markdown-link-${match.index}-${fullMatchText}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
          >
            {linkText}
          </a>
        );
      }
    },
    {
      type: 'url',
      regex: URL_LINK_REGEX,
      handler: (match) => {
        const fullMatchText = match[0]; 
        return <UrlLink key={`url-${match.index}-${fullMatchText}`} text={fullMatchText} url={fullMatchText} />;
      }
    },
  ];

  while (lastIndex < lineContent.length) {
    let bestMatch = null;
    let bestMatchProcessor = null;

    for (const processor of processors) {
      processor.regex.lastIndex = lastIndex;
      const currentMatch = processor.regex.exec(lineContent);

      if (currentMatch) {
        if (bestMatch === null || currentMatch.index < bestMatch.index) {
          bestMatch = currentMatch;
          bestMatchProcessor = processor;
        }
      }
    }

    if (bestMatch) {
      if (bestMatch.index > lastIndex) {
        parts.push(lineContent.substring(lastIndex, bestMatch.index));
      }
      parts.push(bestMatchProcessor.handler(bestMatch));
      lastIndex = bestMatch.index + bestMatch[0].length;
    } else {
      parts.push(lineContent.substring(lastIndex));
      break; 
    }
  }

  return parts.length > 0 ? parts : [lineContent];
};


const ReplyRenderer = ({ text, tid }) => {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const lines = text.split('\n');

  const fragments =[];
  const linesToProcess =[];

  lines.forEach((line, index) => {
    // 提取当前行是否是代码块边界的判断逻辑
    const isCodeBlockMarker = line.trim().startsWith('```');

    // ==========================================================
    // 修改点：优先级最高的是“正在处理代码块”或者“遇到了代码块开头”
    // ==========================================================
    if (linesToProcess.length > 0 || isCodeBlockMarker) {
      linesToProcess.push(line);

      // 如果遇到代码块的结束标记（且内容至少有2行），则渲染 ReactMarkdown
      if (isCodeBlockMarker && linesToProcess.length > 1) {
        const codeBlockContent = linesToProcess.join('\n');
        fragments.push(
          <ReactMarkdown
            key={`code-${index}`}
            remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
            components={{ code: CodeBlock.code }}
          >
            {codeBlockContent}
          </ReactMarkdown>
        );

        linesToProcess.length = 0; // 清空已处理的代码块行
      }
    } 
    // 非代码块状态下，才将空行渲染为 <br />
    else if (line.trim() === "") {
      fragments.push(<br key={`br-${index}`} />);
    } 
    // 普通文本处理（Mention, Quote, Greentext 等）
    else {
      if (line.startsWith('@')) {
        const firstSpaceIndex = line.indexOf(' ');
        let mentionPrefix = line;
        let contentAfterMention = '';

        if (firstSpaceIndex !== -1) {
          mentionPrefix = line.substring(0, firstSpaceIndex);
          contentAfterMention = line.substring(firstSpaceIndex + 1);
        }

        const parsedContentSegments = parseInlineContent(contentAfterMention);

        fragments.push(
          <React.Fragment key={index}>
            <div className="mention-line">
              <span className="mention-prefix font-medium text-blue-500 mr-2">{mentionPrefix}</span>
              {parsedContentSegments.map((segment, i) => (
                <React.Fragment key={`mention-seg-${i}`}>{segment}</React.Fragment>
              ))}
            </div>
            <Mention bot={mentionPrefix} tid={tid} query={contentAfterMention} />
          </React.Fragment>
        );
        return;
      }

      const isGreenText = line.startsWith('>') || line.startsWith('＞') || line.startsWith('》');
      let textToParseInline = line; 
      let greentextPrefixElement = null;

      if (isGreenText) {
        greentextPrefixElement = <span className="greentext-prefix"> &gt; </span>;
        textToParseInline = line.substring(1); 
      }

      const parsedSegments = parseInlineContent(textToParseInline);

      if (isGreenText && parsedSegments.length === 1 && parsedSegments[0] === '') {
        fragments.push(
          <div key={`gt-${index}`} className="text-green-600 greentext-line" style={{ color: '#00aa00' }}>
            {greentextPrefixElement}
          </div>
        );
      } else {
        fragments.push(
          <div
            key={`line-${index}`}
            className={`${isGreenText ? 'text-green-600 greentext-line' : ''}`}
            style={isGreenText ? { color: '#00aa00' } : {}}
          >
            {isGreenText && greentextPrefixElement}
            {parsedSegments.map((segment, i) => (
              <React.Fragment key={`seg-${index}-${i}`}>{segment}</React.Fragment>
            ))}
          </div>
        );
      }
    }
  });

  // 处理未闭合的代码块（针对 Markdown 只有开头 ``` 没有结尾 ``` 的防卫性编程）
  // 加上 key 和对空行渲染 <br /> 防止高度塌陷
  linesToProcess.forEach((line, index) =>
    fragments.push(<div key={`unclosed-${index}`}>{line || <br />}</div>)
  );

  return (
    <div className="parsed-reply-content whitespace-pre-wrap break-words text-sm text-gray-700">
      {fragments}
    </div>
  );
};

export default ReplyRenderer;
