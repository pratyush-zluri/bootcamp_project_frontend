import React, { useState, useEffect } from 'react';
import { transactionApi } from '../api/transactionApi';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';

const SoftDeletedTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
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

    const handleBatchRestoreTransactions = async () => {
        try {
            if (selectedTransactions.length === 0) {
                toast.error('No transactions selected for restoration.');
                return;
            }

            await transactionApi.batchRestoreTransactions(selectedTransactions);
            toast.success('Selected transactions restored successfully!');
            setSelectedTransactions([]);
            fetchSoftDeletedTransactions();
        } catch (error) {
            let errorMessage = 'Failed to restore selected transactions.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    const handleBatchHardDeleteTransactions = async () => {
        try {
            if (selectedTransactions.length === 0) {
                toast.error('No transactions selected for deletion.');
                return;
            }

            await transactionApi.batchHardDeleteTransactions(selectedTransactions);
            toast.success('Selected transactions permanently deleted!');
            setSelectedTransactions([]);
            fetchSoftDeletedTransactions();
        } catch (error) {
            let errorMessage = 'Failed to delete selected transactions.';
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

    const handleCheckboxChange = (id: number) => {
        setSelectedTransactions((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((transactionId) => transactionId !== id);
            }
            return [...prevSelected, id];
        });
    };

    const totalPages = Math.ceil(total / limit);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    return (
        <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#F5EFFF' }}>
            <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold text-gray-800 text-center mb-8"
            >
                Soft Deleted Transactions
            </motion.h1>

            <div className="flex justify-center mb-4">
                <button
                    onClick={handleBatchRestoreTransactions}
                    className="flex items-center px-4 py-2 bg-[#E5D9F2] text-white rounded-lg hover:bg-[#A294F9] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedTransactions.length === 0}
                >
                    Restore Selected ({selectedTransactions.length})
                </button>

                <button
                    onClick={handleBatchHardDeleteTransactions}
                    className="flex items-center px-4 py-2 bg-[#E5D9F2] text-white rounded-lg hover:bg-[#A294F9] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    disabled={selectedTransactions.length === 0}
                >
                    Delete Selected ({selectedTransactions.length})
                </button>
            </div>

            <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center">
                <span className="text-gray-700">Total Transactions: {total}</span>

                <div className="flex items-center gap-4 mt-4 md:mt-0">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-[#E5D9F2] text-white rounded-lg hover:bg-[#A294F9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={page >= totalPages}
                        className="px-4 py-2 bg-[#E5D9F2] text-white rounded-lg hover:bg-[#A294F9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Next
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <span className="text-gray-700">Rows per page:</span>
                    <select
                        value={limit}
                        onChange={handleLimitChange}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A294F9]"
                    >
                        {[5, 10, 25, 50, 100].map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                                        onChange={() => {
                                            if (selectedTransactions.length === transactions.length) {
                                                setSelectedTransactions([]);
                                            } else {
                                                setSelectedTransactions(transactions.map((transaction) => transaction.id));
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                </th>
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
                                <tr key={transaction.id} className="border-b hover:bg-[#CDC1FF]">
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedTransactions.includes(transaction.id)}
                                            onChange={() => handleCheckboxChange(transaction.id)}
                                            className="cursor-pointer"
                                        />
                                    </td>
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
            </div>
        </div>
    );
};

export default SoftDeletedTransactions;