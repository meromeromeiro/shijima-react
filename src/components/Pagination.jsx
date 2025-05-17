import React from 'react';
import { Link } from 'react-router-dom'; // Or use onClick to call onPageChange

function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, bid, tid }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const handlePageClick = (e, pageNumber) => {
        e.preventDefault();
        onPageChange(pageNumber);
    };

    const pageNumbers = [];
    const maxPagesToShow = 5; // Show 5 page numbers around current, plus first/last
    let startPage, endPage;

    if (totalPages <= maxPagesToShow + 2) { // Show all pages if not too many
        startPage = 0;
        endPage = totalPages -1;
    } else {
        if (currentPage <= maxPagesToShow -2) {
            startPage = 0;
            endPage = maxPagesToShow -1 ;
        } else if (currentPage + (maxPagesToShow-1-2) >= totalPages -1) {
            startPage = totalPages - maxPagesToShow ;
            endPage = totalPages -1;
        } else {
            startPage = currentPage - Math.floor((maxPagesToShow-2)/2);
            endPage = currentPage + Math.ceil((maxPagesToShow-2)/2) -1;
        }
    }
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }


    const renderPageLink = (page, label) => {
        const isActive = page === currentPage;
        return (
            <li key={label || page} className={`${isActive ? 'uk-active bg-shijima-red-light text-white' : 'bg-shijima-light-gray hover:bg-gray-200'} border border-gray-300`}>
                <a
                    href={`/?bid=${bid}&tid=${tid}&page=${page}`}
                    onClick={(e) => handlePageClick(e, page)}
                    className={`block px-3 py-2 ${isActive ? 'text-white' : 'text-shijima-link'}`}
                >
                    {label || page + 1} {/* Display 1-based page numbers */}
                </a>
            </li>
        );
    };
     const renderDisabledLink = (label) => (
        <li className="uk-disabled bg-gray-100 text-gray-400 border border-gray-300 px-3 py-2">
            {label}
        </li>
    );


    return (
        <ul className="uk-pagination uk-pagination-left h-pagination flex justify-center space-x-1 my-6 text-sm">
            {currentPage > 0 ? renderPageLink(0, '首页') : renderDisabledLink('首页')}
            {currentPage > 0 ? renderPageLink(currentPage - 1, '上一页') : renderDisabledLink('上一页')}

            {startPage > 0 && ( // Ellipsis if not starting from first page
                 <li className="border border-gray-300 px-3 py-2">...</li>
            )}

            {pageNumbers.map(num => renderPageLink(num, num + 1))}

            {endPage < totalPages -1 && ( // Ellipsis if not ending on last page
                 <li className="border border-gray-300 px-3 py-2">...</li>
            )}


            {currentPage < totalPages - 1 ? renderPageLink(currentPage + 1, '下一页') : renderDisabledLink('下一页')}
            {currentPage < totalPages - 1 ? renderPageLink(totalPages - 1, '末页') : renderDisabledLink('末页')}
        </ul>
    );
}

export default Pagination;