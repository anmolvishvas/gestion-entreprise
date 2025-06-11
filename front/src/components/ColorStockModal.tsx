import { useState, useMemo } from 'react';
import { X, Search, ArrowLeft, ArrowRight } from 'lucide-react';
import type { StockItem } from '../services/stockItemService';

interface ColorStockModalProps {
    item: StockItem;
    onClose: () => void;
}

export default function ColorStockModal({ item, onClose }: ColorStockModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter and paginate color stocks
    const filteredColorStocks = useMemo(() => {
        return item.colorStocks?.filter(colorStock =>
            colorStock.color.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
    }, [item.colorStocks, searchTerm]);

    const totalPages = Math.ceil((filteredColorStocks?.length || 0) / itemsPerPage);
    const paginatedColorStocks = filteredColorStocks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate totals for the filtered items
    const totals = useMemo(() => {
        return {
            stockInitial: filteredColorStocks.reduce((sum, cs) => sum + cs.stockInitial, 0),
            nbEntrees: filteredColorStocks.reduce((sum, cs) => sum + cs.nbEntrees, 0),
            nbSorties: filteredColorStocks.reduce((sum, cs) => sum + cs.nbSorties, 0),
            stockRestant: filteredColorStocks.reduce((sum, cs) => sum + cs.stockRestant, 0)
        };
    }, [filteredColorStocks]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {item.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Stock détaillé par couleur
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Total Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Stock Initial</p>
                            <p className="text-lg font-semibold">{totals.stockInitial}</p>
                        </div>
                        <div className="bg-emerald-50 p-3 rounded-lg">
                            <p className="text-xs text-emerald-600 mb-1">Entrées</p>
                            <p className="text-lg font-semibold text-emerald-700">+{totals.nbEntrees}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-xs text-red-600 mb-1">Sorties</p>
                            <p className="text-lg font-semibold text-red-700">-{totals.nbSorties}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Stock Actuel</p>
                            <p className="text-lg font-semibold text-blue-700">{totals.stockRestant} {item.unit}</p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Rechercher une couleur..."
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

                    {/* Mobile view */}
                    <div className="block sm:hidden">
                        <div className="space-y-3">
                            {paginatedColorStocks.map((colorStock) => (
                                <div key={colorStock.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900">{colorStock.color}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            colorStock.stockRestant <= 10
                                                ? 'bg-red-100 text-red-800'
                                                : colorStock.stockRestant <= 30
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {colorStock.stockRestant} {item.unit}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Initial</p>
                                            <p className="font-medium">{colorStock.stockInitial}</p>
                                        </div>
                                        <div>
                                            <p className="text-emerald-600">Entrées</p>
                                            <p className="font-medium text-emerald-700">+{colorStock.nbEntrees}</p>
                                        </div>
                                        <div>
                                            <p className="text-red-600">Sorties</p>
                                            <p className="font-medium text-red-700">-{colorStock.nbSorties}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {paginatedColorStocks.length === 0 && (
                                <div className="text-center py-4 text-sm text-gray-500">
                                    Aucune couleur trouvée
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Desktop view */}
                    <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Couleur
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Initial
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Entrées
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sorties
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Actuel
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedColorStocks.map((colorStock) => (
                                    <tr key={colorStock.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {colorStock.color}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                            {colorStock.stockInitial}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-emerald-600">
                                            +{colorStock.nbEntrees}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600">
                                            -{colorStock.nbSorties}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                colorStock.stockRestant <= 10
                                                    ? 'bg-red-100 text-red-800'
                                                    : colorStock.stockRestant <= 30
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {colorStock.stockRestant} {item.unit}
                                            </span>
                                        </td>
                                    </tr>
                                ))}

                                {paginatedColorStocks.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucune couleur trouvée
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} sur {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    <span className="hidden sm:inline">Précédent</span>
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="hidden sm:inline">Suivant</span>
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 