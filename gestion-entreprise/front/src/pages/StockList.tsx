import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ArrowDown, ArrowUp, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { StockItem } from '../services/stockItemService';
import type { ItemType } from '../services/itemTypeService';
import { itemTypeService } from '../services/itemTypeService';

export default function StockList() {
  const { stockItems } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch item types
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        setLoading(true);
        const types = await itemTypeService.getAll();
        setItemTypes(types);
      } catch (error) {
        console.error('Error fetching item types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItemTypes();
  }, []);

  // Location options
  const locationOptions = [
    { value: 'Cotona', label: 'Cotona' },
    { value: 'Maison', label: 'Maison' },
    { value: 'Avishay', label: 'Avishay' },
    { value: 'Avenir', label: 'Avenir' }
  ];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return stockItems
      .filter(item => {
        // Apply search
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply location filter
        const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
        
        // Apply type filter
        const matchesType = typeFilter === 'all' || (
          typeof item.type === 'object' && (
            (item.type['@id'] && item.type['@id'] === `/api/item_types/${typeFilter}`) ||
            item.type.id === typeFilter
          )
        );
        
        return matchesSearch && matchesLocation && matchesType;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortField === 'quantity') {
          return sortDirection === 'asc'
            ? (a.stockRestant || a.stockInitial) - (b.stockRestant || b.stockInitial)
            : (b.stockRestant || b.stockInitial) - (a.stockRestant || a.stockInitial);
        } else if (sortField === 'location') {
          return sortDirection === 'asc'
            ? a.location.localeCompare(b.location)
            : b.location.localeCompare(a.location);
        } else if (sortField === 'type') {
          const typeA = typeof a.type === 'object' ? a.type.name : '';
          const typeB = typeof b.type === 'object' ? b.type.name : '';
          return sortDirection === 'asc'
            ? typeA.localeCompare(typeB)
            : typeB.localeCompare(typeA);
        }
        return 0;
      });
  }, [stockItems, searchTerm, locationFilter, typeFilter, sortField, sortDirection]);

  // Count items with low stock (less than or equal to 10)
  const lowStockCount = stockItems.filter(item => 
    (item.stockRestant || item.stockInitial) <= 10
  ).length;

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Generate table header with sort indicators
  const SortableHeader = ({ field, label }: { field: string, label: string }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        <span className="ml-1">
          {sortField === field ? (
            sortDirection === 'asc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </span>
      </div>
    </th>
  );
  
  const getLocationName = (location: string) => {
    const locationOption = locationOptions.find(opt => opt.value === location);
    return locationOption ? locationOption.label : location;
  };
  
  const getTypeName = (type: string) => {
    switch (type) {
      case 'fourniture': return 'Fourniture';
      case 'textile': return 'Textile';
      case 'electromenager': return 'Électroménager';
      case 'autre': return 'Autre';
      default: return type;
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Référence', 'Article', 'Type', 'Emplacement', 'Unité', 'Stock Initial', 'Stock Restant', 'Entrées', 'Sorties'];
    const csvData = filteredItems.map(item => {
      const currentStock = item.stockRestant ?? item.stockInitial;
      const type = typeof item.type === 'object' ? item.type.name : '';
      
      return [
        item.reference,
        item.name,
        type,
        item.location,
        item.unit,
        item.stockInitial.toString(),
        currentStock.toString(),
        (item.nbEntrees || 0).toString(),
        (item.nbSorties || 0).toString()
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire-stock-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Liste complète du Stock</h1>
        <p className="mt-1 text-gray-600">Gérez et visualisez tous vos articles ({filteredItems.length} articles)</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
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
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les emplacements</option>
              {locationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les types</option>
              {itemTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            {filteredItems.length} article{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
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
            
            <Link 
              to="/stock/entry" 
              className="btn-sm bg-green-100 text-green-700 hover:bg-green-200"
            >
              Entrée
            </Link>
            <Link 
              to="/stock/exit" 
              className="btn-sm bg-red-100 text-red-700 hover:bg-red-200"
            >
              Sortie
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stock Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="name" label="Produit" />
                <SortableHeader field="type" label="Type" />
                <SortableHeader field="location" label="Emplacement" />
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unité
                </th>
                <SortableHeader field="quantity" label="Quantité" />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {typeof item.type === 'object' ? item.type.name : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {getLocationName(item.location)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 capitalize">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                    {item.stockRestant || item.stockInitial}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (item.stockRestant || item.stockInitial) <= 10
                        ? 'bg-red-100 text-red-800'
                        : (item.stockRestant || item.stockInitial) <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(item.stockRestant || item.stockInitial) <= 10
                        ? 'Critique'
                        : (item.stockRestant || item.stockInitial) <= 30
                        ? 'Bas'
                        : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
              
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <Package className="h-10 w-10 text-gray-400 mb-2" />
                      <p>Aucun article trouvé</p>
                      {searchTerm || locationFilter !== 'all' || typeFilter !== 'all' ? (
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
                      ) : (
                        <p className="mt-2 text-gray-400">
                          Commencez par ajouter des produits à votre inventaire
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredItems.length)} sur {filteredItems.length} articles
          </div>
          <div className="flex space-x-1">
            <button 
              className="btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 