import api, { API_URL } from './api';
import type { ItemType } from './itemTypeService';

export interface StockItem {
    id: string;
    reference: string;
    name: string;
    type: ItemType | string; // Can be either the full type object or an IRI string
    location: 'Cotona' | 'Maison' | 'Avishay' | 'Avenir';
    unit: 'piece' | 'unite';
    stockInitial: number;
    dateDernierInventaire: string;
    stockRestant?: number;
    nbEntrees?: number;
    nbSorties?: number;
    movements?: Array<{
        id: number;
        type: 'entree' | 'sortie';
        quantity: number;
        date: string;
        notes?: string;
    }>;
}

export interface CreateStockItemDTO {
    reference: string;
    name: string;
    type: string; // IRI string for type
    location: 'Cotona' | 'Maison' | 'Avishay' | 'Avenir';
    unit: 'piece' | 'unite';
    stockInitial: number;
    dateDernierInventaire: string;
}

export interface ApiResponse {
    '@context': string;
    '@id': string;
    '@type': string;
    'totalItems': number;
    'member': StockItem[];
}

export const stockItemService = {
    getAll: async (): Promise<StockItem[]> => {
        const response = await api.get<ApiResponse>(`${API_URL}/stock_items`);
        return response.data.member;
    },

    getById: async (id: string): Promise<StockItem> => {
        const response = await api.get<StockItem>(`${API_URL}/stock_items/${id}`);
        return response.data;
    },

    create: async (stockItem: Omit<CreateStockItemDTO, 'id' | 'stockRestant' | 'nbEntrees' | 'nbSorties'>): Promise<StockItem> => {
        const response = await api.post<StockItem>(`${API_URL}/stock_items`, stockItem);
        return response.data;
    },

    update: async (id: string, stockItem: Partial<StockItem>): Promise<StockItem> => {
        // Get the current item first
        const currentItem = await stockItemService.getById(id);
        
        // Prepare the update data by merging current data with updates
        const updateData = {
            ...currentItem,  // Start with all current data
            ...stockItem,    // Override with new data
            // Ensure type is always the IRI string
            type: typeof currentItem.type === 'object' ? currentItem.type['@id'] : currentItem.type
        };
        
        console.log('Updating stock item with data:', updateData);
        
        const response = await api.put<StockItem>(`${API_URL}/stock_items/${id}`, updateData);
        return response.data;
    },

    // New method specifically for inventory updates
    updateInventory: async (id: string, newStockValue: number): Promise<StockItem> => {
        // Get the current item first
        const currentItem = await stockItemService.getById(id);
        
        // Delete all movements for this stock item
        if (currentItem.movements) {
            for (const movement of currentItem.movements) {
                await api.delete(`${API_URL}/stock_movements/${movement.id}`);
            }
        }
        
        // Prepare the inventory update data
        const updateData = {
            ...currentItem,
            stockRestant: newStockValue,
            stockInitial: newStockValue,
            dateDernierInventaire: new Date().toISOString(),
            nbEntrees: 0,
            nbSorties: 0,
            movements: [],
            // Ensure type is always the IRI string
            type: typeof currentItem.type === 'object' ? currentItem.type['@id'] : currentItem.type
        };
        
        
        const response = await api.put<StockItem>(`${API_URL}/stock_items/${id}`, updateData);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`${API_URL}/stock_items/${id}`);
    }
}; 