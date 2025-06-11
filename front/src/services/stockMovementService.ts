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

export interface ColorStockMovement {
    id: number;
    colorStock: string;
    date: string;
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
}

export interface CreateStockMovementDTO {
    stockItem: StockItem | string; // Can be either the full object or an IRI string
    date: string;
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
}

export interface CreateColorStockMovementDTO {
    colorStock: string;
    date: string;
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
    },

    async createColorMovement(movement: CreateColorStockMovementDTO): Promise<ColorStockMovement> {
        const response = await api.post('/color_stock_movements', movement);
        return response.data;
    },

    async updateColorMovement(id: string, movement: Partial<CreateColorStockMovementDTO>): Promise<ColorStockMovement> {
        const response = await api.put(`/color_stock_movements/${id}`, movement);
        return response.data;
    },

    async deleteColorMovement(id: string): Promise<void> {
        await api.delete(`/color_stock_movements/${id}`);
    },

    async getColorMovementsByType(type: 'entree' | 'sortie'): Promise<ColorStockMovement[]> {
        const response = await api.get(`/color_stock_movements?type=${type}`);
        return response.data['hydra:member'];
    },
}; 