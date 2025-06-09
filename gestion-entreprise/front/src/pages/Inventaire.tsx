import { useState, useEffect } from 'react';
import { Package, Edit, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { StockItem } from '../services/stockItemService';
import { itemTypeService, type ItemType } from '../services/itemTypeService';
import { stockItemService } from '../services/stockItemService';

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
  const [newItemUnit, setNewItemUnit] = useState<'piece' | 'unite'>('piece');
  
  // For editing existing item
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editStockRestant, setEditStockRestant] = useState(0);
  
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
    };
    
    addStockItem(newItem);
    
    // Reset form
    setNewItemName('');
    setNewItemReference('');
    setNewItemStockInitial(0);
    setShowNewItemForm(false);
  };
  
  // Handle updating item quantity
  const handleUpdateQuantity = async (itemId: string) => {
    if (editingItemId === itemId) {
      setUpdateError(null);
      try {
        // Use the new updateInventory method that handles movement deletion
        await stockItemService.updateInventory(itemId, editStockRestant);
        setEditingItemId(null);
        // Refresh the stock data to get the updated list
        await refreshStockData();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock:', error);
        setUpdateError('Erreur lors de la mise à jour du stock. Veuillez réessayer.');
      }
    } else {
      const item = stockItems.find(item => item.id === itemId);
      if (item) {
        setEditStockRestant(item.stockRestant || 0);
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventaire</h1>
        <p className="mt-1 text-gray-600">Ajustez les quantités et mettez à jour votre stock</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
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
            className="btn btn-primary"
          >
            {showNewItemForm ? 'Annuler' : 'Ajouter un article'}
          </button>
        </div>
      </div>
      
      {/* Show error message if there is one */}
      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {updateError}
        </div>
      )}
      
      {/* New Item Form */}
      {showNewItemForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
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
                      value="unite"
                      checked={newItemUnit === 'unite'}
                      onChange={() => setNewItemUnit('unite')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">Unité</span>
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
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
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
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      className="w-20 text-center border border-gray-300 rounded-md px-2 py-1"
                      value={editStockRestant}
                      onChange={(e) => setEditStockRestant(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  ) : (
                    <span className={`text-sm font-medium ${
                      (item.stockRestant || 0) <= 10 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.stockRestant || 0}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleUpdateQuantity(item.id)}
                    className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                      editingItemId === item.id
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    {editingItemId === item.id ? 'Sauvegarder' : 'Modifier'}
                  </button>
                </td>
              </tr>
            ))}
            
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
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
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 