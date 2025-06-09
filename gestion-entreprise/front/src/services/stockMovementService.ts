import api, { API_URL } from './api';
import type { StockItem } from './stockItemService';

export interface StockMovement {
    id: string;
    date: string;
    stockItem: StockItem | string; // Can be either the full object or an IRI string
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
}

export interface CreateStockMovementDTO {
    date: string;
    stockItem: string; // IRI string for stockItem
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
}

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': StockMovement[];
}

export const stockMovementService = {
    getAll: async (): Promise<StockMovement[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/stock_movements`);
        return response.data.member;
    },

    getById: async (id: string): Promise<StockMovement> => {
        const response = await api.get<StockMovement>(`${API_URL}/stock_movements/${id}`);
        return response.data;
    },

    create: async (movement: CreateStockMovementDTO): Promise<StockMovement> => {
        const response = await api.post<StockMovement>(`${API_URL}/stock_movements`, movement);
        return response.data;
    },

    update: async (id: string, movement: Partial<StockMovement>): Promise<StockMovement> => {
        const response = await api.put<StockMovement>(`${API_URL}/stock_movements/${id}`, movement);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/stock_movements/${id}`);
    },

    // Méthodes supplémentaires spécifiques aux mouvements
    getByDateRange: async (startDate: string, endDate: string): Promise<StockMovement[]> => {
        const response = await api.get<ApiResponse>(
            `${API_URL}/stock_movements?date[after]=${startDate}&date[before]=${endDate}`
        );
        return response.data.member;
    },

    getByStockItem: async (stockItemId: string): Promise<StockMovement[]> => {
        const response = await api.get<ApiResponse>(
            `${API_URL}/stock_movements?stockItem=${stockItemId}`
        );
        return response.data.member;
    },

    getByType: async (type: 'entree' | 'sortie'): Promise<StockMovement[]> => {
        const response = await api.get<ApiResponse>(
            `${API_URL}/stock_movements?type=${type}`
        );
        return response.data.member;
    }
}; 