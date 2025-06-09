import { useState, useEffect } from 'react';
import { ArrowUp, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { stockItemService } from '../services/stockItemService';
import { stockMovementService } from '../services/stockMovementService';
import type { StockItem } from '../services/stockItemService';
import { useAppContext } from '../context/AppContext';

export default function StockExit() {
  const navigate = useNavigate();
  const { stockItems, addStockMovement } = useAppContext();
  
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  
  // For searching items
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selected item details
  const selectedItem = stockItems.find(item => Number(item.id) === Number(selectedItemId));
  
  // Calculate current stock for selected item
  const currentStock = selectedItem ? (selectedItem.stockRestant ?? selectedItem.stockInitial) : 0;

  const handleItemSelection = (newSelectedId: string) => {
    console.log('Selecting item:', newSelectedId);
    setSelectedItemId(newSelectedId);
    if (newSelectedId) {
      const item = stockItems.find(i => Number(i.id) === Number(newSelectedId));
      console.log('Found item:', item);
      if (item) {
        setQuantity(1);
      } else {
        console.warn('Selected item not found in stockItems:', newSelectedId);
      }
    } else {
      setQuantity(1);
    }
  };

  const filteredItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity <= 0) {
      return;
    }
    
    if (!selectedItem) {
      return;
    }
    
    if (currentStock <= 0) {
      alert('Cet article n\'a plus de stock disponible');
      return;
    }
    
    if (quantity > currentStock) {
      alert(`La quantité demandée (${quantity}) est supérieure au stock disponible (${currentStock})`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await addStockMovement({
        date: new Date().toISOString(),
        stockItem: `/api/stock_items/${selectedItemId}`,
        type: 'sortie',
        quantity,
        notes: notes || 'Sortie de stock'
      });
      
      navigate('/stock/movements');
    } catch (err) {
      console.error('Error creating stock movement:', err);
      setError('Erreur lors de la création du mouvement de stock');
      setLoading(false);
    }
  };

  if (loading && !stockItems.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sortie de Stock</h1>
        <p className="mt-1 text-gray-600">Retirez des articles de votre inventaire</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex items-center mb-1">
                  <ArrowUp className="h-5 w-5 text-red-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Sortie d'article</h2>
                </div>
                <p className="text-gray-600 text-sm">Retirez des articles de votre stock</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="itemSearch" className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher un article
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="itemSearch"
                    className="input pl-10 w-full"
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="selectedItem" className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner un article
                </label>
                <select
                  id="selectedItem"
                  className="input w-full"
                  value={selectedItemId}
                  onChange={(e) => handleItemSelection(e.target.value)}
                  required
                >
                  <option value="">Sélectionnez un article</option>
                  
                  <optgroup label="Cotona">
                    {filteredItems
                      .filter(item => {
                        const stock = item.stockRestant ?? item.stockInitial;
                        return item.location === 'Cotona' && stock > 0;
                      })
                      .map(item => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name} ({item.stockRestant ?? item.stockInitial} en stock)
                        </option>
                      ))}
                  </optgroup>
                  
                  <optgroup label="Maison">
                    {filteredItems
                      .filter(item => {
                        const stock = item.stockRestant ?? item.stockInitial;
                        return item.location === 'Maison' && stock > 0;
                      })
                      .map(item => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name} ({item.stockRestant ?? item.stockInitial} en stock)
                        </option>
                      ))}
                  </optgroup>
                  
                  <optgroup label="Avishay">
                    {filteredItems
                      .filter(item => {
                        const stock = item.stockRestant ?? item.stockInitial;
                        return item.location === 'Avishay' && stock > 0;
                      })
                      .map(item => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name} ({item.stockRestant ?? item.stockInitial} en stock)
                        </option>
                      ))}
                  </optgroup>
                  
                  <optgroup label="Avenir">
                    {filteredItems
                      .filter(item => {
                        const stock = item.stockRestant ?? item.stockInitial;
                        return item.location === 'Avenir' && stock > 0;
                      })
                      .map(item => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name} ({item.stockRestant ?? item.stockInitial} en stock)
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
              
              {selectedItem && (
                <div className="p-4 mb-4 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Emplacement</p>
                      <p className="font-medium">{selectedItem.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium capitalize">
                        {typeof selectedItem.type === 'string' ? 'Chargement...' : selectedItem.type.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Stock actuel</p>
                      <p className="font-medium">
                        {currentStock} {selectedItem.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité à retirer
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="input w-full"
                  min="1"
                  max={currentStock > 0 ? currentStock : undefined}
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      setQuantity(value);
                    }
                  }}
                  onBlur={() => {
                    if (quantity < 1) {
                      setQuantity(1);
                    } else if (currentStock > 0 && quantity > currentStock) {
                      setQuantity(currentStock);
                    }
                  }}
                  required
                />
                {selectedItem && (
                  <p className="mt-1 text-sm text-gray-500">
                    Stock après sortie: {currentStock - quantity} {selectedItem.unit}
                  </p>
                )}
                {selectedItem && quantity > currentStock && (
                  <p className="mt-1 text-sm text-red-600">
                    La quantité demandée dépasse le stock disponible
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Raison de la sortie (optionnel)
                </label>
                <textarea
                  id="notes"
                  className="input w-full"
                  rows={3}
                  placeholder="Vente, transfert, perte, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  disabled={!selectedItemId || !quantity || quantity <= 0 || quantity > currentStock}
                >
                  {loading ? 'Traitement en cours...' : 'Valider la sortie'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Help sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>1. Recherchez l'article dans le champ de recherche</p>
              <p>2. Sélectionnez l'article à retirer du stock</p>
              <p>3. Entrez la quantité à retirer (ne peut pas dépasser le stock disponible)</p>
              <p>4. Indiquez la raison de la sortie (vente, transfert, etc.)</p>
              <p>5. Cliquez sur "Valider la sortie" pour confirmer</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <div className="flex items-center mb-3">
              <Package className="h-5 w-5 text-yellow-600 mr-2" />
              <h3 className="font-semibold text-yellow-900">Attention</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Une fois la sortie validée, le stock sera immédiatement mis à jour.
              Cette action ne peut pas être annulée directement, vous devrez faire
              une entrée de stock pour corriger une erreur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
 