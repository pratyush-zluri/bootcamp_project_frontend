import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaDownload, FaPlus, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CSVUpload } from '../components/CSVUpload';
import { TransactionForm } from '../components/TransactionForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { TransactionTable } from '../components/TransactionTable';
import { TransactionPagination } from '../components/TransactionPagination';

import { transactionApi } from '../api/transactionApi';
import { TransactionCreateDTO, TransactionUpdateDTO } from '../types/transaction';
import { useTransactionManagement } from '../hooks/useTransactionManagement';
import { useUploadSummary } from '../hooks/useUploadSummary';
import { useModalControl } from '../hooks/useModalControl';

const Dashboard: React.FC = () => {
    // State and hooks
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    // Custom hooks for transaction management
    const {
        transactions,
        total,
        isLoadingNewPage,
        selectedTransactions,
        fetchTransactions,
        handleCheckboxChange,
        handleBatchDeleteTransactions,
        setSelectedTransactions
    } = useTransactionManagement(page, limit, searchTerm);

    const {
        uploadSummary,
        handleCSVUpload,
        handleGetUploadLogs
    } = useUploadSummary(fetchTransactions);

    const {
        showForm,
        selectedTransaction,
        isDeleteModalOpen,
        isBatchDeleteModalOpen,
        transactionToDelete,
        openForm,
        closeForm,
        openDeleteModal,
        closeDeleteModal,
        openBatchDeleteModal,
        closeBatchDeleteModal
    } = useModalControl();

    // Transaction management handlers
    const handleAddTransaction = async (transaction: TransactionCreateDTO) => {
        try {
            await transactionApi.addTransaction(transaction);
            toast.success('Transaction added successfully!');
            closeForm();
            fetchTransactions();
        } catch (error) {
            handleApiError(error, 'Failed to add transaction');
        }
    };

    const handleUpdateTransaction = async (transaction: TransactionUpdateDTO) => {
        if (!selectedTransaction) return;

        try {
            await transactionApi.updateTransaction(selectedTransaction.id, transaction);
            toast.success('Transaction updated successfully!');
            closeForm();
            fetchTransactions();
        } catch (error) {
            handleApiError(error, 'Failed to update transaction');
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        try {
            await transactionApi.softDeleteTransaction(id);
            toast.success('Transaction deleted successfully!');
            fetchTransactions();
        } catch (error) {
            handleApiError(error, 'Failed to delete transaction');
        }
    };

    // Utility functions
    const handleApiError = (error: unknown, defaultMessage: string) => {
        const errorMessage = error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'response' in error
                ? (error as { response: { data: { error: string } } }).response.data.error
                : defaultMessage;

        toast.error(errorMessage);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchTerm(query);
        setPage(1);
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLimit(parseInt(e.target.value, 10));
        setPage(1);
    };

    return (
        <div
            className="min-h-screen w-full px-4 py-6 sm:px-6 lg:px-8"
            style={{ backgroundColor: '#F5EFFF', minHeight: 'calc(100vh - 60px)' }}
        >
            <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-2xl sm:text-3xl font-bold text-indigo-600 text-center mb-6 sm:mb-8"
                data-testid="dashboard-title"
            >
                Transactions Dashboard
            </motion.h1>

            {/* Search and Action Buttons - Improved Responsiveness */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8">
                <div className="relative flex-grow mb-4 md:mb-0">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                        data-testid="search-input"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>

                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                    {/* Action Buttons with Improved Mobile Responsiveness */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => transactionApi.downloadCSV()}
                        className="flex items-center justify-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm text-xs sm:text-sm flex-grow-0 w-full sm:w-auto"
                        data-testid="export-csv-button"
                    >
                        <FaDownload className="w-4 h-4 mr-2" />
                        Export CSV
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openForm(null)}
                        className="flex items-center justify-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm text-xs sm:text-sm flex-grow-0 w-full sm:w-auto"
                        data-testid="add-transaction-button"
                    >
                        <FaPlus className="w-4 h-4 mr-2" />
                        Add Transaction
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={openBatchDeleteModal}
                        className="flex items-center justify-center px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-800 transition-all shadow-sm text-xs sm:text-sm flex-grow-0 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedTransactions.length === 0}
                        data-testid="delete-selected-button"
                    >
                        <FaTrashAlt className="w-4 h-4 mr-2" data-testid="trash-icon" />
                        Delete Selected ({selectedTransactions.length})
                    </motion.button>
                </div>
            </div>

            {/* CSV Upload Section - Improved Responsiveness */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-6 sm:mb-8 w-full"
                data-testid="csv-upload-section"
            >
                <CSVUpload onUpload={handleCSVUpload} />
                {uploadSummary && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleGetUploadLogs}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-800 text-sm sm:text-base"
                            data-testid="get-upload-logs-button"
                        >
                            Get Upload Logs
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Pagination with Full Width */}
            <div className="w-full mb-4">
                <TransactionPagination
                    total={total}
                    page={page}
                    limit={limit}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    data-testid="pagination"
                />
            </div>

            {/* Transactions Table Container - Ensures No Unnecessary White Space */}
            <div className="w-full overflow-x-auto min-h-[300px]">
                <TransactionTable
                    transactions={transactions}
                    isLoadingNewPage={isLoadingNewPage}
                    selectedTransactions={selectedTransactions}
                    onCheckboxChange={handleCheckboxChange}
                    onEditTransaction={(transaction) => openForm(transaction)}
                    onDeleteTransaction={(transaction) => openDeleteModal(transaction)}
                    onSelectAll={() => setSelectedTransactions(
                        selectedTransactions.length === transactions.length
                            ? []
                            : transactions.map((t) => t.id)
                    )}
                    data-testid="transaction-table"
                />

                {/* Empty State Handling */}
                {(!transactions || transactions.length === 0) && !isLoadingNewPage && (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                        No transactions found
                    </div>
                )}
            </div>

            {/* Existing Modal Implementations Remain the Same */}
            {showForm && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4"
                    data-testid="transaction-form-modal"
                >
                    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md">
                        <TransactionForm
                            onSubmit={selectedTransaction ? handleUpdateTransaction : handleAddTransaction}
                            onCancel={closeForm}
                            initialData={selectedTransaction || undefined}
                        />
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            {isDeleteModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to delete this transaction?"
                    onConfirm={() => {
                        if (transactionToDelete) handleDeleteTransaction(transactionToDelete.id);
                        closeDeleteModal();
                    }}
                    onCancel={closeDeleteModal}
                    data-testid="delete-confirmation-modal"
                />
            )}

            {isBatchDeleteModalOpen && (
                <ConfirmationModal
                    message="Are you sure you want to delete the selected transactions?"
                    onConfirm={() => {
                        handleBatchDeleteTransactions();
                        closeBatchDeleteModal();
                    }}
                    onCancel={closeBatchDeleteModal}
                    data-testid="batch-delete-confirmation-modal"
                />
            )}
        </div>
    );
};

export default Dashboard;