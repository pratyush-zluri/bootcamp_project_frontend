import React, { useState, useEffect } from 'react';
import { CSVUpload } from '../components/CSVUpload';
import { transactionApi } from '../api/transactionApi';
import { Transaction, TransactionCreateDTO, TransactionUpdateDTO } from '../types/transaction';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Search, Download, Plus, Trash2 } from 'lucide-react';
import { TransactionForm } from '../components/TransactionForm';

const Dashboard: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadSummary, setUploadSummary] = useState<{
        message: string;
        repeats: Transaction[];
        errors: string[];
    } | null>(null);

    const fetchTransactions = async () => {
        try {
            const response = await transactionApi.getTransactions(page, limit);
            setTransactions(response?.transactions ?? []);
            setTotal(response?.total ?? 0);
        } catch (error) {
            let errorMessage = 'Failed to fetch transactions.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    const searchTransactions = async (query: string) => {
        try {
            const response = await transactionApi.searchTransactions(query);
            setTransactions(response);
        } catch (error) {
            let errorMessage = 'Failed to search transactions.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            toast.error(errorMessage);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, limit]);

    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showForm]);

    const handleAddTransaction = async (transaction: TransactionCreateDTO) => {
        try {
            await transactionApi.addTransaction(transaction);
            toast.success('Transaction added successfully!');
            setShowForm(false);
            fetchTransactions();
        } catch (error) {
            let errorMessage = 'Failed to add transaction.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                const apiError = (error as { response: { data: { error: string } } }).response.data.error;
                if (apiError === 'Transaction already exists') {
                    errorMessage = apiError;
                }
            }
            toast.error(errorMessage);
        }
    };

    const handleUpdateTransaction = async (transaction: TransactionUpdateDTO) => {
        if (selectedTransaction) {
            try {
                await transactionApi.updateTransaction(selectedTransaction.id, transaction);
                toast.success('Transaction updated successfully!');
                setShowForm(false);
                setSelectedTransaction(null);
                fetchTransactions();
            } catch (error) {
                let errorMessage = 'Failed to update transaction.';
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === 'object' && error !== null && 'response' in error) {
                    errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
                }
                toast.error(errorMessage);
            }
        }
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setShowForm(true);
    };

    const handleDeleteTransaction = async (id: number) => {
        try {
            await transactionApi.softDeleteTransaction(id);
            toast.success('Transaction deleted successfully!');
            fetchTransactions();
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

    const handleBatchDeleteTransactions = async () => {
        try {
            if (selectedTransactions.length === 0) {
                toast.error('No transactions selected for deletion.');
                return;
            }

            await transactionApi.softDeleteBatchTransactions(selectedTransactions);
            toast.success('Selected transactions deleted successfully!');
            setSelectedTransactions([]);
            fetchTransactions();
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

    const handleCSVUpload = async (file: File): Promise<{ message: string; repeats: Transaction[]; errors: string[] }> => {
        try {
            const response = await transactionApi.uploadCSV(file);
            if (!response) {
                throw new Error('Undefined response from API.');
            }

            const result = {
                message: response.message || 'CSV uploaded successfully!',
                repeats: response.repeats || [],
                errors: response.errors || [],
            };

            toast.success(result.message);
            fetchTransactions();
            setUploadSummary(result); // Set the upload summary
            return result;
        } catch (error) {
            let errorMessage = 'Failed to upload CSV.';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
            }
            const result = {
                message: errorMessage,
                repeats: [],
                errors: [errorMessage],
            };
            toast.error(result.message);
            return result;
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

    const handleCheckboxChange = (id: number) => {
        setSelectedTransactions((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((transactionId) => transactionId !== id);
            }
            return [...prevSelected, id];
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchTerm(query);
        searchTransactions(query);
    };

    const handleGetUploadLogs = () => {
        if (uploadSummary) {
            const summaryJson = JSON.stringify(uploadSummary, null, 2);
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.open();
                newWindow.document.write(`<pre>${summaryJson}</pre>`);
                newWindow.document.close();
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#F5EFFF' }}>
            <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold text-indigo-600 text-center mb-8"
            >
                Transactions Dashboard
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-center">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

                <div className="flex justify-center md:justify-end gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => transactionApi.downloadCSV()}
                        className="flex items-center px-4 py-2 bg-indigo-300 text-white rounded-lg hover:bg-indigo-400 transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setShowForm(true);
                            setSelectedTransaction(null);
                        }}
                        className="flex items-center px-4 py-2 bg-indigo-300 text-white rounded-lg hover:bg-indigo-400 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBatchDeleteTransactions}
                        className="flex items-center px-4 py-2 bg-indigo-300 text-white rounded-lg hover:bg-indigo-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedTransactions.length === 0}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected ({selectedTransactions.length})
                    </motion.button>
                </div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                <CSVUpload onUpload={handleCSVUpload} />
                {uploadSummary && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleGetUploadLogs}
                            className="px-4 py-2 bg-indigo-300 text-white rounded-md hover:bg-indigo-400"
                        >
                            Get Upload Logs
                        </button>
                    </div>
                )}
            </motion.div>


            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center">
                        <span className="text-gray-700">Total Transactions: {total}</span>

                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <button
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1}
                                className="px-4 py-2 bg-indigo-300 text-white rounded-lg hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page >= totalPages}
                                className="px-4 py-2 bg-indigo-300 text-white rounded-lg hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <span className="text-gray-700">Rows per page:</span>
                            <select
                                value={limit}
                                onChange={handleLimitChange}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {[5, 10, 25, 50, 100].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200 text-left">
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
                            <tr key={transaction.id} className="border-b hover:bg-indigo-100">
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
                                            onClick={() => handleEditTransaction(transaction)}
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <TransactionForm
                            onSubmit={selectedTransaction ? handleUpdateTransaction : handleAddTransaction}
                            onCancel={() => {
                                setShowForm(false);
                                setSelectedTransaction(null);
                            }}
                            initialData={selectedTransaction || undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;