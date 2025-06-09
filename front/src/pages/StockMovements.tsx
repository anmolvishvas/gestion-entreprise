import  { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Calendar, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import type { StockMovement } from '../services/stockMovementService';
import type { StockItem } from '../services/stockItemService';
import { stockItemService } from '../services/stockItemService';

export default function StockMovements() {
  const { stockMovements } = useAppContext();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entree' | 'sortie'>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  
  // Fetch complete stock items data
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        setLoading(true);
        const items = await stockItemService.getAll();
        setStockItems(items);
      } catch (error) {
        console.error('Error fetching stock items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockItems();
  }, []);
  
  // Generate location options based on unique stock item locations
  const locationOptions = Array.from(new Set(stockItems.map(item => item.location)));
  
  // Helper to get complete stock item
  const getCompleteStockItem = (stockItem: StockItem | string): StockItem | undefined => {
    if (typeof stockItem === 'string') {
      const itemId = stockItem.split('/').pop();
      return stockItems.find(item => item.id === itemId);
    }
    return stockItems.find(item => item.id === stockItem.id);
  };
  
  // Helper to get item name
  const getItemName = (movement: StockMovement): string => {
    const item = getCompleteStockItem(movement.stockItem);
    return item ? item.name : 'Article inconnu';
  };
  
  // Helper to get location name
  const getLocationName = (movement: StockMovement): string => {
    const item = getCompleteStockItem(movement.stockItem);
    return item ? item.location : 'Inconnu';
  };
  
  // Apply filters
  const filteredMovements = stockMovements.filter(movement => {
    // Type filter
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    
    // Date filter
    const movementDate = new Date(movement.date);
    const matchesStartDate = !startDate || movementDate >= new Date(startDate);
    const matchesEndDate = !endDate || movementDate <= new Date(endDate);
    
    // Item filter
    const item = getCompleteStockItem(movement.stockItem);
    const matchesItem = itemFilter === 'all' || (item && String(item.id) === String(itemFilter));
    
    // Location filter
    const location = getLocationName(movement);
    const matchesLocation = locationFilter === 'all' || location === locationFilter;
    
    return matchesType && matchesStartDate && matchesEndDate && matchesItem && matchesLocation;
  });
  
  // Sort movements by date (newest first)
  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Paginate
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);
  const paginatedMovements = sortedMovements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate summary statistics
  const totalEntries = filteredMovements.filter(m => m.type === 'entree')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalExits = filteredMovements.filter(m => m.type === 'sortie')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  // Calculate total items with low stock
  const lowStockCount = stockItems.filter(item => {
    const currentStock = item.stockRestant ?? item.stockInitial;
    return currentStock <= 10;
  }).length;
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Article', 'Emplacement', 'Type', 'Quantité', 'Notes'];
    const csvData = sortedMovements.map(movement => {
      return [
        formatDate(movement.date),
        getItemName(movement),
        getLocationName(movement),
        movement.type === 'entree' ? 'Entrée' : 'Sortie',
        movement.quantity.toString(),
        movement.notes
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mouvements-stock-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mouvements de Stock</h1>
        <p className="mt-1 text-gray-600">Historique des entrées et sorties</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date filters */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date début
            </label>
            <input
              type="date"
              id="startDate"
              className="input w-full"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Date fin
            </label>
            <input
              type="date"
              id="endDate"
              className="input w-full"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Type filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="typeFilter"
              className="input w-full"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as 'all' | 'entree' | 'sortie');
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous</option>
              <option value="entree">Entrées</option>
              <option value="sortie">Sorties</option>
            </select>
          </div>
          
          {/* Item filter */}
          <div>
            <label htmlFor="itemFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Article
            </label>
            <select
              id="itemFilter"
              className="input w-full"
              value={itemFilter}
              onChange={(e) => {
                setItemFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les articles</option>
              {stockItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Location filter */}
          <div>
            <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Emplacement
            </label>
            <select
              id="locationFilter"
              className="input w-full"
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les emplacements</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            {filteredMovements.length} mouvement{filteredMovements.length !== 1 ? 's' : ''} trouvé{filteredMovements.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setTypeFilter('all');
                setItemFilter('all');
                setLocationFilter('all');
                setCurrentPage(1);
              }}
              className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Réinitialiser
            </button>
            
            <button
              onClick={exportToCSV}
              className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total mouvements</p>
              <p className="text-xl sm:text-2xl font-semibold">{filteredMovements.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total entrées</p>
              <p className="text-xl sm:text-2xl font-semibold">{totalEntries}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total sorties</p>
              <p className="text-xl sm:text-2xl font-semibold">{totalExits}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Movements table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile view */}
        <div className="md:hidden">
          {paginatedMovements.map((movement) => {
            const item = getCompleteStockItem(movement.stockItem);
            return (
              <div key={movement.id} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{item?.name || 'Article inconnu'}</h3>
                    <p className="text-sm text-gray-600">{item?.location || 'Emplacement inconnu'}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    movement.type === 'entree' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-1 text-gray-900">{new Date(movement.date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantité:</span>
                    <span className={`ml-1 font-medium ${
                      movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                    </span>
                  </div>
                  {movement.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Notes:</span>
                      <span className="ml-1 text-gray-900">{movement.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMovements.map((movement) => {
                const item = getCompleteStockItem(movement.stockItem);
                return (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item?.name || 'Article inconnu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item?.location || 'Emplacement inconnu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        movement.type === 'entree' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${
                        movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {movement.notes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Suivant
            </button>
          </nav>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Link to="/stock/entry" className="btn bg-green-600 text-white hover:bg-green-700">
          <ArrowDown className="h-5 w-5 mr-2" />
          Nouvelle entrée
        </Link>
        
        <Link to="/stock/exit" className="btn bg-red-600 text-white hover:bg-red-700">
          <ArrowUp className="h-5 w-5 mr-2" />
          Nouvelle sortie
        </Link>
      </div>
    </div>
  );
}
 