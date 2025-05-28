import React, { useState } from 'react'; // 引入 useState 和 useEffect
import { getCookie } from '../services/api';
import { useBoardStorage } from './useBoardStorage'; // 假设你的 Hook 文件名为 useBoardStorage.ts

function OffCanvasMenu({ isOpen, onClose, boardStructure, onSelectBoard }) {
  const [boards, addBoard, removeBoard] = useBoardStorage();

  // 新增状态：控制“添加板块”模态框的显示
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [newBoardIdInput, setNewBoardIdInput] = useState('');
  const [newBoardTitleInput, setNewBoardTitleInput] = useState('');
  const [addBoardError, setAddBoardError] = useState('');

  const functionalLinks = [
    { id: 'add-board', name: "添加板块", action: 'addBoard' },
    { id: 'image-host', name: "图床", href: "https://upload.moonchan.xyz/" },
    { id: 'get-cookie', name: "获得Cookie", action: 'getCookie' },
    { id: 'self-delete', name: "自助删除", href: "https://moonchan.xyz/del.html" },
    { id: 'old-version', name: "返回旧版", path: "/old.html" }
  ];

  const handleFunctionalLinkClick = async (link) => {
    if (link.href) {
      window.location.href = link.href;
    } else if (link.path) {
      window.location.pathname = link.path;
    } else if (link.action) {
      switch (link.action) {
        case 'getCookie':
          await getCookie();
          break;
        case 'addBoard':
          // 打开模态框，并关闭主菜单
          setShowAddBoardModal(true);
          // 确保输入框是空的，以便新添加
          setNewBoardIdInput('');
          setNewBoardTitleInput('');
          setAddBoardError(''); // 清空之前的错误信息
          break;
        default:
          break;
      }
    }
    // 只有在不是打开添加板块模态框的情况下才关闭主菜单
    // 因为打开模态框时主菜单也需要关闭
    if (link.action !== 'addBoard') {
        onClose();
    }
  };

  // 处理模态框提交
  const handleAddBoardSubmit = () => {
    setAddBoardError(''); // 清空之前的错误

    const id = parseInt(newBoardIdInput, 10);
    const title = newBoardTitleInput.trim();

    // 验证 ID
    if (isNaN(id) || id <= 0) {
      setAddBoardError("板块 ID 必须是大于 0 的纯数字。");
      return;
    }

    // 验证标题
    if (!title) {
      setAddBoardError("板块标题不能为空。");
      return;
    }

    // 提示用户如果 ID 已存在会覆盖
    if (boards[id.toString()] && !confirm(`板块 ID ${id} 已存在，继续将更新其标题。确定吗？`)) {
        setAddBoardError("操作已取消。");
        return;
    }

    // 调用 Hook 提供的 addBoard 函数
    addBoard(id, title);
    // 成功后关闭模态框
    setShowAddBoardModal(false);
    onClose(); // 添加成功后关闭主菜单
  };

  // 关闭模态框并重置状态
  const handleCloseAddBoardModal = () => {
    setShowAddBoardModal(false);
    setNewBoardIdInput('');
    setNewBoardTitleInput('');
    setAddBoardError('');
  };


  return (
    <>
      {/* Overlay for OffCanvasMenu */}
      <div
        className={`fixed inset-0 bg-gray-500 bg-opacity-500 z-[55] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-50' : ' opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-xl z-[60] overflow-y-auto transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Section for Board Selection */}
        <div className="px-4 pt-4 pb-2 text-sm font-semibold text-gray-700">
          选择版块
        </div>
        <ul className="text-sm py-1 border-b border-gray-200 mb-2">
          {/* 现有 boardStructure 的映射 */}
          {(!boardStructure || boardStructure.length === 0) ? (
            <li className="px-4 py-3 text-gray-500">加载中或无版块...</li>
          ) : (
            boardStructure.map((boardCategory) => (
              <li key={boardCategory.name} className="mb-1">
                {boardCategory.isCategoryHeader && (
                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    {boardCategory.name}
                  </div>
                )}
                <ul className={boardCategory.isCategoryHeader ? "pl-2" : ""}>
                  {(boardCategory.items || [boardCategory]).map((board) => (
                    <li key={board.id || board.name}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectBoard(board);
                          onClose();
                        }}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 truncate"
                        title={board.description || board.name}
                      >
                        {board.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
          {/* 新增的自定义看板部分，从 useBoardStorage 获取 */}
          {Object.entries(boards).map(([id, title]) => (
            <li key={`custom-board-${id}`}>
              <div className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none hover:bg-gray-200">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectBoard({ id: parseInt(id), name: title });
                    onClose();
                  }}
                  className="flex-grow truncate cursor-pointer pr-2"
                  title={title}
                >
                  {title}
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBoard(parseInt(id));
                  }}
                  className="ml-auto p-1 text-xs text-gray-400 hover:text-red-500 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                  aria-label={`删除自定义看板 ${title}`}
                  title={`删除 ${title}`}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Section for Functional Links */}
        <div className="px-4 pt-2 pb-2 text-sm font-semibold text-gray-700">
          功能选项
        </div>
        <ul className="text-sm py-1">
          {functionalLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.href || '#'}
                onClick={(e) => {
                  if (!link.href) e.preventDefault();
                  handleFunctionalLinkClick(link);
                }}
                target={link.href ? '_blank' : '_self'}
                rel={link.href ? 'noopener noreferrer' : undefined}
                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 truncate"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Board Modal */}
      {showAddBoardModal && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center" // 更高的 z-index 确保在侧边栏之上
          onClick={handleCloseAddBoardModal} // 点击背景关闭
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl w-80 max-w-sm relative"
            onClick={(e) => e.stopPropagation()} // 阻止事件冒泡到背景
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800">添加/编辑板块</h3>
            {addBoardError && (
              <p className="text-red-500 text-sm mb-3">{addBoardError}</p>
            )}
            <div className="mb-4">
              <label htmlFor="board-id" className="block text-sm font-medium text-gray-700 mb-1">板块 ID:</label>
              <input
                type="number"
                id="board-id"
                value={newBoardIdInput}
                onChange={(e) => setNewBoardIdInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例如: 10001"
                min="1"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="board-title" className="block text-sm font-medium text-gray-700 mb-1">板块标题:</label>
              <input
                type="text"
                id="board-title"
                value={newBoardTitleInput}
                onChange={(e) => setNewBoardTitleInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="例如: 我的自定义板块"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseAddBoardModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleAddBoardSubmit}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
              >
                确定
              </button>
            </div>
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
                onClick={handleCloseAddBoardModal}
                aria-label="关闭"
            >
                ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default OffCanvasMenu;