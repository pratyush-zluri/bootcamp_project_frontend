import axios, { AxiosError } from 'axios';
import { Transaction, TransactionCreateDTO, TransactionUpdateDTO, CSVUploadResponse } from '../types/transaction';


const API_BASE_URL = "https://bootcamp-project-backend-c0h3.onrender.com";

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
    if (error.response && error.response.data) {
        const errorMessage = error.response.data.error || error.response.data.message || 'An error occurred';
        throw new Error(errorMessage);
    } else {
        throw new Error('Network error occurred');
    }
};

export const transactionApi = {
    getTransactions: async (page: number, limit: number) => {
        try {
            const response = await axios.get<{ transactions: Transaction[]; total: number; page: number; limit: number; totalPages: number }>(
                `${API_BASE_URL}/transactions?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    searchTransactions: async (query: string, page: number, limit: number) => {
        try {
            const response = await axios.get<{ transactions: Transaction[]; total: number }>(
                `${API_BASE_URL}/transactions/search`, { params: { query, page, limit } }
            );
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },
    getSoftDeletedTransactions: async (page: number, limit: number) => {
        const response = await axios.get<{ transactions: Transaction[]; total: number }>(`${API_BASE_URL}/transactions/soft-deleted`, { params: { page, limit } });
        return response.data;
    },
    restoreTransaction: async (id: number) => {
        const response = await axios.patch<{ message: string; transaction: Transaction }>(`${API_BASE_URL}/transactions/${id}/restore`);
        return response.data;
    },
    hardDeleteTransaction: async (id: number) => {
        const response = await axios.delete<{ message: string }>(`${API_BASE_URL}/transactions/${id}`);
        return response.data;
    },

    batchRestoreTransactions: async (ids: number[]) => {
        const response = await axios.put<{ message: string }>(
            `${API_BASE_URL}/transactions/batch-restore`,
            { ids }
        );
        return response.data.message;
    },

    batchHardDeleteTransactions: async (ids: number[]) => {
        const response = await axios.put<{ message: string }>(
            `${API_BASE_URL}/transactions/batch-hard-delete`,
            { ids }
        );
        return response.data.message;
    },

    addTransaction: async (transaction: TransactionCreateDTO) => {
        try {
            const response = await axios.post<Transaction>(
                `${API_BASE_URL}/transactions`,
                transaction
            );
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    updateTransaction: async (id: number, transaction: TransactionUpdateDTO) => {
        try {
            const response = await axios.patch<{ message: string; transaction: Transaction }>(
                `${API_BASE_URL}/transactions/${id}`,
                transaction
            );
            return response.data.transaction;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    softDeleteTransaction: async (id: number) => {
        try {
            const response = await axios.patch<{ message: string; transaction: Transaction }>(
                `${API_BASE_URL}/transactions/${id}/soft-delete`
            );
            return response.data.transaction;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    uploadCSV: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post<CSVUploadResponse>(
                `${API_BASE_URL}/transactions/upload-csv`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    downloadCSV: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/transactions/export-csv`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },

    softDeleteBatchTransactions: async (ids: number[]) => {
        try {
            const response = await axios.put<{ message: string }>(
                `${API_BASE_URL}/transactions/batch-soft-delete`,
                { ids }
            );
            return response.data.message;
        } catch (error) {
            handleApiError(error as AxiosError<ApiErrorResponse>);
        }
    },
};