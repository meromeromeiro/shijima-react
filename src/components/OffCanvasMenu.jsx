import React from 'react';
import { getCookie } from '../services/api'
// You might want different icons for these functional links if desired
// For example, an UploadIcon, CookieIcon, TrashIcon, ArrowUturnLeftIcon

function OffCanvasMenu({ isOpen, onClose, boardStructure, onSelectBoard }) {
  // onNavigate will be a function passed from App.jsx to handle navigation for functional links
  // e.g., onNavigate('/image-host') or onNavigate('/settings/cookie')

  const functionalLinks = [
    { id: 'image-host', name: "图床", path: "https://upload.moonchan.xyz/" }, // Example path
    { id: 'get-cookie', name: "获得Cookie", action: 'getCookie' }, // Action to trigger a function
    { id: 'self-delete', name: "自助删除", path: "https://moonchan.xyz/del.html" }, // Example path
    { id: 'old-version', name: "返回旧版", href: "https://moonchan.xyz/old.html" } // External link
  ];

  const handleFunctionalLinkClick = async (link) => {
    if (link.href) {
      window.location.href = link.href; // For external links
    } else if (link.path) {
      window.open(link.path)
    } else if (link.action) { // getCookie
      await getCookie()
    }
    onClose(); // Close menu after action/navigation
  };


  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black z-[55] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-xl z-[60] overflow-y-auto transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Section for Board Selection */}
        <div className="px-4 pt-4 pb-2 text-sm font-semibold text-gray-700">
          选择版块
        </div>
        {(!boardStructure || boardStructure.length === 0) ? (
          <div className="px-4 py-3 text-sm text-gray-500">加载中或无版块...</div>
        ) : (
          <ul className="text-sm py-1 border-b border-gray-200 mb-2"> {/* Added border and margin */}
            {boardStructure.map((boardCategory) => ( // Assuming boardStructure is still categories
              <li key={boardCategory.name} className="mb-1">
                {/* Category Header (if your boardStructure has categories) */}
                {boardCategory.isCategoryHeader && (
                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    {boardCategory.name}
                  </div>
                )}
                {/* Items within the category */}
                <ul className={boardCategory.isCategoryHeader ? "pl-2" : ""}>
                  {(boardCategory.items || [boardCategory]).map((board) => ( // Handle flat list or categorized list
                    <li key={board.id || board.name}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onSelectBoard(board);
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
            ))}
          </ul>
        )}

        {/* Section for Functional Links */}
        <div className="px-4 pt-2 pb-2 text-sm font-semibold text-gray-700">
          功能选项
        </div>
        <ul className="text-sm py-1">
          {functionalLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.href || '#'} // Use href if it's an external link
                onClick={(e) => {
                  if (!link.href) e.preventDefault(); // Prevent default for SPA actions/navigation
                  handleFunctionalLinkClick(link);
                }}
                target={link.href ? '_blank' : '_self'} // Open external links in new tab
                rel={link.href ? 'noopener noreferrer' : undefined}
                className="block px-4 py-2.5 text-gray-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 truncate"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default OffCanvasMenu;