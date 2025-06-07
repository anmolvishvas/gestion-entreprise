import api, { API_URL } from './api';
import { Fournisseur } from '../context/AppContext';

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': Fournisseur[];
}

export const fournisseurService = {
    getAll: async (): Promise<Fournisseur[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/fournisseurs`);
        return response.data.member;
    },

    getById: async (id: string): Promise<Fournisseur> => {
        const response = await api.get(`${API_URL}/fournisseurs/${id}`);
        return response.data;
    },

    create: async (fournisseur: Omit<Fournisseur, 'id'>): Promise<Fournisseur> => {
        const response = await api.post<Fournisseur>(`${API_URL}/fournisseurs`, fournisseur);
        return response.data;
    },

    update: async (id: string, fournisseur: Partial<Fournisseur>): Promise<Fournisseur> => {
        const response = await api.put(`${API_URL}/fournisseurs/${id}`, fournisseur);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/fournisseurs/${id}`);
    }
}; 