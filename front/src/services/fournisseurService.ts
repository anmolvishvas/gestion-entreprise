import api, { API_URL } from './api';
import { Fournisseur } from '../context/AppContext';

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': ApiFournisseur[];
}

interface ApiFournisseur {
    '@id': string;
    '@type': string;
    id: number;
    code: string;
    nom: string;
    transactions: any[];
}

const transformApiFournisseur = (apiFournisseur: ApiFournisseur): Fournisseur => ({
    id: apiFournisseur.id.toString(),
    code: apiFournisseur.code,
    nom: apiFournisseur.nom,
    transactions: apiFournisseur.transactions || []
});

export const fournisseurService = {
    getAll: async (): Promise<Fournisseur[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/fournisseurs`);
        return (response.data.member || []).map(transformApiFournisseur);
    },

    getById: async (id: string): Promise<Fournisseur> => {
        const response = await api.get<ApiFournisseur>(`${API_URL}/fournisseurs/${id}`);
        return transformApiFournisseur(response.data);
    },

    create: async (fournisseur: Omit<Fournisseur, 'id'>): Promise<Fournisseur> => {
        const response = await api.post<ApiFournisseur>(`${API_URL}/fournisseurs`, fournisseur);
        return transformApiFournisseur(response.data);
    },

    update: async (id: string, fournisseur: Partial<Fournisseur>): Promise<Fournisseur> => {
        const response = await api.put<ApiFournisseur>(`${API_URL}/fournisseurs/${id}`, {
            code: fournisseur.code,
            nom: fournisseur.nom
        });
        return transformApiFournisseur(response.data);
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/fournisseurs/${id}`);
    }
}; 