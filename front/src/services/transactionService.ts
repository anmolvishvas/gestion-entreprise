import api, { API_URL } from './api';
import { Transaction } from '../context/AppContext';

interface CreateTransactionDto {
    date: string;
    fournisseur: string; // IRI format
    achat: number;
    virement: number;
    reste: number;
}

interface ApiFournisseur {
    '@id': string;
    '@type': string;
    id: number;
    code: string;
    nom: string;
}

interface ApiTransaction {
    '@id': string;
    '@type': string;
    id: number;
    date: string;
    fournisseur: ApiFournisseur;
    achat: number;
    virement: number;
    reste: number;
}

interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': ApiTransaction[];
}

const transformApiTransaction = (apiTransaction: ApiTransaction): Transaction => ({
    id: apiTransaction.id.toString(),
    date: apiTransaction.date.split('T')[0], // Convert to YYYY-MM-DD format
    fournisseur: {
        id: apiTransaction.fournisseur.id,
        code: apiTransaction.fournisseur.code,
        nom: apiTransaction.fournisseur.nom
    },
    achat: apiTransaction.achat,
    virement: apiTransaction.virement,
    reste: apiTransaction.reste,
});

export const transactionService = {
    getAll: async (): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/transactions`);
        return (response.data.member || []).map(transformApiTransaction);
    },

    getById: async (id: string): Promise<Transaction> => {
        const response = await api.get<ApiTransaction>(`${API_URL}/transactions/${id}`);
        return transformApiTransaction(response.data);
    },

    create: async (data: Omit<Transaction, 'id'>): Promise<Transaction> => {
        const payload: CreateTransactionDto = {
            date: data.date,
            fournisseur: `/api/fournisseurs/${data.fournisseur.id}`,
            achat: data.achat,
            virement: data.virement,
            reste: data.reste,
        };
        const response = await api.post<ApiTransaction>(`${API_URL}/transactions`, payload);
        return transformApiTransaction(response.data);
    },

    update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
        const payload: Partial<CreateTransactionDto> = {
            ...transaction,
            fournisseur: transaction.fournisseur ? `/api/fournisseurs/${transaction.fournisseur.id}` : undefined
        };
        const response = await api.put<ApiTransaction>(`${API_URL}/transactions/${id}`, payload);
        return transformApiTransaction(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/transactions/${id}`);
    },

    getByFournisseur: async (fournisseurId: string): Promise<Transaction[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/transactions?fournisseur=${fournisseurId}`);
        return (response.data.member || []).map(transformApiTransaction);
    }
}; 