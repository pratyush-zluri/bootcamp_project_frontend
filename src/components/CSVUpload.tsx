import React, { useState, useRef } from 'react';
import { Transaction } from '../types/transaction';

interface CSVUploadProps {
    onUpload: (file: File) => Promise<{
        message: string;
        repeats: Transaction[];
        errors: string[];
    }>;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [uploadSummary, setUploadSummary] = useState<{
        message: string;
        repeats: Transaction[];
        errors: string[];
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploading(true);
            try {
                const result = await onUpload(file);
                setUploadSummary(result);
            } catch (error) {
                console.error("Error uploading file:", error);
                setUploadSummary({
                    message: 'Failed to upload file',
                    repeats: [],
                    errors: ['An unexpected error occurred. Please try again.']
                });
            } finally {
                setUploading(false);
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
            />

            <div className="flex flex-col items-center">
                <span className="text-sm text-gray-600 mb-2">
                    {uploading
                        ? 'Uploading...'
                        : fileName || 'No file selected'}
                </span>
                <button
                    onClick={handleButtonClick}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    disabled={uploading}
                >
                    {uploading ? 'UPLOADING...' : 'UPLOAD CSV'}
                </button>
            </div>
        </div>
    );
};