import React from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  // Logic for displaying page numbers (e.g., show first, last, current, and some neighbors)
  // Simple version for now:
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

  return (
    <div className="px-4 py-3"> {/* h-threads-pagination style */}
      <ul className="flex justify-center items-center space-x-1 text-sm">
        <li>
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded ${
              currentPage === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            上一页
          </button>
        </li>

        {startPage > 1 && (
          <>
            <li>
              <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-blue-600">1</button>
            </li>
            {startPage > 2 && <li className="text-gray-500">...</li>}
          </>
        )}

        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              className={`px-3 py-1.5 rounded ${
                currentPage === number 
                  ? 'bg-blue-500 text-white border border-blue-500' 
                  : 'text-blue-600 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages -1 && <li className="text-gray-500">...</li>}
            <li>
              <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-blue-600">{totalPages}</button>
            </li>
          </>
        )}

        <li>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded ${
              currentPage === totalPages 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            下一页
          </button>
        </li>
        {/* Optional: Link to last page explicitly like in HTML */}
        {totalPages > 5 && currentPage < totalPages && (
             <li>
                <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 text-blue-600">末页</button>
            </li>
        )}
      </ul>
    </div>
  );
}

export default Pagination;