// QuotedPostPreview.tsx

import React, { useState, useEffect } from 'react';
import ReplyItem from './ReplyItem';
import { getThread } from '../services/api';
import type { Thread } from '../services/type';

export default function QuotedPostPreview({ postId }) {
    const [reply, setReply] = useState<Thread | null>(null);

    useEffect(() => {
        setReply(null);
        getThread(String(postId)).then(threads => {
            const reply = threads[0];
            setReply(reply);
        });
    }, [postId])

    return reply && <ReplyItem reply={reply} opNo={reply.r || 0} />
}
