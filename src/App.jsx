// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Link } from 'react-router-dom'; // 导入 React Router hooks
import Navbar from './components/Navbar';
import OffCanvasMenu from './components/OffCanvasMenu';
import ThreadItem from './components/ThreadItem';
import Pagination from './components/Pagination';
import ForumInfo from './components/ForumInfo';
import PostForm from './components/PostForm'; // 引入 PostForm
import { fetchBoardThreads, fetchThreadDetails, fetchBoards } from './services/api';

// 主页内容组件，用于展示版块或帖子列表
function MainContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { boardId: boardIdFromUrl, threadId: threadIdFromUrl } = useParams();

  const [threads, setThreads] = useState([]);
  const [currentView, setCurrentView] = useState({ type: 'board', id: 1, name: "时间线 - X岛揭示板" });
  const [forumMeta, setForumMeta] = useState({ subTitle: "综合线", header: "不包含部分特殊版块" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPostFormVisible, setIsPostFormVisible] = useState(false); // 控制发送框的显示

  // 解析 URL search params 获取页码
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const page = parseInt(searchParams.get('page'), 10) || 1;
    setCurrentPage(page);
  }, [location.search]);

  // 根据 URL 参数更新 currentView
  useEffect(() => {
    if (threadIdFromUrl) {
      setCurrentView({ type: 'thread', id: parseInt(threadIdFromUrl, 10), name: `No.${threadIdFromUrl}` });
    } else if (boardIdFromUrl) {
      // 你需要一个方法从 boardsMenuStructure (或 fetchBoards 的原始数据) 中根据 ID 查找版块名称和描述
      // 这里暂时用一个占位符
      const boardName = `版块 ${boardIdFromUrl}`; // 理想情况下从 boardsMenuStructure 查找
      const boardHeader = `版块 ${boardIdFromUrl} 的描述`; // 理想情况下从 boardsMenuStructure 查找
      setCurrentView({ type: 'board', id: parseInt(boardIdFromUrl, 10), name: boardName, header: boardHeader });
    } else {
      // 默认视图，比如综合线
      setCurrentView({ type: 'board', id: 1, name: "时间线 - X岛揭示板", header: "综合线" });
    }
  }, [boardIdFromUrl, threadIdFromUrl]);


  const loadData = useCallback(async () => {
    if (!currentView.id) return; // 如果没有有效的 ID，则不加载

    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (currentView.type === 'board') {
        data = await fetchBoardThreads(currentView.id, currentPage);
        setThreads(data);
        setTotalPages(20); // 示例
        setForumMeta({ subTitle: currentView.name || `版块 ${currentView.id}`, header: currentView.header || "版块内容" });
      } else if (currentView.type === 'thread') {
        data = await fetchThreadDetails(currentView.id, currentPage);
        setThreads([data]);
        const totalReplies = data.replyCount || (data.replies ? data.replies.length : 0);
        setTotalPages(Math.ceil((totalReplies + 1) / 30));
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
    loadData();
  }, [loadData]); // currentView 或 currentPage 变化时重新加载数据

  const handleThreadClick = (threadNo) => {
    navigate(`/thread/${threadNo}`); // 导航到帖子详情页
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 更新 URL 中的 page 参数
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', page);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    window.scrollTo(0, 0);
  };

  const navTitle = currentView.type === 'thread' ? `No.${currentView.id}` : currentView.name || "时间线 - X岛揭示板";

  const togglePostForm = () => setIsPostFormVisible(!isPostFormVisible);

  // 提交表单后的回调，用于刷新数据
  const handlePostSuccess = () => {
    setIsPostFormVisible(false); // 关闭表单
    loadData(); // 重新加载当前视图的数据
  };

  return (
    <>
      {/* PostForm 现在是 MainContent 的一部分，可以访问 currentView */}
      <PostForm
        isVisible={isPostFormVisible}
        onClose={togglePostForm}
        currentBoardId={currentView.type === 'board' ? currentView.id : null}
        currentThreadId={currentView.type === 'thread' ? currentView.id : null}
        onPostSuccess={handlePostSuccess}
      />

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
          <hr className="border-gray-200" />
        </React.Fragment>
      ))}

      {!isLoading && !error && threads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}


function App() {
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [boardsMenuStructure, setBoardsMenuStructure] = useState([]);
  const navigate = useNavigate(); // 用于 OffCanvasMenu 选择后导航
  const location = useLocation(); // 用于获取当前路径给 Navbar
  const { boardId, threadId } = useParams(); // 获取 URL 中的 ID

  const [navTitle, setNavTitle] = useState("时间线 - X岛揭示板");

  // 更新导航栏标题的逻辑
  // 这部分现在会在 MainContent 组件内部处理，并通过 props 传递给 Navbar（如果需要）
  // 或者 Navbar 可以直接从路由参数中获取标题信息

  // 示例：从路由参数更新导航栏标题
  useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      const currentPageViewName = searchParams.get('name'); // 假设我们把 name 也放到 URL 参数

      if (threadId) {
          setNavTitle(`No.${threadId}`);
      } else if (boardId) {
          // 你需要根据 boardId 从 boardsMenuStructure 查找版块名称
          const foundBoard = boardsMenuStructure.flatMap(cat => cat.items || []).find(b => String(b.id || b.timelineId) === String(boardId));
          setNavTitle(foundBoard ? foundBoard.name : `版块 ${boardId}`);
      } else if (currentPageViewName) {
          setNavTitle(currentPageViewName);
      }
      else {
          setNavTitle("时间线 - X岛揭示板"); // 默认标题
      }
  }, [location, boardId, threadId, boardsMenuStructure]);


  const loadBoardsMenu = useCallback(async () => {
    try {
      const boardsData = await fetchBoards();
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

  useEffect(() => {
    loadBoardsMenu();
  }, [loadBoardsMenu]);

  const toggleOffCanvas = () => setIsOffCanvasOpen(!isOffCanvasOpen);

  const handleBoardSelect = (board) => {
    // board: { name, timelineId?, id? (slug/numeric for forum), description? }
    const boardIdToNavigate = board.timelineId || board.id;
    // 将版块名称等信息也带到 URL 参数，方便 MainContent 读取
    const searchParams = new URLSearchParams();
    if (board.name) searchParams.set('name', board.name);
    if (board.description) searchParams.set('header', board.description);

    navigate(`/board/${boardIdToNavigate}?${searchParams.toString()}`);
    setIsOffCanvasOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar 标题现在从 App 的 state 读取，这个 state 会根据路由变化 */}
      <Navbar onToggleOffCanvas={toggleOffCanvas} title={navTitle} />
      <OffCanvasMenu
        isOpen={isOffCanvasOpen}
        onClose={toggleOffCanvas}
        boardStructure={boardsMenuStructure}
        onSelectBoard={handleBoardSelect}
      />

      <main className="pt-14"> {/* pt-14 for fixed navbar (h-14) */}
        <Routes>
          <Route path="/" element={<MainContent />} /> {/* 默认首页，可以重定向或展示默认版块 */}
          <Route path="/board/:boardId" element={<MainContent />} />
          <Route path="/thread/:threadId" element={<MainContent />} />
          {/* 可以添加一个 404 页面 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;