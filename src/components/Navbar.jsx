import React from 'react';

// A simple SVG hamburger icon
const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

function Navbar({ onToggleOffCanvas, title }) {
  return (
    <nav 
      className="h-14 fixed top-0 left-0 right-0 z-50 flex items-center px-2 bg-h-navbar-bg border-b border-h-navbar-border"
      style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #e7e7e7' }} // Replicating uk-navbar-attached style
    >
      <div className="uk-navbar-nav">
        <button onClick={onToggleOffCanvas} className="p-2 text-gray-600 hover:text-gray-800">
          <HamburgerIcon />
        </button>
      </div>
      {/* Flip items can be added here if needed */}
      {/* <div className="ml-auto"> <ul className="flex items-center"></ul> </div> */}
      <div className="flex-grow text-center text-gray-700 font-medium truncate px-2 h-navbar-content" style={{fontSize: '16px'}}>
        {title}
      </div>
      {/* Add an empty div to balance the hamburger button space for centering if no right items */}
      <div className="w-10"></div> 
    </nav>
  );
}

export default Navbar;