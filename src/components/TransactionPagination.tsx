import React from 'react';

interface TransactionPaginationProps {
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TransactionPagination: React.FC<TransactionPaginationProps> = ({
    total,
    page,
    limit,
    onPageChange,
    onLimitChange
}) => {
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center">
            <span className="text-gray-700">Total Transactions: {total}</span>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <button
                    onClick={() => onPageChange(Math.max(page - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Next
                </button>
            </div>

            <div className="flex items-center gap-2 mt-4 md:mt-0">
                <span className="text-gray-700">Rows per page:</span>
                <select
                    value={limit}
                    onChange={onLimitChange}
                    className="px-3 py-2 bg-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                >
                    {[5, 10, 25, 50, 100].map((value) => (
                        <option key={value} value={value}>{value}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};