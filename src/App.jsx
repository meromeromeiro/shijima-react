import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import OffCanvasMenu from './components/OffCanvasMenu';
import ThreadItem from './components/ThreadItem';
import Pagination from './components/Pagination';
import ForumInfo from './components/ForumInfo';
import { fetchBoardThreads, fetchThreadDetails, fetchBoards } from './services/api';

function App() {
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [threads, setThreads] = useState([]);
  const [currentView, setCurrentView] = useState({ type: 'board', id: 1, name: "时间线 - X岛揭示板" });
  const [forumMeta, setForumMeta] = useState({ subTitle: "综合线", header: "不包含部分特殊版块" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boardsMenuStructure, setBoardsMenuStructure] = useState([]);

  const navTitle = currentView.type === 'thread' ? `No.${currentView.id}` : currentView.name || "时间线 - X岛揭示板";

  const loadBoardsMenu = useCallback(async () => {
    try {
      const boardsData = await fetchBoards();
      // Restructure for OffCanvasMenu: Group timelines under a "时间线" category
      const timelines = boardsData.filter(b => b.type === 'timeline');
      const otherCategories = boardsData.filter(b => b.isCategoryHeader);

      const menuStructure = [
        {
          name: "时间线",
          isCategoryHeader: true,
          items: timelines.map(tl => ({ name: tl.name, timelineId: tl.timelineId, description: tl.description }))
        },
        ...otherCategories
      ];
      setBoardsMenuStructure(menuStructure);
    } catch (err) {
      console.error("Failed to load boards menu:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (currentView.type === 'board') {
        // The API uses numeric ID for 'bid'.
        // If currentView.id is a slug (e.g., from a forum link), you'd need to map it to a numeric ID.
        // For simplicity, assuming currentView.id is always the numeric ID the API expects.
        const boardIdToFetch = currentView.timelineId || currentView.id;

        data = await fetchBoardThreads(boardIdToFetch, currentPage);
        setThreads(data);
        setTotalPages(20); // Example: X岛 timeline often shows 20 pages
        setForumMeta({ subTitle: currentView.name, header: currentView.header || currentView.description || "版块内容" });
      } else if (currentView.type === 'thread') {
        data = await fetchThreadDetails(currentView.id, currentPage);
        setThreads([data]);
        // Estimate total pages for replies: API provides 'num' in main thread for replies, or count 'list'
        const totalReplies = data.replyCount || (data.replies ? data.replies.length : 0);
        setTotalPages(Math.ceil((totalReplies + 1) / 30)); // +1 for OP, 30 items per page
        setForumMeta(null);
      }
    } catch (err) {
      setError(err.message);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentView, currentPage]);

  useEffect(() => {
    loadBoardsMenu();
  }, [loadBoardsMenu]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);

  const handleBoardSelect = (board) => {
    // board selected from OffCanvasMenu will have { name, timelineId, id (slug for forum), description }
    setCurrentView({ 
        type: 'board', 
        id: board.timelineId || board.id, // Use timelineId if present, else forum id/slug
        timelineId: board.timelineId, // Keep timelineId if it's a timeline
        name: board.name, 
        header: board.description 
    });
    setCurrentPage(1);
    setIsOffCanvasOpen(false);
  };

  const handleThreadClick = (threadNo) => {
    setCurrentView({ type: 'thread', id: threadNo, name: `No.${threadNo}` });
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onToggleOffCanvas={toggleOffCanvas} title={navTitle} />
      <OffCanvasMenu
        isOpen={isOffCanvasOpen}
        onClose={toggleOffCanvas}
        boardStructure={boardsMenuStructure}
        onSelectBoard={handleBoardSelect}
      />

      <main className="pt-14"> {/* pt-14 for fixed navbar (h-14) */}
        {currentView.type === 'board' && forumMeta && (
          <ForumInfo subTitle={forumMeta.subTitle} header={forumMeta.header} />
        )}

        {isLoading && <div className="p-4 text-center text-gray-600">加载中...</div>}
        {error && <div className="p-4 text-center text-red-600">加载失败: {error}</div>}
        
        {!isLoading && !error && threads.map((thread, index) => (
          <React.Fragment key={thread.no || index}>
            <ThreadItem
              thread={thread}
              isFullThreadView={currentView.type === 'thread'}
              onThreadClick={currentView.type === 'board' ? handleThreadClick : undefined}
            />
            <hr className="border-gray-200" /> {/* Removed my-0 to allow natural spacing or control in ThreadItem */}
          </React.Fragment>
        ))}

        {!isLoading && !error && threads.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;