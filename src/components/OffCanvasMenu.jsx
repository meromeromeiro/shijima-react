import React, { useState } from 'react';

// Simple ChevronDown Icon
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block ml-1">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block ml-1">
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );

// Hardcoded board data as per HTML structure
const initialBoardStructure = [
    {
        name: "时间线",
        items: [
            { name: "综合线", timelineId: 1, description: "不包含部分特殊版块" },
            { name: "创作线", timelineId: 2, description: "创作相关内容" },
            { name: "非创作线", timelineId: 3, description: "非创作内容讨论" },
            { name: "亚文化线", timelineId: 4, description: "亚文化相关内容" },
            { name: "综合2线", timelineId: 5, description: "综合版2" },
            { name: "游戏线", timelineId: 6, description: "游戏相关讨论" },
            { name: "生活线", timelineId: 7, description: "生活日常分享" },
        ],
    },
    {
        name: "亚文化",
        items: [
            { name: "婆罗门一", id: "F_婆罗门一", slug: "婆罗门一" }, // Assuming API can take slug or you map it
            { name: "漫画", id: "F_漫画", slug: "漫画" },
            { name: "动画综合", id: "F_动画综合", slug: "动画综合" },
            // ... add all others
        ],
    },
    // ... Add other main categories (综合, 创作, 游戏, 生活, 管理)
    {
        name: "功能",
        isHeader: true, // Special handling for headers if they are not parents
        items: [
            { name: "用户系统(new)", href: "/Member", specialStyle: "text-red-500" },
            { name: "手机版(new)", href: "/Mobile" },
            { name: "普通版", href: "/Forum" },
            { name: "订阅", href: "/feed" },
        ],
    },
];


function OffCanvasMenu({ isOpen, onClose, onSelectBoard }) {
  const [openCategories, setOpenCategories] = useState({}); // e.g. { "时间线": true }

  const toggleCategory = (categoryName) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };
  
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
        onClick={onClose}
      ></div>
      {/* Menu */}
      <div 
        className="fixed top-0 left-0 h-full w-64 bg-gray-50 shadow-lg z-[60] overflow-y-auto transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)', backgroundColor: '#f5f5f5' }} // uk-offcanvas-bar has a light gray
      >
        <ul className="text-sm">
          {initialBoardStructure.map((category, index) => (
            <li key={index} className={category.isHeader ? "px-4 py-2 text-gray-500 font-semibold mt-2" : ""}>
              {category.isHeader ? (
                category.name
              ) : (
                <button 
                  onClick={() => toggleCategory(category.name)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-200 flex justify-between items-center font-medium text-gray-700"
                >
                  {category.name}
                  {openCategories[category.name] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </button>
              )}
              {/* Sub-menu */}
              {(!category.isHeader && openCategories[category.name]) && (
                <ul className="bg-white"> {/* Simulating uk-nav-sub style */}
                  {category.items.map((item, subIndex) => (
                    <li key={subIndex}>
                      <a
                        href={item.href || '#'} // Use href if it's a direct link
                        onClick={(e) => {
                          if (!item.href) { // Only call onSelectBoard if it's not a direct link
                            e.preventDefault();
                            // Pass the whole item or necessary parts
                            onSelectBoard({ 
                                timelineId: item.timelineId, 
                                id: item.id, // forum id or slug
                                name: item.name,
                                description: item.description // if available
                            });
                          }
                        }}
                        className={`block px-6 py-2 text-gray-600 hover:bg-gray-100 ${item.specialStyle || ''}`}
                        style={{ paddingLeft: '1.5rem' }} // uk-nav-sub padding
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {/* For header type categories that are not collapsible */}
              {(category.isHeader && category.items) && (
                 <ul>
                    {category.items.map((item, subIndex) => (
                        <li key={subIndex}>
                        <a
                            href={item.href || '#'}
                            onClick={(e) => { if (!item.href) e.preventDefault(); /* Potentially handle other actions */ }}
                            className={`block px-4 py-2 text-gray-600 hover:bg-gray-100 ${item.specialStyle || ''}`}
                        >
                            {item.name}
                        </a>
                        </li>
                    ))}
                 </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default OffCanvasMenu;