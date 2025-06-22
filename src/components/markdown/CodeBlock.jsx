// CodeBlock.jsx
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Choose a style. e.g., atomDark, coy, dracula, funcy, okaidia, solarizedlight, tomorrow, twilight, vs, xonokai
// Full list: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_PRISM.MD
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : null;

    if (inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    if (lang) {
      return (
        <SyntaxHighlighter
          style={okaidia}
          language={lang}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }
    
    // For code blocks without a language specified (e.g., ``` text ```)
    return (
      <pre className="block-code" {...props}>
        <code>{children}</code>
      </pre>
    );
  }
};

export default CodeBlock;