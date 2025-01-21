import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Importing the icons
import { Transaction } from '../types/transaction';

interface TransactionTableProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: number) => void;
    page: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    totalTransactions: number;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    onEdit,
    onDelete,
    page,
    totalPages,
    onPageChange,
    totalTransactions,
}) => {
    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total Transactions: {totalTransactions}</span>
                <span className="text-lg font-semibold">Page {page} of {totalPages}</span>
                <div>
                    <button
                        onClick={() => onPageChange(Math.max(page - 1, 1))}
                        className="px-4 py-2 bg-[#E5D9F2] rounded-md hover:bg-[#A294F9] mr-2"
                        disabled={page === 1}
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                        className="px-4 py-2 bg-[#E5D9F2] rounded-md hover:bg-[#A294F9]"
                        disabled={page === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Transaction Table */}
            <table className="min-w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">Date</th>
                        <th className="border border-gray-300 px-4 py-2">Description</th>
                        <th className="border border-gray-300 px-4 py-2">Original Amount</th>
                        <th className="border border-gray-300 px-4 py-2">Amount in INR</th>
                        <th className="border border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-[#CDC1FF]">
                            <td className="border border-gray-300 px-4 py-2">
                                {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">{transaction.description}</td>
                            <td className="border border-gray-300 px-4 py-2">
                                {transaction.originalAmount.toFixed(2)} {transaction.currency}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                ₹{transaction.amount_in_inr.toFixed(2)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-center">
                                <button
                                    onClick={() => onEdit(transaction)}
                                    className="text-indigo-600 hover:text-indigo-800 mr-2"
                                    title="Edit"
                                >
                                    <FaEdit size={16} />
                                </button>
                                <button
                                    onClick={() => onDelete(transaction.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Delete"
                                >
                                    <FaTrashAlt size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};