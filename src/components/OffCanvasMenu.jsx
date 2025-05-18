import React, { useState } from 'react';

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
  </svg>
);

function OffCanvasMenu({ isOpen, onClose, boardStructure, onSelectBoard }) {
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (categoryName) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };
  
  // No need for initialBoardStructure, it comes from props as boardStructure now

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
        <ul className="text-sm py-2">
          {boardStructure.map((category, index) => (
            <li key={index}>
              {category.isHeaderOnly ? ( // For "功能" like headers that are not expandable
                <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    {category.name}
                </div>
              ) : (
                <button 
                  onClick={() => toggleCategory(category.name)}
                  className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-200 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-medium">{category.name}</span>
                  {openCategories[category.name] ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </button>
              )}
              
              {/* Sub-menu for expandable categories */}
              {(!category.isHeaderOnly && openCategories[category.name] && category.items) && (
                <ul className="bg-white pl-4 border-l-2 border-gray-200 ml-2">
                  {category.items.map((item, subIndex) => (
                    <li key={subIndex}>
                      <a
                        href={item.href || '#'}
                        onClick={(e) => {
                          if (!item.href) {
                            e.preventDefault();
                            onSelectBoard(item); // Pass the whole item
                          }
                          // If it has href, let default browser navigation occur.
                        }}
                        className={`block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 ${item.specialStyle || ''} truncate`}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {/* Sub-menu for header-only categories (like "功能") */}
               {(category.isHeaderOnly && category.items) && (
                 <ul className="pl-2">
                    {category.items.map((item, subIndex) => (
                        <li key={subIndex}>
                        <a
                            href={item.href || '#'}
                            onClick={(e) => { if (!item.href) e.preventDefault(); }}
                            className={`block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600 ${item.specialStyle || ''} truncate`}
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