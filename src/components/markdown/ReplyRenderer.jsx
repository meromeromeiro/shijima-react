// ReplyRenderer.jsx
import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import QuoteLink from '../QuoteLink.tsx';
import Mention from '../Mention.tsx';
import UrlLink from '../UrlLink.tsx';
import CodeBlock from './CodeBlock'; // For syntax highlighting
import { remarkCustomInlineParser } from './remarkCustomInlineParser'; // Our custom plugin

// Regex for custom ## [Text](URL) link - line based
const CUSTOM_MARKDOWN_LINK_REGEX = /^##\s*\[([^\]]+)\]\(([^)]+)\)\s*$/;

// Component for styled blockquotes (Greentext)
const GreenTextBlockquote = ({ children, ...props }) => {
  // react-markdown wraps blockquote content in <p> by default.
  // We can strip the <p> if needed, or style around it.
  // For simplicity, let's assume children might be a <p> node.
  return (
    <blockquote 
      className="text-green-600 greentext-line my-1" // my-1 for some margin
      style={{ color: '#00aa00', margin: '0.25em 0', paddingLeft: '1em', borderLeft: '2px solid #00aa00' }} 
      {...props}
    >
      {/* If you want to force the ">" prefix visually separate from Markdown's styling: */}
      {/* <span className="greentext-prefix mr-1">></span> */}
      {children}
    </blockquote>
  );
};


const ReplyRenderer = ({ text, tid }) => {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const lines = text.split('\n');
  const elements = [];

  // Component mapping for ReactMarkdown
  const markdownComponents = {
    code: CodeBlock.code, // Handles ```code``` blocks and `inline code`
    a: (props) => <UrlLink {...props} url={props.href} text={props.children} />, // Override standard links to use UrlLink
    blockquote: GreenTextBlockquote, // For greentext (lines starting with >)
    // Custom node types from our remark plugin
    quotelink: (props) => { // Corresponds to tagName 'quoteLink' in plugin
      const { number, type, children } = props; // children will be the original text
      return <QuoteLink number={number} type={type} text={children} />;
    },
    urllink: (props) => { // Corresponds to tagName 'urlLink' in plugin
       const { url, children } = props; // children will be the original text
      return <UrlLink url={url} text={children} />;
    },
    p: ({children}) => <p>{children}</p>, // Add some margin to paragraphs
    // You can override other elements like h1, h2, ul, ol, li etc. if needed
  };

  let currentMarkdownBlock = [];

  function flushMarkdownBlock(keyPrefix) {
    if (currentMarkdownBlock.length > 0) {
      elements.push(
        <ReactMarkdown
          key={`${keyPrefix}-md-${elements.length}`}
          remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
          components={markdownComponents}
          class="markdown-content" // Add a class for overall styling if needed
        >
          {currentMarkdownBlock.join('\n')}
        </ReactMarkdown>
      );
      currentMarkdownBlock = [];
    }
  }

  lines.forEach((line, index) => {
    // Handle empty lines specifically if needed, or let Markdown handle them
    if (line.trim() === "") {
        flushMarkdownBlock(`line-${index}`); // Process any pending markdown
        elements.push(<br key={`br-${index}`} />); // Or handle spacing with CSS on paragraphs
        return;
    }

    // Rule: @-prefixed lines (block-level custom component)
    if (line.startsWith('@')) {
      flushMarkdownBlock(`line-${index}`); // Process any pending markdown
      const firstSpaceIndex = line.indexOf(' ');
      let mentionTarget = line;
      let contentAfterMention = '';

      if (firstSpaceIndex !== -1) {
        mentionTarget = line.substring(0, firstSpaceIndex);
        contentAfterMention = line.substring(firstSpaceIndex + 1);
      }
      
      elements.push(
        <div key={`mention-${index}`} className="mention-block my-1">
          <span className="mention-prefix font-medium text-blue-500 mr-2">{mentionTarget}</span>
          {contentAfterMention && (
            // Render the contentAfterMention using ReactMarkdown itself for consistency
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
              components={markdownComponents}
            >
              {contentAfterMention}
            </ReactMarkdown>
          )}
          {/* The Mention component likely fetches data or has other side effects */}
          <Mention bot={mentionTarget} tid={tid} query={contentAfterMention} />
        </div>
      );
      return;
    }

    // Rule: Custom Markdown H2-style Link (## [Text](URL)) (block-level)
    const customLinkMatch = line.match(CUSTOM_MARKDOWN_LINK_REGEX);
    if (customLinkMatch) {
      flushMarkdownBlock(`line-${index}`); // Process any pending markdown
      const linkText = customLinkMatch[1];
      const linkUrl = customLinkMatch[2];
      elements.push(
        <div key={`customlink-${index}`} className="my-1"> {/* Wrap for block display & margin */}
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-xl text-blue-700 hover:text-blue-800 hover:underline" // Styled like an H2
          >
            {linkText}
          </a>
        </div>
      );
      return;
    }

    // Otherwise, it's a line for the Markdown processor
    currentMarkdownBlock.push(line);
  });

  flushMarkdownBlock('final'); // Process any remaining markdown

  return (
    <div className="parsed-reply-content whitespace-pre-wrap break-words text-sm text-gray-700">
      {elements.map((el, i) => (
        // Wrap each element in a Fragment or ensure they have keys
        <Fragment key={i}>{el}</Fragment>
      ))}
    </div>
  );
};

export default ReplyRenderer;