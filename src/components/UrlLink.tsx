// QuoteLink.tsx
import React, { useState, useRef, useEffect } from 'react';
import { getThread } from '../services/api';
import ReplyItem from './ReplyItem';
import { Thread } from '../services/type';
import QuotedPostPreview from './QuotedPostPreview';

interface QuoteLinkProps {
    text: string;
    url: string;
}

const QuoteLink: React.FC<QuoteLinkProps> = ({ text, url }) => {
    return <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className="text-blue-600 hover:text-blue-800 hover:underline font-medium quote-link"
        style={{ color: '#0000aa' }}
    >
        {text}
    </a>
};

export default QuoteLink;