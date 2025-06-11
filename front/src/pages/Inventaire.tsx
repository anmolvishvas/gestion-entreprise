import { useState, useEffect } from 'react';
import { Package, Edit, Search, TrendingUp, AlertTriangle, Boxes, Palette } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { StockItem, ColorStock } from '../services/stockItemService';
import { itemTypeService, type ItemType } from '../services/itemTypeService';
import { stockItemService } from '../services/stockItemService';
import { colorStockService } from '../services/colorStockService';
import { colorStockMovementService } from '../services/colorStockMovementService';

export default function Inventaire() {
  const { stockItems, updateStockItem, addStockItem, refreshStockData } = useAppContext();
  
  // For filtering items
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  
  // Load item types
  useEffect(() => {
    const loadItemTypes = async () => {
      try {
        const types = await itemTypeService.getAll();
        setItemTypes(types);
      } catch (error) {
        console.error('Failed to load item types:', error);
      }
    };
    loadItemTypes();
  }, []);
  
  // For adding new item
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemReference, setNewItemReference] = useState('');
  const [newItemStockInitial, setNewItemStockInitial] = useState(0);
  const [newItemLocation, setNewItemLocation] = useState<'Cotona' | 'Maison' | 'Avishay' | 'Avenir'>('Cotona');
  const [newItemType, setNewItemType] = useState<string>('');
  const [newItemUnit, setNewItemUnit] = useState<'piece' | 'carton' | 'bal'>('piece');
  
  // For editing existing item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingColorId, setEditingColorId] = useState<number | null>(null);
  const [editStockRestant, setEditStockRestant] = useState(0);
  const [showColorDetails, setShowColorDetails] = useState<string | null>(null);
  
  // For error feedback
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Filter items based on search and filters
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
    const matchesType = typeFilter === 'all' || (
      typeof item.type === 'object' ? 
      item.type.name === typeFilter :
      item.type === typeFilter
    );
    
    return matchesSearch && matchesLocation && matchesType;
  });

  // Calculate statistics
  const totalItems = stockItems.length;
  const lowStockCount = stockItems.filter(item => (item.stockRestant || 0) <= 10).length;
  const totalStock = stockItems.reduce((sum, item) => sum + (item.stockRestant || 0), 0);
  
  // Handle adding new item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItemName || !newItemReference || newItemStockInitial < 0) {
      return;
    }
    
    const newItem = {
      reference: newItemReference,
      name: newItemName,
      stockInitial: newItemStockInitial,
      location: newItemLocation,
      type: newItemType,
      unit: newItemUnit,
      dateDernierInventaire: new Date().toISOString(),
      hasColors: false
    };
    
    addStockItem(newItem);
    
    // Reset form
    setNewItemName('');
    setNewItemReference('');
    setNewItemStockInitial(0);
    setShowNewItemForm(false);
  };
  
  // Handle updating item quantity
  const handleUpdateQuantity = async (itemId: string, colorId?: number) => {
    if (editingItemId === itemId && (!colorId || editingColorId === colorId)) {
      setUpdateError(null);
      try {
        if (colorId) {
          // Get the current item to access the color stock
          const currentItem = await stockItemService.getById(itemId);
          const currentColorStock = currentItem.colorStocks?.find(cs => cs.id === colorId);
          
          if (currentColorStock) {
            // Update the color stock with all necessary information
            await colorStockService.update(colorId, {
              stockInitial: editStockRestant,
              stockItem: `/api/stock_items/${itemId}`,
              color: currentColorStock.color
            });

            // Get movements only for this specific color stock
            const movements = await colorStockMovementService.getByColorStock(colorId);
            
            // Delete movements only for this specific color stock
            if (movements.length > 0) {
              await Promise.all(
                movements
                  .filter(movement => movement.colorStock.id === colorId)
                  .map(movement => colorStockMovementService.delete(movement.id))
              );
            }

            // Get the IRIs of all colorStocks
            const colorStockIris = currentItem.colorStocks?.map(cs => `/api/color_stocks/${cs.id}`);

            // Prepare clean data for item update
            const updateData = {
              reference: currentItem.reference,
              name: currentItem.name,
              type: typeof currentItem.type === 'object' ? currentItem.type['@id'] : currentItem.type,
              location: currentItem.location,
              unit: currentItem.unit,
              stockInitial: currentItem.stockInitial,
              hasColors: currentItem.hasColors,
              dateDernierInventaire: new Date().toISOString(),
              colorStocks: colorStockIris
            } as Partial<StockItem>;
            
            // Update the parent stock item
            await stockItemService.update(itemId, updateData);
          }
        } else {
          // Update regular stock
          await stockItemService.updateInventory(itemId, editStockRestant);
        }
        setEditingItemId(null);
        setEditingColorId(null);
        await refreshStockData();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error);
        setUpdateError('Erreur lors de la mise à jour du stock. Veuillez réessayer.');
      }
    } else {
      const item = stockItems.find(item => item.id === itemId);
      if (item) {
        if (colorId) {
          const colorStock = item.colorStocks?.find(cs => cs.id === colorId);
          if (colorStock) {
            setEditStockRestant(colorStock.stockRestant);
            setEditingColorId(colorId);
          }
        } else {
          setEditStockRestant(item.stockRestant || 0);
        }
        setEditingItemId(itemId);
      }
    }
  };
  
  // Helper function to get type name
  const getTypeName = (type: any) => {
    if (typeof type === 'object' && type !== null) {
      return type.name || 'Inconnu';
    }
    return type;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              Inventaire
            </span>
            <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
              {totalItems} articles
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Ajustez les quantités et mettez à jour votre stock
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <Boxes className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-blue-100 text-sm">Total Articles</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-emerald-100 text-sm">Stock Total</p>
                <p className="text-2xl font-bold">{totalStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-red-100 text-sm">Stock Faible</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>
      
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Rechercher
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  className="input pl-10 w-full"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Location Filter */}
            <div>
              <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Emplacement
              </label>
              <select
                id="locationFilter"
                className="input w-full"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">Tous les emplacements</option>
                <option value="Cotona">Cotona</option>
                <option value="Maison">Maison</option>
                <option value="Avishay">Avishay</option>
                <option value="Avenir">Avenir</option>
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="typeFilter"
                className="input w-full"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tous les types</option>
                {itemTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredItems.length} article{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
            </p>
            
            <button
              onClick={() => setShowNewItemForm(!showNewItemForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {showNewItemForm ? 'Annuler' : 'Ajouter un article'}
            </button>
          </div>
        </div>
        
        {/* Show error message if there is one */}
        {updateError && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl relative">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {updateError}
            </div>
          </div>
        )}
        
        {/* New Item Form */}
        {showNewItemForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Nouvel Article</h2>
            
            <form onSubmit={handleAddItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newItemReference" className="block text-sm font-medium text-gray-700 mb-1">
                    Référence
                  </label>
                  <input
                    type="text"
                    id="newItemReference"
                    className="input w-full"
                    value={newItemReference}
                    onChange={(e) => setNewItemReference(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newItemName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'article
                  </label>
                  <input
                    type="text"
                    id="newItemName"
                    className="input w-full"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newItemStockInitial" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Initial
                  </label>
                  <input
                    type="number"
                    id="newItemStockInitial"
                    className="input w-full"
                    value={newItemStockInitial}
                    onChange={(e) => setNewItemStockInitial(Math.max(0, parseInt(e.target.value) || 0))}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newItemLocation" className="block text-sm font-medium text-gray-700 mb-1">
                    Emplacement
                  </label>
                  <select
                    id="newItemLocation"
                    className="input w-full"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value as 'Cotona' | 'Maison' | 'Avishay' | 'Avenir')}
                    required
                  >
                    <option value="Cotona">Cotona</option>
                    <option value="Maison">Maison</option>
                    <option value="Avishay">Avishay</option>
                    <option value="Avenir">Avenir</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="newItemType" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="newItemType"
                    className="input w-full"
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner un type</option>
                    {itemTypes.map(type => (
                      <option key={type.id} value={type['@id'] || `/api/item_types/${type.id}`}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unité
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="piece"
                        checked={newItemUnit === 'piece'}
                        onChange={() => setNewItemUnit('piece')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Pièce</span>
                    </label>
                    
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="carton"
                        checked={newItemUnit === 'carton'}
                        onChange={() => setNewItemUnit('carton')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Carton</span>
                    </label>

                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="bal"
                        checked={newItemUnit === 'bal'}
                        onChange={() => setNewItemUnit('bal')}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Bal</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Ajouter à l'inventaire
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Inventory Table/Cards */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emplacement
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Restant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item: StockItem) => {
                  const mainRow = (
                    <tr key={`${item.id}-main`} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {item.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3 flex items-center">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.reference}</p>
                            </div>
                            {item.hasColors && (
                              <button
                                onClick={() => setShowColorDetails(showColorDetails === item.id ? null : item.id)}
                                className="ml-2 p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                title="Voir les couleurs"
                              >
                                <Palette className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {getTypeName(item.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 capitalize">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {editingItemId === item.id && !item.hasColors ? (
                          <input
                            type="number"
                            className="w-20 text-center border border-gray-300 rounded-md px-2 py-1"
                            value={editStockRestant}
                            onChange={(e) => setEditStockRestant(Math.max(0, parseInt(e.target.value) || 0))}
                          />
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            (item.stockRestant ?? 0) <= 10
                              ? 'bg-red-100 text-red-800'
                              : (item.stockRestant ?? 0) <= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.stockRestant ?? 0}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!item.hasColors && (
                          <button
                            onClick={() => handleUpdateQuantity(item.id)}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg ${
                              editingItemId === item.id
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            } transition-colors duration-200`}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1" />
                            {editingItemId === item.id ? 'Sauvegarder' : 'Modifier'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );

                  const colorRow = item.hasColors && showColorDetails === item.id && (
                    <tr key={`${item.id}-colors`} className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Stocks par couleur</h4>
                          <div className="grid gap-3">
                            {item.colorStocks?.map((colorStock: ColorStock) => (
                              <div key={colorStock.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full bg-gray-200 mr-3"></div>
                                  <span className="text-sm font-medium text-gray-900">{colorStock.color}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {editingItemId === item.id && editingColorId === colorStock.id ? (
                                    <input
                                      type="number"
                                      className="w-20 text-center border border-gray-300 rounded-md px-2 py-1"
                                      value={editStockRestant}
                                      onChange={(e) => setEditStockRestant(Math.max(0, parseInt(e.target.value) || 0))}
                                    />
                                  ) : (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                      (colorStock.stockRestant ?? 0) <= 10
                                        ? 'bg-red-100 text-red-800'
                                        : (colorStock.stockRestant ?? 0) <= 30
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}>
                                      {colorStock.stockRestant}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleUpdateQuantity(item.id, colorStock.id)}
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg ${
                                      editingItemId === item.id && editingColorId === colorStock.id
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                    } transition-colors duration-200`}
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                    {editingItemId === item.id && editingColorId === colorStock.id ? 'Sauvegarder' : 'Modifier'}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );

                  return [mainRow, colorRow];
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item: StockItem) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {item.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.reference}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateQuantity(item.id)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg ${
                        editingItemId === item.id
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      } transition-colors duration-200`}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      {editingItemId === item.id ? 'Sauvegarder' : 'Modifier'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{getTypeName(item.type)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Emplacement</p>
                      <p className="font-medium">{item.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Unité</p>
                      <p className="font-medium capitalize">{item.unit}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stock</p>
                      {item.hasColors ? (
                        <button
                          onClick={() => setShowColorDetails(showColorDetails === item.id ? null : item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          Voir les couleurs
                        </button>
                      ) : (
                        editingItemId === item.id ? (
                          <input
                            type="number"
                            className="w-20 text-center border border-gray-300 rounded-md px-2 py-1"
                            value={editStockRestant}
                            onChange={(e) => setEditStockRestant(Math.max(0, parseInt(e.target.value) || 0))}
                          />
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            (item.stockRestant ?? 0) <= 10
                              ? 'bg-red-100 text-red-800'
                              : (item.stockRestant ?? 0) <= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.stockRestant ?? 0}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Color details section */}
                  {item.hasColors && showColorDetails === item.id && (
                    <div className="mt-4 space-y-3">
                      <h4 className="font-medium text-gray-900">Stocks par couleur</h4>
                      <div className="space-y-2">
                        {item.colorStocks?.map((colorStock: ColorStock) => (
                          <div key={colorStock.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-gray-200 mr-3"></div>
                              <span className="text-sm font-medium text-gray-900">{colorStock.color}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {editingItemId === item.id && editingColorId === colorStock.id ? (
                                <input
                                  type="number"
                                  className="w-20 text-center border border-gray-300 rounded-md px-2 py-1"
                                  value={editStockRestant}
                                  onChange={(e) => setEditStockRestant(Math.max(0, parseInt(e.target.value) || 0))}
                                />
                              ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  (colorStock.stockRestant ?? 0) <= 10
                                    ? 'bg-red-100 text-red-800'
                                    : (colorStock.stockRestant ?? 0) <= 30
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {colorStock.stockRestant}
                                </span>
                              )}
                              <button
                                onClick={() => handleUpdateQuantity(item.id, colorStock.id)}
                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg ${
                                  editingItemId === item.id && editingColorId === colorStock.id
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                } transition-colors duration-200`}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                {editingItemId === item.id && editingColorId === colorStock.id ? 'Sauvegarder' : 'Modifier'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center">
                    <Package className="h-10 w-10 text-gray-400 mb-2" />
                    {searchTerm || locationFilter !== 'all' || typeFilter !== 'all' ? (
                      <>
                        <p>Aucun article trouvé avec ces critères</p>
                        <button 
                          className="mt-2 text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setSearchTerm('');
                            setLocationFilter('all');
                            setTypeFilter('all');
                          }}
                        >
                          Réinitialiser les filtres
                        </button>
                      </>
                    ) : (
                      <>
                        <p>Aucun article dans l'inventaire</p>
                        <button 
                          className="mt-2 text-blue-600 hover:text-blue-800"
                          onClick={() => setShowNewItemForm(true)}
                        >
                          Ajouter un article
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 