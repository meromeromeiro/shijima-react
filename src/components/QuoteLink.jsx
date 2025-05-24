// QuoteLink.jsx
import React from 'react';

/**
 * Component to render clickable quote/reference links.
 * e.g., No.12345 or >>12345
 */
const QuoteLink = ({ text, number, type }) => {
  // You might want to generate a proper href if these link somewhere
  // For now, '#' is a placeholder. 'type' could be 'no' or 'ref'.
  const href = `#${type === 'no' ? 'p' : 'r'}${number}`; // Example: #p12345 or #r12345

  return (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 hover:underline font-medium quote-link"
      data-post-no={number}
      onClick={(e) => {
        e.preventDefault(); // Prevent default if you handle navigation in JS
        console.log(`Clicked ${type} link to: ${number}`);
        // Add your navigation or highlighting logic here
      }}
    >
      {text}
    </a>
  );
};

export default QuoteLink;