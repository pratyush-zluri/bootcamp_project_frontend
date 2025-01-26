import { useState } from 'react';
import { transactionApi } from '../api/transactionApi';
import { Transaction } from '../types/transaction';
import { toast } from 'react-toastify';


export const useUploadSummary = (onSuccessfulUpload: () => void) => {
    const [uploadSummary, setUploadSummary] = useState<{
        message: string;
        duplicateRows: any[];
        repeatsInDB: Transaction[];
        errors: string[];
    } | null>(null);

    const handleCSVUpload = async (file: File) => {
        try {
            const response = await transactionApi.uploadCSV(file);
            if (!response) {
                throw new Error('No response received');
            }
            const result = {
                message: response.message || 'CSV uploaded successfully!',
                duplicateRows: response.duplicateRows || [],
                repeatsInDB: response.repeatsInDB || [],
                errors: response.errors || [],
            };
            if (response.message === "No transactions were uploaded.") {
                toast.info("No transactions were uploaded.");
                setUploadSummary(result);
                return result;
            }
            toast.success(result.message);
            onSuccessfulUpload();
            setUploadSummary(result);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload CSV';
            const result = {
                message: errorMessage,
                duplicateRows: [],
                repeatsInDB: [],
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