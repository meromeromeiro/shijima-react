import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PaginationProps {
    totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
    // If there's only one page or no pages, don't render pagination
    if (totalPages <= 1) {
        return null;
    }

    const [searchParams, setSearchParams] = useSearchParams();
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        // Ensure pn is a valid number and within bounds
        const pnFromParams = searchParams.get("pn");
        let pageNum = 0;
        if (pnFromParams) {
            const parsedPn = parseInt(pnFromParams, 10);
            if (!isNaN(parsedPn) && parsedPn >= 0 && parsedPn < totalPages) {
                pageNum = parsedPn;
            } else if (!isNaN(parsedPn) && parsedPn >= totalPages) { 
                // If pn from URL is out of upper bound, set to last valid page
                pageNum = totalPages - 1;
                // Optionally, update the URL to reflect the corrected page number
                // setPage((totalPages - 1).toString()); // Be careful with useEffect re-runs if you do this
            } else if (!isNaN(parsedPn) && parsedPn < 0) {
                // If pn from URL is out of lower bound, set to first page
                pageNum = 0;
                // Optionally, update the URL
                // setPage("0");
            }
            // If parsedPn is NaN, it defaults to 0
        }
        setCurrentPage(pageNum);
    }, [searchParams, totalPages]); // Added totalPages dependency

    const setPage = (pn: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev); // Create a new instance
            newParams.set("pn", pn);
            newParams.delete("r");
            return newParams;
        }); // Using replace to avoid polluting browser history
    };

    // Tailwind CSS classes (same as before)
    const buttonBaseClass = "px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50";
    const inactiveButtonClass = "text-gray-400 cursor-not-allowed bg-gray-100";
    const activeButtonClass = "text-blue-600 hover:bg-gray-100 border border-gray-300 bg-white";
    const currentPageClass = "bg-blue-500 text-white border border-blue-500";

    // --- Logic for calculating page numbers to display ---
    const MAX_VISIBLE_PAGES = 5; 
    const pageNumbersToDisplay: number[] = [];
    const halfVisible = Math.floor(MAX_VISIBLE_PAGES / 2);

    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    if (endPage - startPage + 1 < MAX_VISIBLE_PAGES) {
        if (currentPage < halfVisible) { 
            endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 1);
        } else if (currentPage >= totalPages - 1 - halfVisible) { 
            startPage = Math.max(0, endPage - MAX_VISIBLE_PAGES + 1);
        }
    }
    
    if (currentPage < MAX_VISIBLE_PAGES - halfVisible - 1 ) { 
        endPage = Math.min(totalPages - 1, MAX_VISIBLE_PAGES - 1); 
    }
    if (currentPage >= totalPages - (MAX_VISIBLE_PAGES - halfVisible -1)) { 
        startPage = Math.max(0, totalPages - MAX_VISIBLE_PAGES); 
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbersToDisplay.push(i);
    }

    const handlePageClick = (pageIndex: number) => {
        // Ensure pageIndex is within valid bounds before attempting to set
        if (pageIndex >= 0 && pageIndex < totalPages) {
            setPage(pageIndex.toString());
        }
    };
    // --- End of logic ---

    return (
        <div className="px-4 py-4">
            <ul className="flex justify-center items-center space-x-1 sm:space-x-2">
                {/* Previous Page Button */}
                {/* <li>
                    <button
                        onClick={() => handlePageClick(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`${buttonBaseClass} ${currentPage === 0 ? inactiveButtonClass : activeButtonClass}`}
                        aria-label="Previous Page"
                    >
                        上一页
                    </button>
                </li> */}

                {/* First Page Button & Ellipsis (if needed at the start) */}
                {startPage > 0 && (
                    <>
                        <li>
                            <button onClick={() => handlePageClick(0)} className={`${buttonBaseClass} ${activeButtonClass}`}>
                                1 {/* Display 1 for page index 0 */}
                            </button>
                        </li>
                        {startPage > 1 && <li className="text-gray-500 px-1 select-none">...</li>}
                    </>
                )}

                {/* Page Number Buttons */}
                {pageNumbersToDisplay.map(pageIndex => (
                    <li key={`page-${pageIndex}`}>
                        <button
                            onClick={() => handlePageClick(pageIndex)}
                            className={`${buttonBaseClass} ${currentPage === pageIndex ? currentPageClass : activeButtonClass}`}
                            aria-current={currentPage === pageIndex ? "page" : undefined}
                        >
                            {pageIndex + 1} {/* Display 1-based number */}
                        </button>
                    </li>
                ))}

                {/* Ellipsis & Last Page Button (if needed at the end) */}
                {endPage < totalPages - 1 && (
                    <>
                        {endPage < totalPages - 2 && <li className="text-gray-500 px-1 select-none">...</li>}
                        <li>
                            <button onClick={() => handlePageClick(totalPages - 1)} className={`${buttonBaseClass} ${activeButtonClass}`}>
                                {totalPages} {/* Display total number of pages */}
                            </button>
                        </li>
                    </>
                )}

                {/* Next Page Button */}
                {/* <li>
                    <button
                        onClick={() => handlePageClick(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`${buttonBaseClass} ${currentPage === totalPages - 1 ? inactiveButtonClass : activeButtonClass}`}
                        aria-label="Next Page"
                    >
                        下一页
                    </button>
                </li> */}

                {/* "Last Page" (末页) Button - shown if many pages and not near the end */}
                {/* {totalPages > MAX_VISIBLE_PAGES && currentPage < totalPages - 1 && (
                    <li>
                        <button
                            onClick={() => handlePageClick(totalPages - 1)}
                            className={`${buttonBaseClass} ${activeButtonClass} hidden sm:inline-block`}
                            aria-label="Last Page"
                        >
                            末页
                        </button>
                    </li>
                )} */}
            </ul>
        </div>
    );
}

export default Pagination;