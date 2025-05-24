import React from 'react';

// onPageChange [1,totalPages]
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(totalPages, 5);
  }
  if (currentPage > totalPages - 3) {
    startPage = Math.max(1, totalPages - 4);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const buttonBaseClass = "px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50";
  const inactiveButtonClass = "text-gray-400 cursor-not-allowed bg-gray-100";
  const activeButtonClass = "text-blue-600 hover:bg-gray-100 border border-gray-300 bg-white";
  const currentPageClass = "bg-blue-500 text-white border border-blue-500";


  return (
    <div className="px-4 py-4">
      <ul className="flex justify-center items-center space-x-1 sm:space-x-2">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`${buttonBaseClass} ${currentPage === 1 ? inactiveButtonClass : activeButtonClass}`}
            aria-label="Previous Page"
          >
            上一页
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li>
              <button onClick={() => onPageChange(1)} className={`${buttonBaseClass} ${activeButtonClass}`}>1</button>
            </li>
            {startPage > 2 && <li className="text-gray-500 px-1">...</li>}
          </>
        )}

        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`${buttonBaseClass} ${currentPage === number ? currentPageClass : activeButtonClass}`}
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </button>
          </li>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages -1 && <li className="text-gray-500 px-1">...</li>}
            <li>
              <button onClick={() => onPageChange(totalPages)} className={`${buttonBaseClass} ${activeButtonClass}`}>{totalPages}</button>
            </li>
          </>
        )}

        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`${buttonBaseClass} ${currentPage === totalPages ? inactiveButtonClass : activeButtonClass}`}
            aria-label="Next Page"
          >
            下一页
          </button>
        </li>
        
        {totalPages > 5 && currentPage < totalPages && ( // Show "末页" only if not already near end
             <li>
                <button 
                    onClick={() => onPageChange(totalPages)} 
                    className={`${buttonBaseClass} ${activeButtonClass} hidden sm:inline-block`} // Hide on very small screens if cluttered
                    aria-label="Last Page"
                >
                    末页
                </button>
            </li>
        )}
      </ul>
    </div>
  );
}

export default Pagination;