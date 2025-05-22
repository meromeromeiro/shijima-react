import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import OffCanvasMenu from './components/OffCanvasMenu';
import ThreadItem from './components/ThreadItem';
import Pagination from './components/Pagination';
import ForumInfo from './components/ForumInfo';
import PostForm from './components/PostForm';
import { fetchBoardThreads, fetchThreadDetails, fetchBoards } from './services/api';

// MainContentDisplay (保持不变)
function MainContentDisplay({ /* ...props... */ }) { /* ...component code... */ }

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // For routes rendering App directly, like in nested routes.
                              // But for top-level App, we usually get params inside specific Route elements.

  // OffCanvas Menu State
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [boardsMenuStructure, setBoardsMenuStructure] = useState([]);

  // Main Content Display State
  const [threads, setThreads] = useState([]);
  const [forumMeta, setForumMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // Current View Info (derived from URL)
  // These will be set based on the matched route by the useEffect below
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentViewType, setCurrentViewType] = useState(null); // 'board', 'thread', or 'post'
  const [navTitle, setNavTitle] = useState("时间线 - X岛揭示板");

  // PostForm State (managed by App to retain content)
  const [postFormData, setPostFormData] = useState({ name: '', email: '', title: '', content: '' });
  const [postFormImageFile, setPostFormImageFile] = useState(null);

  // --- Effect to parse URL and set active view parameters ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const pageFromQuery = parseInt(searchParams.get('page'), 10) || 1;
    setCurrentPage(pageFromQuery);

    // Extract IDs from path segments (React Router does this for us via <Route path="..."> element={...}>)
    // The 'params' from useParams() might be empty if App is the top-level router context provider.
    // We'll rely on the specific <Route> elements to pass params to their rendered components.
    // For setting App-level state like navTitle, we can inspect location.pathname.

    const pathSegments = location.pathname.split('/').filter(Boolean); // e.g., ["board", "1"] or ["thread", "123"] or ["post", "new", "1"]

    let tempBoardId = null;
    let tempThreadId = null;
    let tempViewType = null;
    let tempNavTitle = "时间线 - X岛揭示板";
    let tempForumMeta = null;


    if (pathSegments[0] === 'thread' && pathSegments[1]) {
      tempThreadId = parseInt(pathSegments[1], 10);
      tempViewType = 'thread';
      tempNavTitle = `No.${tempThreadId}`;
    } else if (pathSegments[0] === 'board' && pathSegments[1]) {
      tempBoardId = parseInt(pathSegments[1], 10);
      tempViewType = 'board';
      const flatBoards = boardsMenuStructure.flatMap(cat => cat.items || []);
      const currentBoardInfo = flatBoards.find(b => String(b.id || b.timelineId) === String(tempBoardId));
      tempNavTitle = currentBoardInfo ? currentBoardInfo.name : `版块 ${tempBoardId}`;
      tempForumMeta = {
        subTitle: currentBoardInfo ? currentBoardInfo.name : `版块 ${tempBoardId}`,
        header: currentBoardInfo ? currentBoardInfo.description : `版块 ${tempBoardId} 的描述`
      };
    } else if (pathSegments[0] === 'post' && pathSegments[1] === 'new' && pathSegments[2]) {
        tempBoardId = parseInt(pathSegments[2], 10);
        tempViewType = 'post'; // Posting to a board
        tempNavTitle = `在版块 ${tempBoardId} 发新串`;
    } else if (pathSegments[0] === 'post' && pathSegments[1] === 'reply' && pathSegments[2]) {
        tempThreadId = parseInt(pathSegments[2], 10);
        tempViewType = 'post'; // Replying to a thread
        tempNavTitle = `回复 No.${tempThreadId}`;
    }
    else if (location.pathname === '/') {
      // Default view (redirect to board 1)
      // This redirect will trigger this effect again with the new path
      if (boardsMenuStructure.length > 0) { // Ensure menu is loaded to avoid infinite redirect loops if default board is not found
          navigate('/board/1?page=1', { replace: true });
          return; // Exit early to let redirect happen
      }
    }

    setActiveBoardId(tempBoardId);
    setActiveThreadId(tempThreadId);
    setCurrentViewType(tempViewType);
    setNavTitle(tempNavTitle);
    setForumMeta(tempForumMeta);

  }, [location.pathname, location.search, boardsMenuStructure, navigate]);

  // --- Data Loading Effect ---
  const loadData = useCallback(async () => {
    // Only load data if viewing a board or thread, not when posting
    if (currentViewType !== 'board' && currentViewType !== 'thread') {
      setThreads([]);
      return;
    }
    if ((currentViewType === 'board' && !activeBoardId) || (currentViewType === 'thread' && !activeThreadId)) {
      setThreads([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let data;
      const apiPageNumber = Math.max(1, currentPage); // Assuming API is 1-indexed for page

      if (currentViewType === 'board' && activeBoardId) {
        data = await fetchBoardThreads(activeBoardId, apiPageNumber);
        setThreads(data || []);
        setTotalPages(20); // Placeholder
      } else if (currentViewType === 'thread' && activeThreadId) {
        data = await fetchThreadDetails(activeThreadId, apiPageNumber);
        setThreads(data && data.no ? [data] : []);
        const totalReplies = data?.replyCount || (data?.replies ? data.replies.length : 0);
        setTotalPages(Math.ceil((totalReplies + (data && data.no ? 1 : 0)) / 30));
      } else {
        setThreads([]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentViewType, activeBoardId, activeThreadId, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- OffCanvas Menu Logic ---
  const loadBoardsMenu = useCallback(async () => { /* ... (same as before) ... */ }, []);
  useEffect(() => { loadBoardsMenu(); }, [loadBoardsMenu]);
  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);
  const handleBoardSelect = (board) => {
    const boardIdToNavigate = board.timelineId || board.id;
    navigate(`/board/${boardIdToNavigate}?page=1`);
    setIsOffCanvasOpen(false);
  };

  // --- Event Handlers ---
  const handleThreadClick = (threadNo) => {
    navigate(`/thread/${threadNo}?page=1`);
  };
  const handlePageChange = (newPage) => {
    navigate(`${location.pathname.split('?')[0]}?page=${newPage}`);
    window.scrollTo(0, 0);
  };

  // --- PostForm Navigation ---
  const handleNavigateToPostForm = () => {
    if (activeThreadId) { // If currently viewing a thread, navigate to reply
      navigate(`/post/reply/${activeThreadId}`);
    } else if (activeBoardId) { // If currently viewing a board, navigate to new post in that board
      navigate(`/post/new/${activeBoardId}`);
    } else {
      // Default: navigate to post to a default board (e.g., board 1) or show an error/selector
      // For simplicity, let's assume we always have an activeBoardId if not a threadId when this is clicked
      // Or, you could disable the button if no valid context.
      // If we are at root, and activeBoardId is set to 1 by default URL parse logic:
      if (location.pathname === '/') navigate(`/post/new/1`);
      else alert("请先选择一个版块或帖子进行操作。");
    }
  };

  const handlePostSuccessInApp = (newPostData) => {
    // After successful post, navigate back or refresh data
    // PostForm's own navigate(-1) will handle going back.
    // We might want to force a data refresh for the view we are returning to.
    loadData(); // Re-fetch data for the current board/thread
    // Or, more robustly, navigate to the new thread if it's a new post.
    // if (newPostData && newPostData.no && !activeThreadId) { // If it was a new thread
    //   navigate(`/thread/${newPostData.no}`);
    // }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col"> {/* flex flex-col for h-full children */}
      <Navbar
        onToggleOffCanvas={toggleOffCanvas}
        title={navTitle}
        onNavigateToPostForm={handleNavigateToPostForm}
      />
      <OffCanvasMenu
        isOpen={isOffCanvasOpen}
        onClose={toggleOffCanvas}
        boardStructure={boardsMenuStructure}
        onSelectBoard={handleBoardSelect}
      />
      
      {/* Main content area takes remaining height */}
      <main className="pt-14 flex-grow overflow-y-auto"> {/* flex-grow for h-full, overflow-y-auto */}
        <Routes>
          <Route path="/" element={ // Default route, will be redirected by useEffect
            <MainContentDisplay
              threads={threads} forumMeta={forumMeta} isLoading={isLoading} error={error}
              currentPage={currentPage} totalPages={totalPages} currentViewType={currentViewType}
              onThreadClick={handleThreadClick} onPageChange={handlePageChange}
            />
          }/>
          <Route path="/board/:boardId" element={
            <MainContentDisplay
              threads={threads} forumMeta={forumMeta} isLoading={isLoading} error={error}
              currentPage={currentPage} totalPages={totalPages} currentViewType="board"
              onThreadClick={handleThreadClick} onPageChange={handlePageChange}
            />
          }/>
          <Route path="/thread/:threadId" element={
            <MainContentDisplay
              threads={threads} forumMeta={forumMeta} isLoading={isLoading} error={error}
              currentPage={currentPage} totalPages={totalPages} currentViewType="thread"
              onThreadClick={handleThreadClick} onPageChange={handlePageChange}
            />
          }/>
          <Route path="/post/new/:boardId" element={
            <PostForm
              appPostFormData={postFormData}
              setAppPostFormData={setPostFormData}
              appImageFile={postFormImageFile}
              setAppImageFile={setPostFormImageFile}
              onPostSuccess={handlePostSuccessInApp}
            />
          }/>
          <Route path="/post/reply/:threadId" element={
            <PostForm
              appPostFormData={postFormData}
              setAppPostFormData={setPostFormData}
              appImageFile={postFormImageFile}
              setAppImageFile={setPostFormImageFile}
              onPostSuccess={handlePostSuccessInApp}
            />
          }/>
        </Routes>
      </main>
    </div>
  );
}

export default App;