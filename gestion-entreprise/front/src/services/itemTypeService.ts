import api, { API_URL } from './api';

export interface ItemType {
    '@id'?: string;
    id: string;
    name: string;
    description?: string;
}

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': ItemType[];
}

export const itemTypeService = {
    getAll: async (): Promise<ItemType[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/item_types`);
        return response.data.member;
    },

    getById: async (id: string): Promise<ItemType> => {
        const response = await api.get<ItemType>(`${API_URL}/item_types/${id}`);
        return response.data;
    },

    create: async (itemType: Omit<ItemType, 'id'>): Promise<ItemType> => {
        const response = await api.post<ItemType>(`${API_URL}/item_types`, itemType);
        return response.data;
    },

    update: async (id: string, itemType: Partial<ItemType>): Promise<ItemType> => {
        const response = await api.put<ItemType>(`${API_URL}/item_types/${id}`, itemType);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/item_types/${id}`);
    }
}; 