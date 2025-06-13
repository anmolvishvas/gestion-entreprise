import  { useState, useEffect } from 'react';
import { 
  ArrowDown, ArrowUp, Calendar, Download, 
  Package, TrendingUp, TrendingDown, AlertTriangle,
  ChevronRight, Search, Filter, X, Palette 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import type { StockMovement } from '../services/stockMovementService';
import type { StockItem } from '../services/stockItemService';
import { stockItemService } from '../services/stockItemService';
import { colorStockMovementService, type ColorStockMovement } from '../services/colorStockMovementService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Type union pour représenter tous les types de mouvements
type Movement = 
  | (StockMovement & { movementType: 'stock' }) 
  | (ColorStockMovement & { movementType: 'color' });

export default function StockMovements() {
  const { stockMovements } = useAppContext();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [colorMovements, setColorMovements] = useState<ColorStockMovement[]>([]);
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entree' | 'sortie'>('all');
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;
  
  // Fetch complete stock items data and color movements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [items, colorMvts] = await Promise.all([
          stockItemService.getAll(),
          colorStockMovementService.getAll()
        ]);
        console.log('Loaded stock items:', items);
        console.log('Loaded color movements:', colorMvts);
        setStockItems(items);
        setColorMovements(colorMvts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Combine regular movements and color movements
  const allMovements: Movement[] = [
    ...stockMovements.map(m => ({ ...m, movementType: 'stock' as const })),
    ...colorMovements.map(m => ({ ...m, movementType: 'color' as const }))
  ];
  
  console.log('Combined movements:', allMovements);
  
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
  const getItemName = (movement: Movement): string => {
    if (movement.movementType === 'color') {
      const stockItem = movement.colorStock?.stockItem;
      return stockItem ? `${stockItem.name} (${movement.colorStock.color})` : 'Article inconnu';
    } else {
      const item = getCompleteStockItem(movement.stockItem);
      return item ? item.name : 'Article inconnu';
    }
  };
  
  // Helper to get location name
  const getLocationName = (movement: Movement): string => {
    if (movement.movementType === 'color') {
      const stockItem = movement.colorStock?.stockItem;
      return stockItem?.location || 'Inconnu';
    } else {
      const item = getCompleteStockItem(movement.stockItem);
      return item?.location || 'Inconnu';
    }
  };
  
  // Apply filters
  const filteredMovements = allMovements.filter(movement => {
    // Type filter
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    
    // Date filter
    const movementDate = new Date(movement.date);
    const matchesStartDate = !startDate || movementDate >= new Date(startDate);
    const matchesEndDate = !endDate || movementDate <= new Date(endDate);
    
    // Item filter
    let matchesItem = true;
    if (itemFilter !== 'all') {
      if (movement.movementType === 'color') {
        matchesItem = movement.colorStock.stockItem.id.toString() === itemFilter;
      } else {
        const item = getCompleteStockItem(movement.stockItem);
        matchesItem = item ? item.id.toString() === itemFilter : false;
      }
    }
    
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
  
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage
    
    // Add title
    doc.setFontSize(20);
    doc.text('Mouvements de Stock', 14, 22);
    
    // Add date range
    doc.setFontSize(12);
    const dateRange = startDate && endDate 
      ? `Période: ${new Date(startDate).toLocaleDateString('fr-FR')} - ${new Date(endDate).toLocaleDateString('fr-FR')}`
      : `Date: ${new Date().toLocaleDateString('fr-FR')}`;
    doc.text(dateRange, 14, 30);
    
    // Add summary statistics
    doc.setFontSize(11);
    doc.text(`Total Entrées: ${totalEntries}`, 14, 38);
    doc.text(`Total Sorties: ${totalExits}`, 14, 42);
    
    // Prepare table data
    const tableData = sortedMovements.map(movement => {
      const item = movement.movementType === 'color' 
        ? movement.colorStock.stockItem 
        : getCompleteStockItem(movement.stockItem);
      
      return [
        formatDate(movement.date),
        getItemName(movement),
        getLocationName(movement),
        movement.type === 'entree' ? 'Entrée' : 'Sortie',
        movement.quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (movement.movementType === 'color' 
          ? movement.colorStock.stockRestant 
          : item?.stockRestant ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        movement.notes || '-'
      ];
    });

    // Add main table
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Article', 'Emplacement', 'Type', 'Quantité', 'Stock Restant', 'Notes']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 40 }
      },
      margin: { top: 45 },
      pageBreak: 'auto',
      showFoot: 'lastPage',
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} sur ${data.pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`mouvements-stock-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Mouvements de Stock
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Historique des entrées et sorties ({filteredMovements.length} mouvements)
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Entries Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entrées</p>
              <p className="mt-2 text-3xl font-bold text-green-600">+{totalEntries}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Exits Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sorties</p>
              <p className="mt-2 text-3xl font-bold text-red-600">-{totalExits}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
    <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{lowStockCount}</p>
              <p className="mt-1 text-sm text-gray-500">articles en alerte</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <Link 
            to="/stock" 
            className="mt-4 inline-flex items-center text-sm text-amber-600 hover:text-amber-700"
          >
            Voir les articles
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Date filters */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date début
            </label>
            <div className="relative">
            <input
              type="date"
              id="startDate"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Date fin
            </label>
            <div className="relative">
            <input
              type="date"
              id="endDate"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Type filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="typeFilter"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            <label htmlFor="itemFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Article
            </label>
            <select
              id="itemFilter"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Emplacement
            </label>
            <select
              id="locationFilter"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600">
            {filteredMovements.length} mouvement{filteredMovements.length !== 1 ? 's' : ''} trouvé{filteredMovements.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setTypeFilter('all');
                setItemFilter('all');
                setLocationFilter('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </button>
            
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </button>
          </div>
        </div>
      </div>

      
      {/* Movements table */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Mobile view */}
        <div className="md:hidden divide-y divide-gray-100">
          {paginatedMovements.map((movement) => {
            const item = movement.movementType === 'color' 
              ? movement.colorStock.stockItem 
              : getCompleteStockItem(movement.stockItem);
            return (
              <div key={`${movement.movementType}-${movement.id}`} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{getItemName(movement)}</h3>
                    <p className="text-sm text-gray-500">{getLocationName(movement)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    movement.type === 'entree' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {movement.type === 'entree' ? 'Entrée' : 'Sortie'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(movement.date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantité:</span>
                    <span className={`ml-2 font-medium ${
                      movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock Restant:</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      movement.movementType === 'color' 
                        ? movement.colorStock.stockRestant <= 10
                          ? 'bg-red-100 text-red-800'
                          : movement.colorStock.stockRestant <= 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                        : item?.stockRestant && item.stockRestant <= 10
                          ? 'bg-red-100 text-red-800'
                          : item?.stockRestant && item.stockRestant <= 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {movement.movementType === 'color' 
                        ? movement.colorStock.stockRestant
                        : item?.stockRestant ?? 0}
                    </span>
                  </div>
                  {movement.notes && (
                    <div className="col-span-2 mt-2">
                      <span className="text-gray-500">Notes:</span>
                      <span className="ml-2 text-gray-900">{movement.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {paginatedMovements.length === 0 && (
            <div className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun mouvement</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun mouvement ne correspond aux critères de recherche.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setTypeFilter('all');
                    setItemFilter('all');
                    setLocationFilter('all');
                    setCurrentPage(1);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Restant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-100">
              {paginatedMovements.map((movement) => {
                const item = movement.movementType === 'color' 
                  ? movement.colorStock.stockItem 
                  : getCompleteStockItem(movement.stockItem);
                return (
                    <tr key={`${movement.movementType}-${movement.id}`} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(movement.date)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                            movement.type === 'entree' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            {movement.movementType === 'color' ? (
                              <Palette className={`h-4 w-4 ${
                                movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                              }`} />
                            ) : movement.type === 'entree' ? (
                              <ArrowDown className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUp className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{getItemName(movement)}</p>
                          </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getLocationName(movement)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          movement.type === 'entree'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        movement.movementType === 'color' 
                          ? movement.colorStock.stockRestant <= 10
                            ? 'bg-red-100 text-red-800'
                            : movement.colorStock.stockRestant <= 30
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                          : item?.stockRestant && item.stockRestant <= 10
                            ? 'bg-red-100 text-red-800'
                            : item?.stockRestant && item.stockRestant <= 30
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {movement.movementType === 'color' 
                          ? movement.colorStock.stockRestant
                          : item?.stockRestant ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {movement.notes || '-'}
                    </td>
                  </tr>
                );
              })}

                {paginatedMovements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun mouvement</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aucun mouvement ne correspond aux critères de recherche.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setTypeFilter('all');
                            setItemFilter('all');
                            setLocationFilter('all');
                            setCurrentPage(1);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Réinitialiser les filtres
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredMovements.length)} sur {filteredMovements.length} mouvements
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-xl ${
                  currentPage === page
                    ? 'bg-blue-50 border-blue-500 text-blue-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/stock/entree" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
        >
          <ArrowDown className="h-5 w-5 mr-2" />
          Nouvelle entrée
        </Link>
        
        <Link 
          to="/stock/sortie" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
        >
          <ArrowUp className="h-5 w-5 mr-2" />
          Nouvelle sortie
        </Link>
      </div>
    </div>
  );
}
 