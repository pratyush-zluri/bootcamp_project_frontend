// src/pages/Dashboard.tsx
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

    const filteredTransactions = transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.currency.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchTransactions = async () => {
        try {
            const response = await transactionApi.getTransactions(page, limit);
            setTransactions(response?.transactions ?? []);
            setTotal(response?.total ?? 0);
        } catch {
            toast.error("Failed to fetch transactions.");
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
            toast.success("Transaction added successfully!");
            setShowForm(false);
            fetchTransactions();
        } catch {
            toast.error("Failed to add transaction.");
        }
    };

    const handleUpdateTransaction = async (transaction: TransactionUpdateDTO) => {
        if (selectedTransaction) {
            try {
                await transactionApi.updateTransaction(selectedTransaction.id, transaction);
                toast.success("Transaction updated successfully!");
                setShowForm(false);
                setSelectedTransaction(null);
                fetchTransactions();
            } catch {
                toast.error("Failed to update transaction.");
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
            toast.success("Transaction deleted successfully!");
            fetchTransactions();
        } catch {
            toast.error("Failed to delete transaction.");
        }
    };

    const handleBatchDeleteTransactions = async () => {
        try {
            if (selectedTransactions.length === 0) {
                toast.error("No transactions selected for deletion.");
                return;
            }

            await transactionApi.softDeleteBatchTransactions(selectedTransactions);
            toast.success("Selected transactions deleted successfully!");
            setSelectedTransactions([]);
            fetchTransactions();
        } catch {
            toast.error("Failed to delete selected transactions.");
        }
    };

    const handleCSVUpload = async (file: File): Promise<{ message: string; repeats: Transaction[]; errors: string[] }> => {
        try {
            const response = await transactionApi.uploadCSV(file);
            if (!response) {
                throw new Error("Undefined response from API.");
            }

            const result = {
                message: response.message || "CSV uploaded successfully!",
                repeats: response.repeats || [],
                errors: response.errors || [],
            };

            toast.success(result.message);
            fetchTransactions();
            return result;
        } catch {
            const result = {
                message: "Failed to upload CSV.",
                repeats: [],
                errors: ["An error occurred while uploading the CSV."],
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

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-bold text-gray-800 text-center mb-8"
            >
                Transactions Dashboard
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => transactionApi.downloadCSV()}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all shadow-sm"
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
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBatchDeleteTransactions}
                        className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedTransactions.length === 0}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected ({selectedTransactions.length})
                    </motion.button>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                <CSVUpload onUpload={handleCSVUpload} />
            </motion.div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedTransactions.length === filteredTransactions.length && filteredTransactions.length > 0}
                                        onChange={() => {
                                            if (selectedTransactions.length === filteredTransactions.length) {
                                                setSelectedTransactions([]);
                                            } else {
                                                setSelectedTransactions(filteredTransactions.map((transaction) => transaction.id));
                                            }
                                        }}
                                        className="cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-2">Description</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Original Amount</th>
                                <th className="px-4 py-2">Amount (INR)</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
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
                                    <td className="px-4 py-2">
                                        {transaction.originalAmount} {transaction.currency}
                                    </td>
                                    <td className="px-4 py-2">{transaction.amount_in_inr} ₹</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditTransaction(transaction)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
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
