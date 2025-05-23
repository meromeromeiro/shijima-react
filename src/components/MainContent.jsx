// src/components/MainContent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import ThreadItem from './ThreadItem';
import Pagination from './Pagination';
import ForumInfo from './ForumInfo';
import PostForm from './PostForm';
import { fetchBoardThreads, fetchThreadDetails } from '../services/api'; // 调整路径

function MainContent({ onTitleChange, onTogglePostForm, isPostFormVisible, boardsMenuStructure }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId: boardIdFromUrl, threadId: threadIdFromUrl } = useParams();

  const [threads, setThreads] = useState([]);
  // currentView 现在也需要从 URL search params 读取 name 和 header
  const [currentView, setCurrentView] = useState({ type: 'board', id: null, name: "加载中...", header: "" });
  const [forumMeta, setForumMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // isPostFormVisible 和 togglePostForm 现在通过 props 传递

  // 解析 URL search params 获取页码
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    setCurrentPage(page);
  }, [location.search]);

  // 根据 URL 参数和 search params 更新 currentView
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const nameFromQuery = searchParams.get('name');
    const headerFromQuery = searchParams.get('header');

    let newView = { type: 'board', id: null, name: "时间线 - X岛揭示板", header: "综合线" }; // Default

    if (threadIdFromUrl) {
      newView = { 
        type: 'thread', 
        id: parseInt(threadIdFromUrl, 10), 
        name: `No.${threadIdFromUrl}`, 
        header: `查看串 No.${threadIdFromUrl}` // Or fetch actual thread title if available
      };
    } else if (boardIdFromUrl) {
      const boardIdNum = parseInt(boardIdFromUrl, 10);
      // 尝试从 boardsMenuStructure (props) 或 query params 查找版块信息
      const foundBoard = boardsMenuStructure
        .flatMap(cat => cat.items || [])
        .find(b => String(b.id || b.timelineId) === String(boardIdNum));
      
      newView = {
        type: 'board',
        id: boardIdNum,
        name: nameFromQuery || (foundBoard ? foundBoard.name : `版块 ${boardIdNum}`),
        header: headerFromQuery || (foundBoard ? foundBoard.description : `版块 ${boardIdNum} 内容`)
      };
    } else if (nameFromQuery) { // 首页可能通过 query params 定义
        newView = {
            type: 'board', // Assuming default is a board type (e.g. timeline)
            id: 1, // Default timeline ID or could be passed in query
            name: nameFromQuery,
            header: headerFromQuery || "综合内容"
        }
    }
    // Else, use the default newView for timeline

    setCurrentView(newView);
  }, [boardIdFromUrl, threadIdFromUrl, location.search, boardsMenuStructure]);

  // 当 currentView 更新后，调用 onTitleChange 更新 Navbar 标题
  useEffect(() => {
    if (onTitleChange && currentView.name) {
      onTitleChange(currentView.name);
    }
  }, [currentView, onTitleChange]);

  const loadData = useCallback(async () => {
    if (!currentView.id && !(currentView.type === 'board' && currentView.name === "时间线 - X岛揭示板")) { // Allow loading timeline with default id 1 if not specified
        if (currentView.type === 'board' && currentView.name === "时间线 - X岛揭示板" && !currentView.id) {
           // Default timeline loading
        } else {
            console.log("No valid ID for currentView, skipping loadData:", currentView);
            setThreads([]); // Clear threads if no valid ID
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    try {
      let data;
      const effectiveId = currentView.id || (currentView.type === 'board' && currentView.name === "时间线 - X岛揭示板" ? 1 : null); // Default to 1 for main timeline
      if (!effectiveId && currentView.type !== 'thread') { // Thread must have an ID
          setError("无法加载：缺少版块或串的ID。");
          setIsLoading(false);
          setThreads([]);
          return;
      }


      if (currentView.type === 'board') {
        data = await fetchBoardThreads(effectiveId, currentPage);
        setThreads(data);
        // 假设API返回分页信息，否则需要硬编码或从其他地方获取
        // setTotalPages(data.totalPages || 20); // 示例: API可能返回totalPages
        setTotalPages(20); // 暂时硬编码
        setForumMeta({ subTitle: currentView.name || `版块 ${effectiveId}`, header: currentView.header || "版块内容" });
      } else if (currentView.type === 'thread' && currentView.id) { // Ensure thread has an ID
        data = await fetchThreadDetails(currentView.id, currentPage);
        setThreads([data]); // Thread details usually return a single thread object
        const totalReplies = data.replyCount || (data.replies ? data.replies.length : 0);
        // API should ideally provide total pages or total items for pagination
        setTotalPages(Math.ceil((totalReplies + 1) / 30) || 1); // 30 replies per page (example)
        setForumMeta(null); // No ForumInfo for single thread view
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message || "加载数据失败");
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentView, currentPage]); // Removed loadData from its own dependency array to avoid infinite loop

  useEffect(() => {
    loadData();
  }, [loadData]); // currentView 或 currentPage 变化时重新加载数据

  const handleThreadClick = (threadNo) => {
    navigate(`/thread/${threadNo}`);
  };

  const handlePageChange = (page) => {
    // setCurrentPage(page); // This will be set by useEffect listening to location.search
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page.toString());
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    window.scrollTo(0, 0);
  };

  const handlePostSuccess = () => {
    if (onTogglePostForm) onTogglePostForm(); // Close form via prop
    loadData(); // Reload data
  };

  return (
    <>
      <PostForm
        isVisible={isPostFormVisible}
        onClose={onTogglePostForm} // Use prop to close
        currentBoardId={currentView.type === 'board' ? (currentView.id || 1) : null} // Default to 1 for timeline
        currentThreadId={currentView.type === 'thread' ? currentView.id : null}
        onPostSuccess={handlePostSuccess}
      />

      {currentView.type === 'board' && forumMeta && (
        <ForumInfo subTitle={forumMeta.subTitle} header={forumMeta.header} />
      )}

      {isLoading && <div className="p-4 text-center text-gray-600">加载中...</div>}
      {error && <div className="p-4 text-center text-red-500 bg-red-100 border border-red-500 rounded m-4">加载失败: {error}</div>}

      {!isLoading && !error && threads.length === 0 && currentView.id && (
         <div className="p-4 text-center text-gray-500">此版块或串下暂无内容。</div>
      )}

      {!isLoading && !error && threads.map((thread, index) => (
        <React.Fragment key={thread.no || `thread-${index}`}>
          <ThreadItem
            thread={thread}
            isFullThreadView={currentView.type === 'thread'}
            onThreadClick={currentView.type === 'board' ? handleThreadClick : undefined}
          />
          <hr className="border-gray-200" />
        </React.Fragment>
      ))}

      {!isLoading && !error && threads.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}

export default MainContent;