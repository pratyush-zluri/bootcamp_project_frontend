import React, { useState, useEffect } from 'react';
import { TransactionCreateDTO, Transaction } from '../types/transaction';
import { SUPPORTED_CURRENCIES } from '../utils/currencyUtils';
import { format } from 'date-fns';

export type TransactionFormProps = {
    onSubmit: (transaction: TransactionCreateDTO | Transaction) => void;
    onCancel: () => void;
    initialData?: Transaction;
};

export const TransactionForm: React.FC<TransactionFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
}) => {
    const [formData, setFormData] = useState<TransactionCreateDTO>({
        date: initialData?.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        description: initialData?.description || '',
        originalAmount: initialData?.originalAmount || 0,
        currency: initialData?.currency || 'USD',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                date: format(new Date(initialData.date), 'yyyy-MM-dd'),
                description: initialData.description,
                originalAmount: initialData.originalAmount,
                currency: initialData.currency,
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const today = format(new Date(), 'yyyy-MM-dd');

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input
                    id="date"
                    type="date"
                    value={formData.date}
                    max={today}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A294F9] focus:ring-[#A294F9] px-2 py-1" // Added padding here
                    required
                />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <input
                    id="description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A294F9] focus:ring-[#A294F9] px-2 py-1" // Added padding here
                    required
                />
            </div>

            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.originalAmount}
                    onChange={(e) => setFormData({ ...formData, originalAmount: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A294F9] focus:ring-[#A294F9] px-2 py-1" // Added padding here
                    required
                    min="0"
                />
            </div>

            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A294F9] focus:ring-[#A294F9] px-2 py-1" // Added padding here
                    required
                >
                    {Object.entries(SUPPORTED_CURRENCIES).map(([code, name]) => (
                        <option key={code} value={code}>
                            {code} - {name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    Save
                </button>
            </div>
        </form>
    );
};
