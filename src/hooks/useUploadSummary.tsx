import { useState } from 'react';
import { transactionApi } from '../api/transactionApi';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';

export const useUploadSummary = (onSuccessfulUpload: () => void) => {
    const [uploadSummary, setUploadSummary] = useState<{
        message: string;
        repeats: Transaction[];
        errors: string[];
    } | null>(null);

    const handleCSVUpload = async (file: File) => {
        try {
            const response = await transactionApi.uploadCSV(file);
            if (!response) {
                throw new Error('Undefined response from API');
            }

            const result = {
                message: response.message || 'CSV uploaded successfully!',
                repeats: response.repeats.map((repeat: any) => ({
                    ...repeat,
                    originalAmount: repeat.originalAmount || repeat.amount,
                    currency: repeat.currency || 'USD',
                    amount_in_inr: repeat.amount_in_inr || 0
                })),
                errors: response.errors || [],
            };

            toast.success(result.message);
            onSuccessfulUpload();
            setUploadSummary(result);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload CSV';
            const result = {
                message: errorMessage,
                repeats: [],
                errors: [errorMessage],
            };
            toast.error(result.message);
            setUploadSummary(result);
            return result;
        }
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

    return {
        uploadSummary,
        handleCSVUpload,
        handleGetUploadLogs
    };
};