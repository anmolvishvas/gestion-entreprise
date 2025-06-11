import { useState, useEffect } from 'react';
import { ArrowUp, Package, Search, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { stockItemService } from '../services/stockItemService';
import { stockMovementService } from '../services/stockMovementService';
import type { StockItem } from '../services/stockItemService';
import { useAppContext } from '../context/AppContext';

export default function StockExit() {
  const navigate = useNavigate();
  const { stockItems, addStockMovement, refreshStockData } = useAppContext();
  
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
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
        setQuantity(0);
      } else {
        console.warn('Selected item not found in stockItems:', newSelectedId);
      }
    } else {
      setQuantity(0);
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
      if (selectedItem.hasColors) {
        if (!selectedColor) {
          throw new Error('Veuillez sélectionner une couleur');
        }

        const colorStock = selectedItem.colorStocks?.find(cs => cs.id === Number(selectedColor));
        if (!colorStock) {
          throw new Error('Couleur non trouvée');
        }

        if (colorStock.stockRestant < quantity) {
          throw new Error(`Stock insuffisant pour la couleur ${colorStock.color}`);
        }

        // Create movement for color stock
        await stockMovementService.createColorMovement({
          colorStock: `/api/color_stocks/${colorStock.id}`,
          type: 'sortie',
          quantity,
          date: new Date().toISOString(),
          notes: notes || 'Sortie de stock'
        });
      } else {
        await addStockMovement({
          date: new Date().toISOString(),
          stockItem: `/api/stock_items/${selectedItemId}`,
          type: 'sortie',
          quantity,
          notes: notes || 'Sortie de stock'
        });
      }
      await refreshStockData();
      navigate('/stock/movements');
    } catch (err) {
      console.error('Error creating stock movement:', err);
      setError('Erreur lors de la création du mouvement de stock');
      setLoading(false);
    }
  };

  if (loading && !stockItems.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to="/stock"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <span className="bg-gradient-to-r from-red-600 to-orange-600 text-transparent bg-clip-text">
              Sortie de Stock
            </span>
          </h1>
        </div>
        <p className="text-lg text-gray-600">
          Retirez des articles de votre inventaire
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 mb-6 flex items-center">
          <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mr-3"></div>
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 divide-y divide-gray-100">
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                    <ArrowUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Sortie d'article
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Retirez des articles de votre stock
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="itemSearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un article
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="itemSearch"
                      className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      placeholder="Rechercher un article..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="selectedItem" className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un article
                  </label>
                  <select
                    id="selectedItem"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
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
                  <div className="mb-6 bg-gray-50 rounded-xl overflow-hidden">
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Emplacement</p>
                          <p className="text-base font-semibold text-gray-900">{selectedItem.location}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                          <p className="text-base font-semibold text-gray-900 capitalize">
                            {typeof selectedItem.type === 'string' ? 'Chargement...' : selectedItem.type.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Stock actuel</p>
                          <p className="text-base font-semibold text-gray-900">
                            {currentStock} {selectedItem.unit}
                          </p>
                        </div>
                      </div>

                      {selectedItem.hasColors && selectedItem.colorStocks && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-500 mb-2">Stock par couleur</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedItem.colorStocks.map(colorStock => (
                              <div key={colorStock.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-sm font-medium text-gray-900">{colorStock.color}</p>
                                <p className="text-sm text-gray-600">{colorStock.stockRestant} {selectedItem.unit}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedItem?.hasColors && (
                  <div className="mb-6">
                    <label htmlFor="selectedColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner une couleur
                    </label>
                    <select
                      id="selectedColor"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une couleur</option>
                      {selectedItem.colorStocks?.map(colorStock => (
                        <option 
                          key={colorStock.id} 
                          value={colorStock.id}
                          disabled={colorStock.stockRestant <= 0}
                        >
                          {colorStock.color} ({colorStock.stockRestant} {selectedItem.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="mb-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité à retirer
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    min="1"
                    max={currentStock > 0 ? currentStock : undefined}
                    value={quantity || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setQuantity(isNaN(value) ? 0 : value);
                    }}
                    onBlur={() => {
                      if (quantity <= 0) {
                        setQuantity(0);
                      } else if (currentStock > 0 && quantity > currentStock) {
                        setQuantity(currentStock);
                      }
                    }}
                    required
                    placeholder="Entrez la quantité"
                  />
                  {selectedItem && quantity > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        Stock après sortie: {currentStock - quantity} {selectedItem.unit}
                      </p>
                      {quantity > currentStock && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          La quantité demandée dépasse le stock disponible
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la sortie (optionnel)
                  </label>
                  <textarea
                    id="notes"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    rows={3}
                    placeholder="Vente, transfert, perte, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-b-xl">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-600 hover:to-orange-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    disabled={!selectedItemId || quantity <= 0 || quantity > currentStock}
                  >
                    <ArrowUp className="h-5 w-5 mr-2 text-red-100" />
                    {loading ? 'Traitement en cours...' : 'Valider la sortie'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Help sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm">1</div>
                  <p className="text-sm">Recherchez l'article dans le champ de recherche</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm">2</div>
                  <p className="text-sm">Sélectionnez l'article à retirer du stock</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm">3</div>
                  <p className="text-sm">Entrez la quantité à retirer</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm">4</div>
                  <p className="text-sm">Indiquez la raison de la sortie</p>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-medium text-sm">5</div>
                  <p className="text-sm">Cliquez sur "Valider la sortie" pour confirmer</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/50 text-amber-600 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-amber-900">
                Attention
              </h3>
            </div>
            <p className="text-sm text-amber-700">
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
 