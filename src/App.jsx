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
  const [currentView, setCurrentView] = useState({ type: 'board', id: 1, name: "时间线 - X岛揭示板" }); // Default view
  const [forumMeta, setForumMeta] = useState({ subTitle: "综合线", header: "不包含部分特殊版块" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // This would ideally come from API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [boards, setBoards] = useState([]); // For OffCanvasMenu

  const navTitle = currentView.type === 'thread' ? `No.${currentView.id}` : currentView.name || "时间线 - X岛揭示板";

  const loadBoards = useCallback(async () => {
    try {
      const boardsData = await fetchBoards(); // Assuming this is a static or separate fetch
      setBoards(boardsData);
    } catch (err) {
      console.error("Failed to load boards:", err);
      // Handle error loading boards if necessary
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (currentView.type === 'board') {
        data = await fetchBoardThreads(currentView.id, currentPage);
        setThreads(data);
        // For boards, totalPages might be fixed or a rough estimate if not provided
        setTotalPages(20); // Example: X岛 timeline often shows 20 pages
        setForumMeta({ subTitle: currentView.name, header: currentView.header || "版块描述" });
      } else if (currentView.type === 'thread') {
        data = await fetchThreadDetails(currentView.id, currentPage);
        setThreads([data]); // A single thread, its replies are within data.list
        setTotalPages(Math.ceil((data.replyCount + 1) / 30)); // Approx total pages for replies
        setForumMeta(null); // No separate forum meta for thread view
      }
    } catch (err) {
      setError(err.message);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentView, currentPage]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);

  const handleBoardSelect = (board) => {
    // Example: board = { id: 1, name: "综合线", type: 'timeline', header: "..." }
    // or board = { slug: '漫画', name: "漫画", type: 'forum', header: "..."}
    // The API for boards uses numeric ID, so we need to map slugs if they are used.
    // For simplicity, assuming 'id' is always the numeric ID for fetchBoardThreads.
    // You might need a mapping if your offcanvas uses slugs for forums.
    setCurrentView({ type: 'board', id: board.timelineId || board.id, name: board.name, header: board.description });
    setCurrentPage(1);
    setIsOffCanvasOpen(false);
  };

  const handleThreadClick = (threadNo) => {
    setCurrentView({ type: 'thread', id: threadNo });
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onToggleOffCanvas={toggleOffCanvas} title={navTitle} />
      <OffCanvasMenu
        isOpen={isOffCanvasOpen}
        onClose={toggleOffCanvas}
        boards={boards} // Pass fetched boards here
        onSelectBoard={handleBoardSelect}
      />

      {/* Main content */}
      <div className="h-middle pt-14"> {/* pt-14 to offset fixed navbar height (h-14) */}
        {/* Hidden Post Form - can be implemented later */}
        {/* <div id="h-post-form" className="uk-container uk-animation-slide-right uk-hidden">
          <hr />
        </div> */}

        {currentView.type === 'board' && forumMeta && (
          <ForumInfo subTitle={forumMeta.subTitle} header={forumMeta.header} />
        )}

        {isLoading && <div className="text-center p-4">加载中...</div>}
        {error && <div className="text-center p-4 text-red-500">加载失败: {error}</div>}
        
        {!isLoading && !error && (
          threads.map((thread, index) => (
            <React.Fragment key={thread.no || index}>
              <ThreadItem
                thread={thread}
                isFullThreadView={currentView.type === 'thread'}
                onThreadClick={currentView.type === 'board' ? handleThreadClick : undefined}
              />
              <hr className="my-0 border-gray-300" />
            </React.Fragment>
          ))
        )}

        {!isLoading && !error && threads.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default App;