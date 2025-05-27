const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const PlusIcon = () => ( // 发帖/回复图标
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

function Navbar({ onToggleOffCanvas, title, onTogglePostForm }) { // 添加 onTogglePostForm
  return (
    <nav 
      className="h-14 fixed top-0 left-0 lg:left-64 right-0 z-50 flex items-center justify-between px-2 bg-gray-100 border-b border-gray-200"
    >
      {/* Left section for hamburger */}
      <div className="lg:invisible">
        <button 
          onClick={onToggleOffCanvas} 
          className="p-2 text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Open menu"
        >
          <HamburgerIcon />
        </button>
      </div>
      
      {/* Center section for title */}
      <div className="flex-grow text-center">
        <h1 className="text-base font-medium text-gray-700 truncate px-2">
          {title}
        </h1>
      </div>
      
      {/* Right section for Post button */}
      <div className="w-10">
        <button
          onClick={onTogglePostForm}
          className="p-2 text-gray-600 rounded-md hover:bg-gray-200 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Post new content or reply"
        >
          <PlusIcon />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;