import React from 'react';
import { Transaction } from '../types/transaction';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';

export interface TransactionTableProps {
    transactions: Transaction[];
    isLoadingNewPage: boolean;
    selectedTransactions: number[];
    onCheckboxChange: (id: number) => void;
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transaction: Transaction) => void;
    onSelectAll: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
    transactions,
    isLoadingNewPage,
    selectedTransactions,
    onCheckboxChange,
    onEditTransaction,
    onDeleteTransaction,
    onSelectAll
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">
            {isLoadingNewPage && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" />
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-4 py-2 w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                                    onChange={onSelectAll}
                                    className="cursor-pointer"
                                />
                            </th>
                            <th className="px-4 py-2 w-1/3">Description</th>
                            <th className="px-4 py-2 w-24">Date</th>
                            <th className="px-4 py-2 w-32">Original Amount</th>
                            <th className="px-4 py-2 w-24">Currency</th>
                            <th className="px-4 py-2 w-32">Amount (INR)</th>
                            <th className="px-4 py-2 w-24">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className={`border-b hover:bg-indigo-100 group ${isLoadingNewPage ? 'opacity-50' : ''}`}
                                >
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedTransactions.includes(transaction.id)}
                                            onChange={() => onCheckboxChange(transaction.id)}
                                            className="cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-4 py-2 truncate">
                                        <div className="max-w-xs truncate" title={transaction.description}>
                                            {transaction.description}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{formatDate(transaction.date)}</td>
                                    <td className="px-4 py-2">{transaction.originalAmount}</td>
                                    <td className="px-4 py-2">{transaction.currency}</td>
                                    <td className="px-4 py-2">₹ {transaction.amount_in_inr}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => onEditTransaction(transaction)}
                                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                <FaPencilAlt className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteTransaction(transaction)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <FaTrashAlt className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};