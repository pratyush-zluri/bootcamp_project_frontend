export interface Transaction {
    id: number;
    date: string;
    description: string;
    originalAmount: number;
    currency: string;
    amount_in_inr: number;
    isDeleted?: boolean;
}

export interface TransactionCreateDTO {
    date: string;
    description: string;
    originalAmount: number;
    currency: string;
}

export interface TransactionUpdateDTO {
    date?: string;
    description?: string;
    originalAmount?: number;
    currency?: string;
}

export interface CSVUploadResponse {
    message: string;
    duplicateRows: any[]; // Replace with specific type if known
    repeatsInDB: any[]; // Replace with specific type if known
    errors: string[];
}
