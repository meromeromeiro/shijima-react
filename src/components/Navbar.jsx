// src/components/Navbar.jsx
import React from 'react';

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);


function Navbar({ onToggleOffCanvas, title, onShowPostForm }) { // 添加 onShowPostForm prop
  return (
    <nav
      className="h-14 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 bg-gray-100 border-b border-gray-200"
    >
      <div>
        <button 
          onClick={onToggleOffCanvas} 
          className="p-2 text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>
      </div>
      <div className="flex-grow text-center">
        <h1 className="text-base font-medium text-gray-700 truncate px-2">
          {title}
        </h1>
      </div>
      <div className="w-10"> {/* 平衡汉堡按钮，或者放实际图标 */}
        {onShowPostForm && ( // 仅当提供了回调时显示
            <button
              onClick={onShowPostForm}
              className="p-2 text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="发布新内容"
            >
              <PlusIcon />
            </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;