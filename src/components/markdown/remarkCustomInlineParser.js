// remarkCustomInlineParser.js
import { visit } from 'unist-util-visit';

// Regexes (ensure they are global for .exec loop)
const QUOTE_LINK_REGEX = /(No\.(\d+))|(>>?(\d+))/g;
const URL_LINK_REGEX = /\b(https?:\/\/[^\s<>"'`]+[^\s<>"'`.,!?:;\)])/g;


const createCustomNode = (type, value, data, fullMatchText) => ({
  type: 'element',
  tagName: type,
  properties: data,
  children: [{ type: 'text', value: fullMatchText || value }],
});


export function remarkCustomInlineParser() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      const lineContent = node.value;
      const newChildren = [];
      let lastIndex = 0;

      const processors = [
        {
          type: 'quoteLink',
          regex: QUOTE_LINK_REGEX,
          handler: (match) => {
            const fullMatchText = match[0];
            let number, quoteType;
            if (match[1]) {
              number = match[2];
              quoteType = 'no';
            } else if (match[3]) {
              number = match[4];
              quoteType = 'ref';
            }
            return createCustomNode('quoteLink', fullMatchText, { number, type: quoteType }, fullMatchText);
          }
        },
        {
          type: 'urlLink',
          regex: URL_LINK_REGEX,
          handler: (match) => {
            const fullMatchText = match[0];
            return createCustomNode('urlLink', fullMatchText, { url: fullMatchText }, fullMatchText);
          }
        },
      ];
      
      while(lastIndex < lineContent.length) {
        let earliestMatch = null;
        let earliestMatchProcessor = null;

        for (const processor of processors) {
          processor.regex.lastIndex = lastIndex; // Start search from lastIndex
          const currentMatch = processor.regex.exec(lineContent);
          if (currentMatch) {
            if (!earliestMatch || currentMatch.index < earliestMatch.index) {
              earliestMatch = currentMatch;
              earliestMatchProcessor = processor;
            }
          }
        }

        if (earliestMatch) {
          // Add text before the match
          if (earliestMatch.index > lastIndex) {
            newChildren.push({ type: 'text', value: lineContent.substring(lastIndex, earliestMatch.index) });
          }
          // Add the custom node
          newChildren.push(earliestMatchProcessor.handler(earliestMatch));
          
          // --- CORRECTED LINE ---
          // The .lastIndex property is on the regex object itself (earliestMatchProcessor.regex),
          // and it's updated by the .exec() call.
          lastIndex = earliestMatchProcessor.regex.lastIndex; 
          // --- END CORRECTION ---

        } else {
          // No more matches, add remaining text
          if (lastIndex < lineContent.length) {
            newChildren.push({ type: 'text', value: lineContent.substring(lastIndex) });
          }
          break;
        }
      }

      if (newChildren.length > 0) {
        parent.children.splice(index, 1, ...newChildren);
        return [visit.SKIP, index + newChildren.length];
      }
    });
  };
}