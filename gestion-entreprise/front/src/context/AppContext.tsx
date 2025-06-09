import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fournisseurService } from '../services/fournisseurService';
import { transactionService } from '../services/transactionService';
import { itemTypeService, type ItemType } from '../services/itemTypeService';
import { stockItemService, type StockItem, type CreateStockItemDTO } from '../services/stockItemService';
import { stockMovementService, type StockMovement, type CreateStockMovementDTO } from '../services/stockMovementService';

export type Transaction = {
  id: string;
  date: string;
  fournisseur: {
    id: string;
    code: string;
    nom: string;
  };
  achat: number;
  virement: number;
  reste: number;
  description?: string;
};

export type EmbeddedTransaction = {
  id: string;
  date: string;
  achat: number;
  virement: number;
  reste: number;
  description?: string;
};

export type Fournisseur = {
  id: string;
  code: string;
  nom: string;
  transactions: EmbeddedTransaction[];
};

export type { ItemType, StockItem, StockMovement };

type AppContextType = {
  fournisseurs: Fournisseur[];
  transactions: Transaction[];
  itemTypes: ItemType[];
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  addFournisseur: (fournisseur: Omit<Fournisseur, 'id'>) => Promise<void>;
  updateFournisseur: (id: string, fournisseur: Partial<Fournisseur>) => Promise<void>;
  deleteFournisseur: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  // Item Types
  addItemType: (itemType: Omit<ItemType, 'id'>) => Promise<void>;
  updateItemType: (id: string, itemType: Partial<ItemType>) => Promise<void>;
  deleteItemType: (id: string) => Promise<void>;
  // Stock Items
  addStockItem: (item: Omit<CreateStockItemDTO, 'id'>) => Promise<void>;
  updateStockItem: (id: string, item: Partial<StockItem>) => Promise<void>;
  deleteStockItem: (id: string) => Promise<void>;
  // Stock Movements
  addStockMovement: (movement: CreateStockMovementDTO) => Promise<void>;
  updateStockMovement: (id: string, movement: Partial<StockMovement>) => Promise<void>;
  deleteStockMovement: (id: string) => Promise<void>;
  // Refresh functions
  refreshStockData: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          fournisseursData,
          transactionsData,
          itemTypesData,
          stockItemsData,
          stockMovementsData
        ] = await Promise.all([
          fournisseurService.getAll(),
          transactionService.getAll(),
          itemTypeService.getAll(),
          stockItemService.getAll(),
          stockMovementService.getAll()
        ]);
        setFournisseurs(fournisseursData);
        setTransactions(transactionsData);
        setItemTypes(itemTypesData);
        setStockItems(stockItemsData);
        setStockMovements(stockMovementsData);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fournisseurs methods
  const addFournisseur = async (fournisseur: Omit<Fournisseur, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newFournisseur = await fournisseurService.create(fournisseur);
      setFournisseurs(prev => [...prev, newFournisseur]);
    } catch (err) {
      setError('Erreur lors de l\'ajout du fournisseur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFournisseur = async (id: string, fournisseur: Partial<Fournisseur>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedFournisseur = await fournisseurService.update(id, fournisseur);
      setFournisseurs(prev => prev.map(f => f.id === id ? updatedFournisseur : f));
    } catch (err) {
      setError('Erreur lors de la mise à jour du fournisseur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFournisseur = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await fournisseurService.delete(id);
      setFournisseurs(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du fournisseur');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Transactions methods
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTransaction = await transactionService.create(transaction);
      setTransactions(prev => [...prev, newTransaction]);
    } catch (err) {
      setError('Erreur lors de l\'ajout de la transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTransaction = await transactionService.update(id, transaction);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
    } catch (err) {
      setError('Erreur lors de la mise à jour de la transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de la transaction');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Item Types methods
  const addItemType = async (itemType: Omit<ItemType, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newItemType = await itemTypeService.create(itemType);
      setItemTypes(prev => [...prev, newItemType]);
    } catch (err) {
      setError('Erreur lors de l\'ajout du type d\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemType = async (id: string, itemType: Partial<ItemType>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedItemType = await itemTypeService.update(id, itemType);
      setItemTypes(prev => prev.map(t => t.id === id ? updatedItemType : t));
    } catch (err) {
      setError('Erreur lors de la mise à jour du type d\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItemType = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await itemTypeService.delete(id);
      setItemTypes(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression du type d\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh function for stock data
  const refreshStockData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stockItemsData, stockMovementsData] = await Promise.all([
        stockItemService.getAll(),
        stockMovementService.getAll()
      ]);
      setStockItems(stockItemsData);
      setStockMovements(stockMovementsData);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des données');
      console.error('Error refreshing stock data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Stock Items methods
  const addStockItem = async (item: Omit<CreateStockItemDTO, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newItem = await stockItemService.create(item);
      setStockItems(prev => [...prev, newItem]);
      await refreshStockData(); // Refresh after adding item
    } catch (err) {
      setError('Erreur lors de l\'ajout de l\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStockItem = async (id: string, item: Partial<StockItem>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedItem = await stockItemService.update(id, item);
      setStockItems(prev => prev.map(i => i.id === id ? updatedItem : i));
    } catch (err) {
      setError('Erreur lors de la mise à jour de l\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStockItem = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await stockItemService.delete(id);
      setStockItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression de l\'article');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Stock Movements methods
  const addStockMovement = async (movement: CreateStockMovementDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMovement = await stockMovementService.create(movement);
      setStockMovements(prev => [...prev, newMovement]);
      await refreshStockData(); // Refresh after adding movement
    } catch (err) {
      setError('Erreur lors de l\'ajout du mouvement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStockMovement = async (id: string, movement: Partial<StockMovement>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedMovement = await stockMovementService.update(id, movement);
      setStockMovements(prev => prev.map(m => m.id === id ? updatedMovement : m));
      
      // Mettre à jour le stock de l'article concerné si nécessaire
      if (movement.stockItem || movement.quantity || movement.type) {
        const stockItem = typeof updatedMovement.stockItem === 'string' 
          ? { id: updatedMovement.stockItem.split('/').pop() || '' }
          : updatedMovement.stockItem;
        
        if (stockItem.id) {
          const updatedItem = await stockItemService.getById(stockItem.id);
          setStockItems(prev => prev.map(i => i.id === stockItem.id ? updatedItem : i));
        }
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du mouvement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStockMovement = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const movement = stockMovements.find(m => m.id === id);
      await stockMovementService.delete(id);
      setStockMovements(prev => prev.filter(m => m.id !== id));
      
      // Mettre à jour le stock de l'article concerné
      if (movement) {
        const stockItem = typeof movement.stockItem === 'string'
          ? { id: movement.stockItem.split('/').pop() || '' }
          : movement.stockItem;
        
        if (stockItem.id) {
          const updatedItem = await stockItemService.getById(stockItem.id);
          setStockItems(prev => prev.map(i => i.id === stockItem.id ? updatedItem : i));
        }
      }
    } catch (err) {
      setError('Erreur lors de la suppression du mouvement');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    fournisseurs,
    transactions,
    itemTypes,
    stockItems,
    stockMovements,
    addFournisseur,
    updateFournisseur,
    deleteFournisseur,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addItemType,
    updateItemType,
    deleteItemType,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    addStockMovement,
    updateStockMovement,
    deleteStockMovement,
    refreshStockData,
    isLoading,
    error
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
 