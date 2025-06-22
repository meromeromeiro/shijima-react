// ReplyRenderer.jsx
import React, { Fragment } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import QuoteLink from '../QuoteLink.tsx';
import Mention from '../Mention.tsx';
import UrlLink from '../UrlLink.tsx';
import CodeBlock from './CodeBlock'; // For syntax highlighting
import BlockquoteLine from './Blockquote.jsx';
import { remarkCustomInlineParser } from './remarkCustomInlineParser'; // Our custom plugin

// Regex for custom ## [Text](URL) link - line based
const CUSTOM_MARKDOWN_LINK_REGEX = /^##\s*\[([^\]]+)\]\(([^)]+)\)\s*$/;

// This component will be used if ReactMarkdown itself encounters a blockquote
// that wasn't handled by our line-by-line greentext logic.
const FallbackGreenTextBlockquote = ({ children, ...props }) => {
    return (
        <blockquote
            className="text-green-600 greentext-fallback my-1" // Differentiate if needed
            style={{ color: '#00aa00', margin: '0.25em 0', paddingLeft: '1em', borderLeft: '2px solid #00aa00' }}
            {...props}
        >
            {children}
        </blockquote>
    );
};


const ReplyRenderer = ({ text, tid }) => {
    if (typeof text !== 'string' || !text.trim()) {
        return null;
    }

    // --- PREPROCESSING STEP: Remove leading whitespace from all lines ---
    let preprocessedText = text;
    if (typeof text === 'string' && text.trim()) { // Only process if text is a non-empty string
        preprocessedText = text
            .split('\n')
            .map(line => line.trimStart()) // Removes whitespace from the beginning of a string
            .join('\n');
    } else if (typeof text !== 'string' || !text.trim()) {
        return null; // Handle empty or invalid input early
    }
    // --- END PREPROCESSING STEP ---


    const lines = preprocessedText.split('\n');
    const elements = [];

    // Component mapping for ReactMarkdown
    const markdownComponents = {
        code: CodeBlock.code,
        a: (props) => <UrlLink {...props} url={props.href} text={props.children} />,
        // Use FallbackGreenTextBlockquote for any blockquotes processed by ReactMarkdown directly
        blockquote: ({ node, children, ...props }) => {
            // 'children' will contain the content that was inside the blockquote.
            // ReactMarkdown typically wraps blockquote content in <p> tags.
            // So, 'children' might be an array like [<p>text</p>, <p>more text</p>].
            // Returning them directly will effectively unwrap them from the blockquote.
            // console.log('Blockquote children:', children);
            return <BlockquoteLine>{
                children
                    .filter(item => item !== '\n')}</BlockquoteLine>;
            // If you need to ensure they are treated as inline or part of the surrounding flow:
            // return <>{children}</>; // Or if children is an array of <p>, this is fine.
            // If children are just text nodes and you want them in a span:
            // return <span>{children}</span>
        },

        quotelink: (props) => {
            const { number, type, children } = props;
            return <QuoteLink number={number} type={type} text={children[0]} />; // children is an array
        },
        urllink: (props) => {
            const { url, children } = props;
            return <UrlLink url={url} text={children[0]} />; // children is an array
        },
        p: ({ children }) => <div className="mb-1">{children}</div>,
    };

    // Special components for rendering content within a custom block (like greentext or mention query)
    // This version disables paragraph wrapping for single lines.
    const inlineMarkdownComponents = {
        ...markdownComponents,
        p: Fragment, // Render paragraph content without <p> wrapper
    };


    let currentMarkdownBlock = [];

    function flushMarkdownBlock(keyPrefix) {
        if (currentMarkdownBlock.length > 0) {
            const contentToRender = currentMarkdownBlock.join('\n');
            elements.push(
                <ReactMarkdown
                    key={`${keyPrefix}-md-${elements.length}`}
                    remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
                    components={markdownComponents} // Use standard components for general markdown blocks
                //   className="markdown-content"
                >
                    {contentToRender}
                </ReactMarkdown>
            );
            currentMarkdownBlock = [];
        }
    }

    lines.forEach((line, index) => {
        if (line.trim() === "") {
            flushMarkdownBlock(`line-${index}`);
            elements.push(<br key={`br-${index}`} />);
            return;
        }

        // Rule: @-prefixed lines
        if (line.startsWith('@')) {
            flushMarkdownBlock(`line-${index}`);
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
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
                            components={inlineMarkdownComponents} // Use components that don't add <p> for single lines
                        //   className="inline" // Adjust styling as needed
                        >
                            {contentAfterMention}
                        </ReactMarkdown>
                    )}
                    <Mention bot={mentionTarget} tid={tid} query={contentAfterMention} />
                </div>
            );
            return;
        }

        // Rule: Custom Markdown H2-style Link (## [Text](URL))
        const customLinkMatch = line.match(CUSTOM_MARKDOWN_LINK_REGEX);
        if (customLinkMatch) {
            flushMarkdownBlock(`line-${index}`);
            const linkText = customLinkMatch[1];
            const linkUrl = customLinkMatch[2];
            elements.push(
                <div key={`customlink-${index}`} className="my-1">
                    <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                        {linkText}
                    </a>
                </div>
            );
            return;
        }

        // Rule: Single Greentext line (>)
        // Consider full-width variants if needed: line.startsWith('＞'), line.startsWith('》')
        // if (line.startsWith('>') || line.startsWith('＞') || line.startsWith('》')) {
        //     flushMarkdownBlock(`line-${index}-pre-gt`); // Process any pending markdown before this greentext

        //     elements.push(
        //         <div // This div acts as the styled "blockquote" for the single line
        //             key={`greentext-${index}`}
        //             className="text-green-600 greentext-line" // Your desired greentext styling
        //             style={{ color: '#00aa00', margin: '0.1em 0', paddingLeft: '1ch' }} // Example style
        //         >
        //             {/* Render the ">" character explicitly if desired, or rely on padding/border */}
        //             {/* <span className="greentext-char mr-1">></span> */}
        //             <ReactMarkdown
        //                 remarkPlugins={[remarkGfm, remarkCustomInlineParser]}
        //                 components={inlineMarkdownComponents} // Use components that don't add <p> for this line's content
        //             >
        //                 {line}
        //             </ReactMarkdown>
        //         </div>
        //     );
        //     return; // Move to the next line, do not add to currentMarkdownBlock
        // }

        // Otherwise, it's a line for the general Markdown processor
        currentMarkdownBlock.push(line);
    });

    flushMarkdownBlock('final');

    return (
        <div className="parsed-reply-content  break-words text-sm text-gray-700">
            {elements.map((el, i) => (
                <Fragment key={i}>{el}</Fragment>
            ))}
        </div>
    );
};

export default ReplyRenderer;