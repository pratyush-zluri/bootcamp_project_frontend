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
            } finally {
                setUploading(false);
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

            {uploadSummary && (
                <div className="mt-4 bg-gray-100 p-4 rounded-md max-h-60 overflow-auto">
                    <h3 className="text-lg font-semibold">Upload Summary</h3>
                    <p>{uploadSummary.message}</p>

                    {uploadSummary.repeats.length > 0 && (
                        <div className="mt-2">
                            <h4 className="font-semibold">Repeats:</h4>
                            <ul className="list-disc pl-5">
                                {uploadSummary.repeats.map((item, index) => (
                                    <li key={index}>
                                        {item.date} - {item.description} - {item.originalAmount} {item.currency}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {uploadSummary.errors.length > 0 && (
                        <div className="mt-2">
                            <h4 className="font-semibold">Errors:</h4>
                            <ul className="list-disc pl-5">
                                {uploadSummary.errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};