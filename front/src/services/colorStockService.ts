import api, { API_URL } from './api';
import { StockItem } from './stockItemService';

export interface ColorStock {
    id: number;
    color: string;
    stockInitial: number;
    stockRestant: number;
    nbEntrees: number;
    nbSorties: number;
    stockItem: StockItem | string;
}

export interface CreateColorStockDTO {
    color: string;
    stockInitial: number;
    stockItem?: string; // IRI string
}

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': ColorStock[];
}

class ColorStockService {
    async getAll(): Promise<ColorStock[]> {
        const response = await api.get<ApiResponse>(`${API_URL}/color_stocks`);
        return response.data.member;
    }

    async create(data: CreateColorStockDTO): Promise<ColorStock> {
        const response = await api.post<ColorStock>(`${API_URL}/color_stocks`, data);
        return response.data;
    }

    async update(id: number, data: Partial<CreateColorStockDTO>): Promise<ColorStock> {
        const response = await api.put<ColorStock>(`${API_URL}/color_stocks/${id}`, data);
        return response.data;
    }

    async delete(id: number): Promise<void> {
        await api.delete(`${API_URL}/color_stocks/${id}`);
    }

    async getByStockItem(stockItemId: string): Promise<ColorStock[]> {
        const response = await api.get<ApiResponse>(
            `${API_URL}/color_stocks?stockItem=${stockItemId}`
        );
        return response.data.member;
    }
}

export const colorStockService = new ColorStockService(); 