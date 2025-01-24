import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Transaction } from "../types/transaction";

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
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                setIsModalOpen(false);
            }
        }
    };

    return (
        <div className="flex justify-center">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-800 transition-all"
                disabled={uploading}
                data-testid="upload-button"
            >
                {uploading ? "UPLOADING..." : "UPLOAD CSV"}
            </motion.button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Upload CSV
                        </h2>
                        <div className="flex flex-col items-center">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="mb-4 w-full text-sm text-gray-500 
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-50 file:text-indigo-700
                                    hover:file:bg-indigo-100"
                                id="csv-upload"
                                data-testid="csv-upload"
                            />
                            {fileName && (
                                <p className="text-sm text-gray-600 mb-4 text-center">
                                    Selected file: {fileName}
                                </p>
                            )}
                            <div className="flex justify-center space-x-4 w-full">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                    data-testid="cancel-button"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-800"
                                    disabled={uploading}
                                    data-testid="select-file-button"
                                >
                                    {uploading ? "UPLOADING..." : "Select File"}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
