import React, { useState, useEffect } from 'react';
import { transactionApi } from '../api/TransactionApi';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Trash2, RefreshCw } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const SoftDeletedTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
    const [isBatchRestoreModalOpen, setIsBatchRestoreModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
    const [transactionToRestore, setTransactionToRestore] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSoftDeletedTransactions = async () => {
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSoftDeletedTransactions();
    }, [page, limit]);

    const handleRestoreTransaction = async () => {
        if (transactionToRestore !== null) {
            try {
                await transactionApi.restoreTransaction(transactionToRestore);
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
            setTransactionToRestore(null);
            setIsRestoreModalOpen(false);
        }
    };

    const handleHardDeleteTransaction = async () => {
        if (transactionToDelete !== null) {
            try {
                await transactionApi.hardDeleteTransaction(transactionToDelete);
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
            setTransactionToDelete(null);
            setIsDeleteModalOpen(false);
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
        setIsBatchRestoreModalOpen(false);
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
        setIsBatchDeleteModalOpen(false);
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
                className="text-3xl font-bold text-indigo-600 text-center mb-8"
            >
                Deleted Transactions
            </motion.h1>

            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setIsBatchRestoreModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedTransactions.length === 0}
                >
                    Restore Selected ({selectedTransactions.length})
                </button>

                <button
                    onClick={() => setIsBatchDeleteModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-4"
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
                                <th className="px-4 py-2 w-1/3">Description</th>
                                <th className="px-4 py-2 w-24">Date</th>
                                <th className="px-4 py-2 w-32">Original Amount</th>
                                <th className="px-4 py-2 w-24">Currency</th>
                                <th className="px-4 py-2 w-32">Amount (INR)</th>
                                <th className="px-4 py-2 w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" />
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <div className="w-4 h-4 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                        <p className="mt-2 text-gray-600">Loading transactions...</p>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-600">
                                        No deleted transactions found.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="group border-b hover:bg-indigo-100">
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedTransactions.includes(transaction.id)}
                                                onChange={() => handleCheckboxChange(transaction.id)}
                                                className="cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="max-w-xs truncate" title={transaction.description}>
                                                {transaction.description}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">{formatDate(transaction.date)}</td>
                                        <td className="px-4 py-2">{transaction.originalAmount}</td>
                                        <td className="px-4 py-2">{transaction.currency}</td>
                                        <td className="px-4 py-2">₹ {transaction.amount_in_inr}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100">
                                                <button
                                                    onClick={() => {
                                                        setTransactionToRestore(transaction.id);
                                                        setIsRestoreModalOpen(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-800 transition-colors"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setTransactionToDelete(transaction.id);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
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

            {isRestoreModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to restore this transaction?"
                    onConfirm={handleRestoreTransaction}
                    onCancel={() => setIsRestoreModalOpen(false)}
                />
            )}

            {isDeleteModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to delete this transaction?"
                    onConfirm={handleHardDeleteTransaction}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}

            {isBatchRestoreModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to restore the selected transactions?"
                    onConfirm={handleBatchRestoreTransactions}
                    onCancel={() => setIsBatchRestoreModalOpen(false)}
                />
            )}

            {isBatchDeleteModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to delete the selected transactions?"
                    onConfirm={handleBatchHardDeleteTransactions}
                    onCancel={() => setIsBatchDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SoftDeletedTransactions;