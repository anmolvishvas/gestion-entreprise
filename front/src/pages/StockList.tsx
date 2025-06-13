import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Search, Filter, ArrowDown, ArrowUp, Download, 
  Plus, X, Edit, ArrowLeft, Check, Tags, Palette 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { StockItem } from '../services/stockItemService';
import type { ItemType } from '../services/itemTypeService';
import { itemTypeService } from '../services/itemTypeService';
import { stockItemService } from '../services/stockItemService';
import { colorStockService } from '../services/colorStockService';
import ColorStockModal from '../components/ColorStockModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function StockList() {
  const { stockItems, refreshStockData } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Modal states
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<StockItem | null>(null);

  // New item form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemReference, setNewItemReference] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemLocation, setNewItemLocation] = useState<"Cotona" | "Maison" | "Avishay" | "Avenir">("Cotona");
  const [newItemQuantity, setNewItemQuantity] = useState(0);
  const [newItemUnit, setNewItemUnit] = useState<"piece" | "carton" | "bal">("piece");
  const [newItemHasColors, setNewItemHasColors] = useState(false);
  const [colorStocks, setColorStocks] = useState<Array<{ color: string; stockInitial: number }>>([]);

  // Edit form states
  const [editItemName, setEditItemName] = useState('');
  const [editItemReference, setEditItemReference] = useState('');
  const [editItemType, setEditItemType] = useState('');
  const [editItemLocation, setEditItemLocation] = useState<"Cotona" | "Maison" | "Avishay" | "Avenir">("Cotona");
  const [editItemQuantity, setEditItemQuantity] = useState(0);
  const [editItemUnit, setEditItemUnit] = useState<"piece" | "carton" | "bal">("piece");
  const [editItemHasColors, setEditItemHasColors] = useState(false);
  const [editColorStocks, setEditColorStocks] = useState<Array<{ id?: number; color: string; stockInitial: number }>>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // New type form states
  const [isNewTypeFormVisible, setIsNewTypeFormVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeDescription, setNewTypeDescription] = useState('');

  // Color stock modal states
  const [selectedItemForColors, setSelectedItemForColors] = useState<StockItem | null>(null);

  // Reset form states
  const resetNewItemForm = () => {
    setNewItemName('');
    setNewItemReference('');
    setNewItemType('');
    setNewItemLocation("Cotona");
    setNewItemQuantity(0);
    setNewItemUnit("piece");
    setNewItemHasColors(false);
    setColorStocks([]);
    setError(null);
    setIsNewTypeFormVisible(false);
    setNewTypeName('');
    setNewTypeDescription('');
  };

  const resetEditForm = () => {
    setEditItemName('');
    setEditItemReference('');
    setEditItemType('');
    setEditItemLocation("Cotona");
    setEditItemQuantity(0);
    setEditItemUnit("piece");
    setEditItemHasColors(false);
    setEditColorStocks([]);
    setSelectedItemForEdit(null);
    setEditSearchTerm('');
    setError(null);
  };

  // Handle item selection for edit
  const handleItemSelect = (item: StockItem) => {
    setSelectedItemForEdit(item);
    setEditItemName(item.name);
    setEditItemReference(item.reference || '');
    setEditItemType(typeof item.type === 'object' ? item.type.id : '');
    setEditItemLocation(item.location);
    setEditItemQuantity(item.stockInitial);
    setEditItemUnit(item.unit);
    setEditItemHasColors(item.hasColors);
    setEditColorStocks(item.colorStocks?.map(cs => ({
      id: cs.id,
      color: cs.color,
      stockInitial: cs.stockInitial
    })) || []);
  };

  // Handle form submissions
  const handleNewItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (newItemHasColors && colorStocks.length === 0) {
        setError("Veuillez ajouter au moins une couleur");
        setLoading(false);
        return;
      }

      if (newItemHasColors && colorStocks.some(stock => !stock.color.trim())) {
        setError("Veuillez remplir tous les noms de couleurs");
        setLoading(false);
        return;
      }

      // Create new stock item
      const newItem = await stockItemService.create({
        reference: newItemReference || null,
        name: newItemName,
        type: `/api/item_types/${newItemType}`,
        location: newItemLocation,
        unit: newItemUnit,
        stockInitial: newItemHasColors ? 0 : newItemQuantity,
        dateDernierInventaire: new Date().toISOString(),
        hasColors: newItemHasColors
      });

      // Si l'article a des couleurs, créer les stocks de couleurs
      if (newItemHasColors) {
        for (const colorStock of colorStocks) {
          await stockItemService.createColorStock(newItem.id, {
            color: colorStock.color,
            stockInitial: colorStock.stockInitial
          });
        }
      }

      await refreshStockData();
      setIsNewItemModalOpen(false);
      resetNewItemForm();
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Erreur lors de la création de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForEdit) return;

    setLoading(true);
    setError(null);

    try {
      if (editItemHasColors && editColorStocks.length === 0) {
        setError("Veuillez ajouter au moins une couleur");
        setLoading(false);
        return;
      }

      if (editItemHasColors && editColorStocks.some(stock => !stock.color.trim())) {
        setError("Veuillez remplir tous les noms de couleurs");
        setLoading(false);
        return;
      }

      // Update the stock item
      await stockItemService.update(selectedItemForEdit.id, {
        reference: editItemReference || null,
        name: editItemName,
        type: `/api/item_types/${editItemType}`,
        location: editItemLocation,
        unit: editItemUnit,
        stockInitial: editItemHasColors ? 0 : editItemQuantity,
        dateDernierInventaire: new Date().toISOString(),
        hasColors: editItemHasColors,
        colorStocks: undefined
      });

      // Update color stocks
      if (editItemHasColors) {
        // Delete removed color stocks
        const existingColorStocks = selectedItemForEdit.colorStocks || [];
        for (const existingStock of existingColorStocks) {
          if (!editColorStocks.find(s => s.id === existingStock.id)) {
            await stockItemService.deleteColorStock(selectedItemForEdit.id, existingStock.id);
          }
        }

        // Create or update color stocks
        for (const colorStock of editColorStocks) {
          if (colorStock.id) {
            // Update existing color stock
            await colorStockService.update(colorStock.id, {
              color: colorStock.color,
              stockInitial: colorStock.stockInitial,
              stockItem: `/api/stock_items/${selectedItemForEdit.id}`
            });
          } else {
            // Create new color stock
            await stockItemService.createColorStock(selectedItemForEdit.id, {
              color: colorStock.color,
              stockInitial: colorStock.stockInitial
            });
          }
        }
      }

      await refreshStockData();
      setIsEditModalOpen(false);
      resetEditForm();
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Erreur lors de la modification de l\'article');
    } finally {
      setLoading(false);
    }
  };

  // Handle new type creation
  const handleNewTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newType = await itemTypeService.create({
        name: newTypeName,
        description: newTypeDescription || undefined
      });
      
      // Refresh item types list
      const types = await itemTypeService.getAll();
      setItemTypes(types);
      
      // Select the newly created type
      if (newType.id) {
        setNewItemType(newType.id);
      }
      
      // Reset type form
      setIsNewTypeFormVisible(false);
      setNewTypeName('');
      setNewTypeDescription('');
    } catch (err) {
      console.error('Error creating type:', err);
      setError('Erreur lors de la création du type');
    } finally {
      setLoading(false);
    }
  };

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

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage
    
    // Add title
    doc.setFontSize(20);
    doc.text('Liste du Stock', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Prepare table data for main list
    const tableData = filteredItems.map(item => {
      const currentStock = item.stockRestant ?? item.stockInitial;
      const type = typeof item.type === 'object' ? item.type.name : '';
      
      return [
        item.reference || '-',
        item.name,
        type,
        item.location,
        item.unit,
        currentStock.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (item.nbEntrees || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (item.nbSorties || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      ];
    });

    // Add main table
    autoTable(doc, {
      startY: 35,
      head: [['Référence', 'Article', 'Type', 'Emplacement', 'Unité', 'Stock Restant', 'Entrées', 'Sorties']],
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
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' },
        7: { cellWidth: 25, halign: 'right' }
      },
      margin: { top: 35 },
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

    // Add color details for items with colors
    const itemsWithColors = filteredItems.filter(item => item.hasColors && item.colorStocks && item.colorStocks.length > 0);
    
    itemsWithColors.forEach((item, index) => {
      // Add new page for each item with colors
      doc.addPage();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Détails des couleurs - ${item.name}`, 14, 22);
      
      // Add item info
      doc.setFontSize(12);
      doc.text(`Référence: ${item.reference || '-'}`, 14, 30);
      doc.text(`Type: ${typeof item.type === 'object' ? item.type.name : ''}`, 14, 35);
      doc.text(`Emplacement: ${item.location}`, 14, 40);
      
      // Prepare color table data
      const colorTableData = item.colorStocks.map(colorStock => [
        colorStock.color,
        colorStock.stockInitial.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (colorStock.stockInitial - (colorStock.nbSorties || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (colorStock.nbEntrees || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        (colorStock.nbSorties || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      ]);

      // Add color table
      autoTable(doc, {
        startY: 45,
        head: [['Couleur', 'Stock Initial', 'Stock Restant', 'Entrées', 'Sorties']],
        body: colorTableData,
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
          0: { cellWidth: 50 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        },
        margin: { top: 45 },
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
    });

    // Save the PDF
    doc.save(`inventaire-stock-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Liste complète du Stock
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Gérez et visualisez tous vos articles ({filteredItems.length} articles)
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-800 rounded-xl p-4 flex items-center">
          <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mr-3"></div>
          {error}
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Location Filter */}
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
              {locationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Type Filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="typeFilter"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-sm text-gray-600">
            {filteredItems.length} article{filteredItems.length !== 1 ? 's' : ''} trouvé{filteredItems.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('all');
                setTypeFilter('all');
                setCurrentPage(1);
              }}
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
            >
              Réinitialiser
            </button>
            
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter PDF
            </button>
            
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </button>
            
            <button
              onClick={() => setIsNewItemModalOpen(true)}
              className="inline-flex items-center px-4 py-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </button>
            
            <Link 
              to="/stock/entree" 
              className="inline-flex items-center px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors duration-200"
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              Entrée
            </Link>
            
            <Link 
              to="/stock/sortie" 
              className="inline-flex items-center px-4 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors duration-200"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Sortie
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stock Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile view */}
        <div className="md:hidden">
          {paginatedItems.map((item) => (
            <div key={item.id} className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  {item.reference && (
                    <p className="text-sm text-gray-500">Réf: {item.reference}</p>
                  )}
                  <p className="text-sm text-gray-600">{typeof item.type === 'object' ? item.type.name : ''}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (item.stockRestant ?? 0) <= 10
                    ? 'bg-red-100 text-red-800'
                    : (item.stockRestant ?? 0) <= 30
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {(item.stockRestant ?? 0) <= 10
                    ? 'Critique'
                    : (item.stockRestant ?? 0) <= 30
                    ? 'Bas'
                    : 'Normal'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Emplacement:</span>
                  <span className="ml-1 text-gray-900">{getLocationName(item.location)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quantité:</span>
                  {item.hasColors ? (
                    <button
                      onClick={() => setSelectedItemForColors(item)}
                      className="ml-1 text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      Voir les couleurs
                    </button>
                  ) : (
                    <span className="ml-1 text-gray-900">{item.stockRestant ?? 0} {item.unit}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="name" label="Produit" />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
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
                    {item.hasColors && (
                        <button
                            onClick={() => setSelectedItemForColors(item)}
                            className="ml-2 inline-flex items-center justify-center p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-200"
                            title="Voir les détails des couleurs"
                        >
                            <Palette className="h-4 w-4" />
                        </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.reference || '-'}
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
                    {item.stockRestant ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (item.stockRestant ?? 0) <= 10
                        ? 'bg-red-100 text-red-800'
                        : (item.stockRestant ?? 0) <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(item.stockRestant ?? 0) <= 10
                        ? 'Critique'
                        : (item.stockRestant ?? 0) <= 30
                        ? 'Bas'
                        : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
              
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
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

      {/* New Item Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Ajouter un nouvel article
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsNewItemModalOpen(false);
                    resetNewItemForm();
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleNewItemSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'article
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      required
                      placeholder="Nom de l'article"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence (optionnel)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={newItemReference}
                      onChange={(e) => setNewItemReference(e.target.value)}
                      placeholder="Référence de l'article"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    {!isNewTypeFormVisible ? (
                      <div className="space-y-2">
                        <select
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          value={newItemType}
                          onChange={(e) => setNewItemType(e.target.value)}
                          required={!isNewTypeFormVisible}
                        >
                          <option value="">Sélectionnez un type</option>
                          {itemTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsNewTypeFormVisible(true)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Créer un nouveau type
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Tags className="h-4 w-4" />
                            Nouveau type
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsNewTypeFormVisible(false);
                              setNewTypeName('');
                              setNewTypeDescription('');
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nom du type
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              value={newTypeName}
                              onChange={(e) => setNewTypeName(e.target.value)}
                              placeholder="Nom du type"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description (optionnelle)
                            </label>
                            <textarea
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                              value={newTypeDescription}
                              onChange={(e) => setNewTypeDescription(e.target.value)}
                              placeholder="Description du type"
                              rows={2}
                            />
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleNewTypeSubmit}
                            disabled={loading || !newTypeName.trim()}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                                Création...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Créer le type
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emplacement
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={newItemLocation}
                      onChange={(e) => setNewItemLocation(e.target.value as "Cotona" | "Maison" | "Avishay" | "Avenir")}
                      required
                    >
                      {locationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="newItemQuantity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Quantité initiale
                    </label>
                    <input
                      type="number"
                      id="newItemQuantity"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                      value={newItemQuantity || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        setNewItemQuantity(isNaN(value) ? 0 : value);
                      }}
                      onBlur={() => {
                        if (newItemQuantity <= 0) {
                          setNewItemQuantity(0);
                        }
                      }}
                      required={!newItemHasColors}
                      disabled={newItemHasColors}
                      placeholder="Entrez la quantité initiale"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unité
                    </label>
                    <select
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value as "piece" | "carton" | "bal")}
                      required
                    >
                      <option value="piece">Pièce</option>
                      <option value="carton">Carton</option>
                      <option value="bal">Bal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gestion des couleurs
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="newHasColorsNo"
                          name="newHasColors"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={!newItemHasColors}
                          onChange={() => {
                            setNewItemHasColors(false);
                            setColorStocks([]);
                          }}
                        />
                        <label htmlFor="newHasColorsNo" className="ml-2 block text-sm text-gray-600">
                          Article sans gestion des couleurs
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="newHasColorsYes"
                          name="newHasColors"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={newItemHasColors}
                          onChange={() => setNewItemHasColors(true)}
                        />
                        <label htmlFor="newHasColorsYes" className="ml-2 block text-sm text-gray-600">
                          Article avec gestion des couleurs
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {newItemHasColors && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium text-gray-700">Couleurs et stocks</h4>
                      <button
                        type="button"
                        onClick={() => setColorStocks([...colorStocks, { color: '', stockInitial: 0 }])}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter une couleur
                      </button>
                    </div>

                    {colorStocks.map((stock, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium text-gray-700">Couleur {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => {
                              const newStocks = [...colorStocks];
                              newStocks.splice(index, 1);
                              setColorStocks(newStocks);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Nom de la couleur
                            </label>
                            <input
                              type="text"
                              value={stock.color}
                              onChange={(e) => {
                                const newStocks = [...colorStocks];
                                newStocks[index].color = e.target.value;
                                setColorStocks(newStocks);
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Ex: Rouge, Bleu, etc."
                              required={newItemHasColors}
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Stock initial
                            </label>
                            <input
                              type="number"
                              value={stock.stockInitial || ''}
                              onChange={(e) => {
                                const newStocks = [...colorStocks];
                                newStocks[index].stockInitial = parseInt(e.target.value) || 0;
                                setColorStocks(newStocks);
                              }}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Quantité"
                              min="0"
                              required={newItemHasColors}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {colorStocks.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Aucune couleur ajoutée. Cliquez sur "Ajouter une couleur" pour commencer.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewItemModalOpen(false);
                      resetNewItemForm();
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer l'article
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Modifier un article
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetEditForm();
                  }}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!selectedItemForEdit ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rechercher un article
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editSearchTerm}
                        onChange={(e) => setEditSearchTerm(e.target.value)}
                        placeholder="Rechercher un article à modifier..."
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
                    {stockItems
                      .filter(item => 
                        item.name.toLowerCase().includes(editSearchTerm.toLowerCase())
                      )
                      .map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-gray-400" />
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">
                                {item.reference ? `Réf: ${item.reference} • ` : ''}{typeof item.type === 'object' ? item.type.name : ''} • {item.location}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.stockRestant || item.stockInitial} {item.unit}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'article
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemName}
                        onChange={(e) => setEditItemName(e.target.value)}
                        required
                        placeholder="Nom de l'article"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Référence (optionnel)
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemReference}
                        onChange={(e) => setEditItemReference(e.target.value)}
                        placeholder="Référence de l'article"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemType}
                        onChange={(e) => setEditItemType(e.target.value)}
                        required
                      >
                        <option value="">Sélectionnez un type</option>
                        {itemTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emplacement
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemLocation}
                        onChange={(e) => setEditItemLocation(e.target.value as "Cotona" | "Maison" | "Avishay" | "Avenir")}
                        required
                      >
                        {locationOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="newItemQuantity"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Quantité initiale
                      </label>
                      <input
                        type="number"
                        id="newItemQuantity"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemQuantity || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setEditItemQuantity(isNaN(value) ? 0 : value);
                        }}
                        required={!editItemHasColors}
                        disabled={editItemHasColors}
                        placeholder="Entrez la quantité"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unité
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200"
                        value={editItemUnit}
                        onChange={(e) => setEditItemUnit(e.target.value as "piece" | "carton" | "bal")}
                        required
                      >
                        <option value="piece">Pièce</option>
                        <option value="carton">Carton</option>
                        <option value="bal">Bal</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gestion des couleurs
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="editHasColorsNo"
                          name="editHasColors"
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                          checked={!editItemHasColors}
                          onChange={() => {
                            setEditItemHasColors(false);
                            setEditColorStocks([]);
                          }}
                        />
                        <label htmlFor="editHasColorsNo" className="ml-2 block text-sm text-gray-600">
                          Article sans gestion des couleurs
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="editHasColorsYes"
                          name="editHasColors"
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                          checked={editItemHasColors}
                          onChange={() => setEditItemHasColors(true)}
                        />
                        <label htmlFor="editHasColorsYes" className="ml-2 block text-sm text-gray-600">
                          Article avec gestion des couleurs
                        </label>
                      </div>
                    </div>
                  </div>

                  {editItemHasColors && (
                    <div className="mb-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Couleurs et stocks</h4>
                        <button
                          type="button"
                          onClick={() => setEditColorStocks([...editColorStocks, { color: '', stockInitial: 0 }])}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors duration-200"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter une couleur
                        </button>
                      </div>

                      {editColorStocks.map((stock, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-700">Couleur {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => {
                                const newStocks = [...editColorStocks];
                                newStocks.splice(index, 1);
                                setEditColorStocks(newStocks);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Nom de la couleur
                              </label>
                              <input
                                type="text"
                                value={stock.color}
                                onChange={(e) => {
                                  const newStocks = [...editColorStocks];
                                  newStocks[index].color = e.target.value;
                                  setEditColorStocks(newStocks);
                                }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Ex: Rouge, Bleu, etc."
                                required={editItemHasColors}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1">
                                Stock initial
                              </label>
                              <input
                                type="number"
                                value={stock.stockInitial || ''}
                                onChange={(e) => {
                                  const newStocks = [...editColorStocks];
                                  newStocks[index].stockInitial = parseInt(e.target.value) || 0;
                                  setEditColorStocks(newStocks);
                                }}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="Quantité"
                                min="0"
                                required={editItemHasColors}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {editColorStocks.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Aucune couleur ajoutée. Cliquez sur "Ajouter une couleur" pour commencer.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForEdit(null)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        resetEditForm();
                      }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white mr-2"></div>
                          Modification en cours...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Color Stock Modal */}
      {selectedItemForColors && (
        <ColorStockModal
          item={selectedItemForColors}
          onClose={() => setSelectedItemForColors(null)}
        />
      )}
    </div>
  );
}
 