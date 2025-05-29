// ReplyRenderer.jsx
import React from 'react';
import QuoteLink from './QuoteLink.tsx'; // Adjust path if necessary

const ReplyRenderer = ({ text }) => {
  if (typeof text !== 'string' || !text.trim()) {
    return null;
  }

  // Regex for No.XXXXX or >>XXXXX (or >XXXXX)
  const quoteLinkRegex = /(No\.(\d+))|(>>?(\d+))/g;

  // Regex for Markdown link: [text](url)
  // It will be applied to the content *after* "## "
  const markdownLinkRegex = /^\s*\[([^\]]+)\]\(([^)]+)\)\s*$/;

  const parseLineForQuoteLinks = (lineContent) => {
    const parts = [];
    let lastIndex = 0;
    let match;
    quoteLinkRegex.lastIndex = 0; // Reset regex state for each line

    while ((match = quoteLinkRegex.exec(lineContent)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(lineContent.substring(lastIndex, match.index));
      }

      const fullMatchText = match[0];
      let number, type;

      if (match[1]) { // Matched "No.xxxxx"
        number = match[2];
        type = 'no';
      } else if (match[3]) { // Matched ">>xxxxx" or ">xxxxx"
        number = match[4];
        type = 'ref';
      }

      parts.push(
        <QuoteLink key={`${type}-${number}-${match.index}`} text={fullMatchText} number={number} type={type} />
      );
      lastIndex = quoteLinkRegex.lastIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < lineContent.length) {
      parts.push(lineContent.substring(lastIndex));
    }
    return parts.length > 0 ? parts : [lineContent]; // Handle empty line or line with no matches
  };

  const lines = text.split('\n');

  return (
    <div className="parsed-reply-content whitespace-pre-wrap break-words text-sm text-gray-700">
      {lines.map((line, index) => {

        if (line.trim() === "") return <br key={index} />

        // Rule 1: Markdown H2-style Link (## [Text](URL))
        if (line.startsWith('## ')) {
          const contentAfterMarker = line.substring(3); // Remove "## "
          const linkMatch = contentAfterMarker.match(markdownLinkRegex);

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
          // If it starts with "## " but isn't a valid markdown link,
          // it will fall through to be treated as regular text (potentially greentext).
          // Alternatively, you could render it as a plain h2-like text here:
          // else {
          //   return <div key={index} className="my-2 text-lg sm:text-xl font-semibold">{contentAfterMarker}</div>;
          // }
        }

        // Rule 2: Greentext and inline QuoteLinks
        const isGreenText = line.startsWith('>') || line.startsWith('＞') || line.startsWith('》');
        let textToParseForQuotes = line;
        let greentextPrefixElement = null;

        if (isGreenText) {
          // Only apply greentext styling if it's not *also* a markdown H2 link
          // (which would have been handled above).
          // The check `line.startsWith('## ')` ensures we don't double-process.
          greentextPrefixElement = <span className="greentext-prefix"> &gt; </span>;
          textToParseForQuotes = line.substring(1); // Remove the leading '>' for quote parsing
        }

        const parsedSegments = parseLineForQuoteLinks(textToParseForQuotes);

        // If the line was empty after stripping '>' (e.g. just ">"), parsedSegments might be empty.
        // Ensure we render something to maintain line structure if greentextPrefixElement exists.
        if (greentextPrefixElement && parsedSegments.length === 1 && parsedSegments[0] === '') {
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