import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PostForm from './components/PostForm';
import ThreadListDisplay from './components/ThreadListDisplay';
import { APIURL } from './utils';

function AppContent() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedBoard, setSelectedBoard] = useState(null); // { id, name, intro }
    const [threads, setThreads] = useState([]); // For board view or single thread replies
    const [currentThreadData, setCurrentThreadData] = useState(null); // For thread view, holds the main thread

    const [currentBid, setCurrentBid] = useState(0);
    const [currentTid, setCurrentTid] = useState(0);
    const [currentBPage, setCurrentBPage] = useState(0); // Board page
    const [currentTPage, setCurrentTPage] = useState(0); // Thread page (replies)
    const [lengthOfLastBPage, setLengthOfLastBPage] = useState(-1); // For board "Next Page"

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [userId, setUserId] = useState(localStorage.getItem('id') || '');
    const [userAuth, setUserAuth] = useState(localStorage.getItem('auth') || '');

    const handleSetUser = (id, auth) => {
        setUserId(id);
        setUserAuth(auth);
    };
    const handleClearUser = () => {
        setUserId('');
        setUserAuth('');
    };

    const fetchData = useCallback(async (bid, tid = 0, page = 0) => {
        setIsLoading(true);
        setError(null);
        setThreads([]); // Clear previous threads
        setCurrentThreadData(null); // Clear previous thread data

        const requestBody = {
            m: "dir",
            bid: parseInt(bid, 10),
            tid: parseInt(tid, 10),
            page: parseInt(page, 10),
        };

        try {
            const response = await fetch(APIURL, {
                method: "POST",
                mode: 'cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (tid > 0) { // Viewing a specific thread
                setCurrentThreadData(data.length > 0 ? data[0] : null); // API returns array with one thread
                setThreads(data.length > 0 && data[0].list ? data[0].list : []); // Replies
                setCurrentTPage(page);
            } else { // Viewing a board
                if (page === 0) {
                    setThreads(data);
                } else {
                    setThreads(prev => [...prev, ...data]); // Append for "Next Page"
                }
                setCurrentBPage(page);
                setLengthOfLastBPage(data.length);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
            setLengthOfLastBPage(0); // Stop further "Next Page" attempts
        } finally {
            setIsLoading(false);
        }
    }, []);


    useEffect(() => { // Effect to react to URL changes
        const bidFromUrl = parseInt(searchParams.get('bid'), 10) || 0;
        const tidFromUrl = parseInt(searchParams.get('tid'), 10) || 0;
        const pageFromUrl = parseInt(searchParams.get('page'), 10) || 0;

        setCurrentBid(bidFromUrl);
        setCurrentTid(tidFromUrl);

        if (bidFromUrl > 0) {
            const boardFromList = initialBoards.find(b => b.id === bidFromUrl);
            if (boardFromList && (!selectedBoard || selectedBoard.id !== bidFromUrl)) {
                 setSelectedBoard(boardFromList);
            }

            if (tidFromUrl > 0) { // Viewing a specific thread
                fetchData(bidFromUrl, tidFromUrl, pageFromUrl);
                setCurrentTPage(pageFromUrl);
            } else { // Viewing a board
                fetchData(bidFromUrl, 0, pageFromUrl); // Fetch initial page of board
                setCurrentBPage(pageFromUrl); // Should be 0 usually unless linked directly
                // Reset thread page when switching back to board view
                setCurrentTPage(0);
                setCurrentThreadData(null);
            }
        } else {
            // No board selected, clear data
            setSelectedBoard(null);
            setThreads([]);
            setCurrentThreadData(null);
            setCurrentBPage(0);
            setCurrentTPage(0);
            setLengthOfLastBPage(-1);
        }
    }, [searchParams, fetchData, selectedBoard]); // Add selectedBoard to dependencies

    // Initial boards data (from Vue's `sideBar.data.boards`)
    // This could also be fetched from an API if dynamic
    const initialBoards = [
        { id: 1, name: "闲聊", intro: "请期待破岛的完全体，不过真的有人期待么……" },
        { id: 12, name: "串", intro: "这里可以演巨魔，所以其他板块就不行了" },
        { id: 23, name: "打捞", intro: "用来转贴或者什么的，发点有趣的东西吧" },
        { id: 34, name: "动画漫画", intro: "" },
        { id: 45, name: "贴图", intro: "" },
        { id: 46, name: "贴图(R18)", intro: "含有露骨的描写请慎重游览" },
        { id: 47, name: "桃饱", intro: "客官请吃桃" },
        { id: 101, name: "在这理发店", intro: "记得备份" },
        { id: 102, name: "自习室", intro: "万古如长夜(注意备份),也欢迎一起发串的" },
        { id: 104, name: "时尚", intro: "" },
        { id: 105, name: "Paper Reading", intro: "" },
        { id: 106, name: "意识形态分析", intro: "" },
    ];


    const handleBoardSelect = (board) => {
        setSelectedBoard(board);
        setCurrentBid(board.id);
        setCurrentTid(0); // Reset thread ID
        setCurrentBPage(0); // Reset board page
        setCurrentTPage(0); // Reset thread page
        setLengthOfLastBPage(-1); // Reset for "Next Page" button
        // URL will be updated by navigate in Sidebar, which triggers useEffect
    };

    const handlePostSuccess = (newData) => { // newData is the updated list of threads/replies from server
        if (currentTid > 0 && currentBid > 0) { // If was a reply, refetch current thread page
            fetchData(currentBid, currentTid, currentTPage);
        } else if (currentBid > 0) { // If was a new thread, refetch board page 0
            fetchData(currentBid, 0, 0);
            setCurrentBPage(0); // Go back to first page
        }
        // Optionally use newData if the backend returns the full updated list
        // For example:
        if (newData) {
            if (currentTid > 0) setCurrentThreadData(newData[0]);
            else setThreads(newData);
        }
    };

    const handleNextBoardPage = () => {
        const nextPage = currentBPage + 1;
        fetchData(currentBid, 0, nextPage);
        // Update URL
        navigate(`/?bid=${currentBid}&page=${nextPage}`);

    };

    const handleNavigateToThread = (threadObj, page, replyID) => {
        const newTid = threadObj.no;
        setCurrentTid(newTid);
        setCurrentTPage(page);
        setSelectedBoard(initialBoards.find(b => b.id === currentBid)); // Ensure selectedBoard is correct
        fetchData(currentBid, newTid, page);
        // Update URL
        let url = `/?bid=${currentBid}&tid=${newTid}&page=${page}`;
        if (replyID) {
            // url += `#r${replyID}`; // For scrolling, implement scrolling logic
        }
        navigate(url);
    };


    return (
        <div className="flex min-h-screen">
            <Sidebar onBoardSelect={handleBoardSelect} selectedBoardId={currentBid} />
            <div className="flex-grow ml-[135px] flex flex-col"> {/* Adjust margin to sidebar width */}
                <Header userId={userId} userAuth={userAuth} onSetUser={handleSetUser} onClearUser={handleClearUser} />
                <main className="main-panel flex-grow p-4 overflow-y-auto">
                    {currentBid > 0 && (
                         <PostForm
                            selectedBoard={selectedBoard}
                            currentThreadId={currentTid} // Pass 0 if it's a new thread on a board
                            userId={userId}
                            userAuth={userAuth}
                            onPostSuccess={handlePostSuccess}
                        />
                    )}
                    <hr className="border-t-2 border-shijima-blue-accent my-4" />
                    <ThreadListDisplay
                        threads={currentTid > 0 ? currentThreadData : threads} // Pass single thread data or list
                        bid={currentBid}
                        tid={currentTid}
                        isLoading={isLoading}
                        error={error}
                        currentPage={currentTid > 0 ? currentTPage : currentBPage}
                        lengthOfLastPage={lengthOfLastBPage} // Only for board view
                        onNextBoardPage={handleNextBoardPage} // Only for board view
                        onNavigateToThread={handleNavigateToThread}
                    />
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;