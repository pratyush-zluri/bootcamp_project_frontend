import { useState } from 'react';
import { Transaction } from '../types/transaction';

export const useModalControl = () => {
    const [showForm, setShowForm] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

    const openForm = (transaction: Transaction | null) => {
        setSelectedTransaction(transaction);
        setShowForm(true);
    };

    const closeForm = () => {
        setSelectedTransaction(null);
        setShowForm(false);
    };

    const openDeleteModal = (transaction: Transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setTransactionToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const openBatchDeleteModal = () => {
        setIsBatchDeleteModalOpen(true);
    };

    const closeBatchDeleteModal = () => {
        setIsBatchDeleteModalOpen(false);
    };

    return {
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
    };
};