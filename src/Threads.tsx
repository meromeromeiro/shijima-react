// src/components/ContentArea.jsx (or integrate into App.jsx)
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom';
import ThreadListDisplay from './components/ThreadListDisplay'; // Your provided component
import { getThread, getThreads } from './services/api'; // Your API functions
import type { Thread } from "./services/type"
import Pagination from './components/Pagination.tsx';
import { setDocumentTitle } from './services/utils.ts';

const ITEMS_PER_PAGE_THREAD = 30; // Standard items per page for threads/replies
const ITEMS_PER_PAGE_BOARD = 15; // Standard items per page for threads/replies

function Threads({ refresh }) {
    // const navigate = useNavigate();
    // const location = useLocation();

    // Option 1: Use path params (e.g., /board/:bid or /thread/:tid) - Recommended
    // const { bid: bid, tid: tid } = useParams();

    // Option 2: Use search params (e.g., /?bid=1 or /?tid=123) - Also viable
    const [searchParams, setSearchParams] = useSearchParams();


    // For this example, we'll prioritize path params.
    // If you use searchParams, adjust the logic below.

    const [data, setData] = useState<Thread[]>([]); // Can be array of threads (board) or single thread object (thread view)
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const bid = searchParams.get('bid') || "0";
        const tid = searchParams.get('tid') || "0";
        const page = searchParams.get('pn') || "0";
        if (tid === bid) return; // 不可以这样。
        if (tid === "0") {
            setIsLoading(true);
            getThreads(bid, tid, page).then(threads => {
                // console.log(threads);
                setData(threads);
                setIsLoading(false)
            }).catch(e => {
                setError(true)
            })
        }
        else {
            setIsLoading(true);
            getThread(tid, page).then(threads => {
                // console.log(threads);
                setData(threads);
                setDocumentTitle(`No.${threads[0].no} - ${threads[0].t ? threads[0].t : threads[0].txt}`)
                setIsLoading(false)
            }).catch(e => {
                setError(true)
            })
        }
    }, [searchParams, refresh]);

    const [totalPages, setTotalPages] = useState(100);
    useEffect(() => {
        if (data.length === 1 && data[0].num) {
            setTotalPages(Math.ceil(Math.abs(data[0].num || 0) / ITEMS_PER_PAGE_THREAD))
        } else {
            setTotalPages(100)
        }
    }, [data])

    return (
        <main className='mt-14 lg:ml-64 w-auto'>
            <ThreadListDisplay
                threads={data} // Pass the fetched data (array for board, object for thread)
                isLoading={isLoading}
                error={error}
            />
            { !(!isLoading && !error && data.length === 0) &&<Pagination totalPages={totalPages} />}
        </main>
    );
}

export default Threads;