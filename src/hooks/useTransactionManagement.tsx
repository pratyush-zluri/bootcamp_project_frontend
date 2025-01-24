import { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { transactionApi } from '../api/transactionApi';
import { toast } from 'react-toastify';

export const useTransactionManagement = (page: number, limit: number, searchTerm: string) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoadingNewPage, setIsLoadingNewPage] = useState(false);
    const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);

    const fetchTransactions = async () => {

        setIsLoadingNewPage(true);
        try {
            const response = searchTerm
                ? await transactionApi.searchTransactions(searchTerm, page, limit)
                : await transactionApi.getTransactions(page, limit);

            setTransactions(response?.transactions ?? []);
            setTotal(response?.total ?? 0);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        } finally {
            setIsLoadingNewPage(false);
        }
    };

    const searchTransactions = async (query: string) => {
        setIsLoadingNewPage(true);
        try {
            const response = await transactionApi.searchTransactions(query, page, limit);
            setTransactions(response?.transactions ?? []);
            setTotal(response?.total ?? 0);
        } catch (error) {
            toast.error('Failed to search transactions');
        } finally {
            setIsLoadingNewPage(false);
        }
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedTransactions((prev) =>
            prev.includes(id)
                ? prev.filter((transactionId) => transactionId !== id)
                : [...prev, id]
        );
    };

    const handleBatchDeleteTransactions = async () => {
        if (selectedTransactions.length === 0) {
            toast.error('No transactions selected');
            return;
        }

        try {
            await transactionApi.softDeleteBatchTransactions(selectedTransactions);
            toast.success('Selected transactions deleted');
            setSelectedTransactions([]);
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to delete selected transactions');
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, limit, searchTerm]);

    return {
        transactions,
        total,
        isLoadingNewPage,
        selectedTransactions,
        fetchTransactions,
        searchTransactions,
        handleCheckboxChange,
        handleBatchDeleteTransactions,
        setSelectedTransactions
    };
};