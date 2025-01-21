import React, { useState, useEffect } from 'react';
import { transactionApi } from '../api/transactionApi';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';

const SoftDeletedTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);

    const fetchSoftDeletedTransactions = async () => {
        try {
            const response = await transactionApi.getSoftDeletedTransactions(page, limit);
            setTransactions(response?.transactions ?? []);
            setTotal(response?.total ?? 0);
        } catch (error) {
            let errorMessage = 'Failed to fetch soft-deleted transactions.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchSoftDeletedTransactions();
    }, [page, limit]);

    const handleRestoreTransaction = async (id: number) => {
        try {
            await transactionApi.restoreTransaction(id);
            toast.success('Transaction restored successfully!');
            fetchSoftDeletedTransactions();
        } catch (error) {
            let errorMessage = 'Failed to restore transaction.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    const handleHardDeleteTransaction = async (id: number) => {
        try {
            await transactionApi.hardDeleteTransaction(id);
            toast.success('Transaction permanently deleted!');
            fetchSoftDeletedTransactions();
        } catch (error) {
            let errorMessage = 'Failed to delete transaction.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(parseInt(e.target.value, 10));
        setPage(1);
    };

    const totalPages = Math.ceil(total / limit);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold text-gray-800 text-center mb-8"
            >
                Soft Deleted Transactions
            </motion.h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2">Description</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Original Amount</th>
                                <th className="px-4 py-2">Currency</th>
                                <th className="px-4 py-2">Amount (INR)</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 break-words max-w-xs">
                                        {transaction.description}
                                    </td>
                                    <td className="px-4 py-2">{formatDate(transaction.date)}</td>
                                    <td className="px-4 py-2">{transaction.originalAmount}</td>
                                    <td className="px-4 py-2">{transaction.currency}</td>
                                    <td className="px-4 py-2">₹ {transaction.amount_in_inr}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestoreTransaction(transaction.id)}
                                                className="text-green-600 hover:text-green-800 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleHardDeleteTransaction(transaction.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center">
                    <span className="text-gray-700">Total Transactions: {total}</span>

                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page >= totalPages}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <span className="text-gray-700">Rows per page:</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {[5, 10, 25, 50, 100].map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoftDeletedTransactions;