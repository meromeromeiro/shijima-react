// QuoteLink.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getThread } from '../services/api';
import ReplyItem from './ReplyItem';
import { Thread } from '../services/type';
import QuotedPostPreview from './QuotedPostPreview';

interface QuoteLinkProps {
  text: string;
  number: string | number; // Can be string or number
  type: 'no' | 'ref'; // Type of quote link
  // You can add a prop to pass the component to render in the preview later
  // previewComponent?: React.ReactNode;
}

const QuoteLink: React.FC<QuoteLinkProps> = ({ text, number, type }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ top: number; left: number } | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null); // Ref for the <a> tag
  const wrapperRef = useRef<HTMLSpanElement>(null); // Ref for the wrapper span

  const href = `#${type === 'no' ? 'p' : 'r'}${number}`;

  const handleMouseEnter = () => {
    if (linkRef.current && wrapperRef.current) {
      const linkRect = linkRef.current.getBoundingClientRect();
      const wrapperRect = wrapperRef.current.getBoundingClientRect(); // Get wrapper's position

      // Calculate position relative to the wrapper (which is position: relative)
      // Preview should be directly below the link, aligned to its left.
      setPreviewPosition({
        top: linkRect.height, // Positioned right below the link element within the relative wrapper
        left: 0, // Aligned with the left of the link (which is the left of the wrapper)
      });
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Optionally, reset position if needed, though not strictly necessary if re-calculated on hover
    setPreviewPosition(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default if you handle navigation in JS
    console.log(`Clicked ${type} link to: ${number}`);
    // Add your navigation or highlighting logic here

    // You might want to hide the preview on click as well
    // setIsHovering(false);
  };

  // Placeholder for the component to be shown in the preview
  const PreviewComponentPlaceholder = () => (
    <div
      style={{
        width: '200px', // Example width
        height: '100px', // Example height
        backgroundColor: 'lightcoral', // Temporary color block
        border: '1px solid #cc0000',
        padding: '8px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Preview for {type} {number}
    </div>
  );

  return (
    <span
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline-block' }} // Wrapper for positioning context
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        ref={linkRef}
        href={href}
        className="text-blue-600 hover:text-blue-800 hover:underline font-medium quote-link"
        data-post-no={number}
        onClick={handleClick}
      >
        {text}
      </a>

      {isHovering && previewPosition && (
        <div
          style={{
            position: 'absolute',
            top: `${previewPosition.top}px`,
            left: `${previewPosition.left}px`,
            zIndex: 1000, // Ensure it's above other content
            // Add transitions for smoother appearance if desired
            // transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            // opacity: isHovering ? 1 : 0,
            // transform: isHovering ? 'translateY(0)' : 'translateY(5px)',
            // minWidth: '150px', // Ensure it has some base width
          }}
          className="quote-link-preview-box shadow-lg bg-white rounded-md p-2 border border-gray-300 min-w-64 md:min-w-64" // Tailwind for basic styling
        >
          {/* Replace with your actual component when ready */}
          {/* <PreviewComponentPlaceholder /> */}
          <QuotedPostPreview postId={number} />
        </div>
      )}
    </span>
  );
};

export default QuoteLink;