import api, { API_URL } from './api';
import type { StockItem } from './stockItemService';

export interface ColorStock {
    id: number;
    color: string;
    stockInitial: number;
    stockRestant: number;
    nbEntrees: number;
    nbSorties: number;
    stockItem: StockItem;
}

export interface ColorStockMovement {
    id: number;
    date: string;
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
    colorStock: ColorStock;
    movementType: 'color';
}

export interface CreateColorStockMovementDTO {
    date: string;
    colorStock: string; // IRI string
    type: 'entree' | 'sortie';
    quantity: number;
    notes?: string;
}

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': ColorStockMovement[];
}

class ColorStockMovementService {
    async getAll(): Promise<ColorStockMovement[]> {
        const response = await api.get<ApiResponse>(`${API_URL}/color_stock_movements`);
        return response.data.member;
    }

    async getById(id: number): Promise<ColorStockMovement> {
        const response = await api.get<ColorStockMovement>(`${API_URL}/color_stock_movements/${id}`);
        return response.data;
    }

    async create(data: CreateColorStockMovementDTO): Promise<ColorStockMovement> {
        const response = await api.post<ColorStockMovement>(`${API_URL}/color_stock_movements`, data);
        return response.data;
    }

    async update(id: number, data: Partial<ColorStockMovement>): Promise<ColorStockMovement> {
        const response = await api.put<ColorStockMovement>(`${API_URL}/color_stock_movements/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`${API_URL}/color_stock_movements/${id}`);
    }

    async getByDateRange(startDate: string, endDate: string): Promise<ColorStockMovement[]> {
        const response = await api.get<ApiResponse>(
            `${API_URL}/color_stock_movements?date[after]=${startDate}&date[before]=${endDate}`
        );
        return response.data.member;
    }

    async getByColorStock(colorStockId: number): Promise<ColorStockMovement[]> {
        const response = await api.get<ApiResponse>(
            `${API_URL}/color_stock_movements?colorStock=${colorStockId}`
        );
        return response.data.member;
    }

    async getByType(type: 'entree' | 'sortie'): Promise<ColorStockMovement[]> {
        const response = await api.get<ApiResponse>(
            `${API_URL}/color_stock_movements?type=${type}`
        );
        return response.data.member;
    }
}

export const colorStockMovementService = new ColorStockMovementService(); 