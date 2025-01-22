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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploading(true);
            try {
                await onUpload(file);
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setUploading(false);
                // Reset the file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setIsModalOpen(false); // Close the modal after upload
            }
        }
    };

    const handleButtonClick = () => {
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setFileName(null); // Clear the file name when closing the modal
    };

    return (
        <div className="flex justify-center items-center">
            <button
                onClick={handleButtonClick}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-800"
                disabled={uploading}
            >
                {uploading ? 'UPLOADING...' : 'UPLOAD CSV'}
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Upload CSV</h2>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="mb-4"
                            id="csv-upload"
                        />
                        {fileName && (
                            <p className="text-sm text-gray-600 mb-4">
                                Selected file: {fileName}
                            </p>
                        )}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleModalClose}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-800"
                                disabled={uploading}
                            >
                                {uploading ? 'UPLOADING...' : 'Select File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};