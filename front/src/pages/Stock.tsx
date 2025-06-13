import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Package, ArrowRight, ArrowUp, ArrowDown, List, Clock, 
  AlertTriangle, TrendingUp, Boxes, Building2
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Stock() {
  const { stockItems, stockMovements } = useAppContext();
  
  // Get most recent movements (limit to 5)
  const recentMovements = [...stockMovements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const cotonaItems = stockItems.filter(item => item.location === 'Cotona');
  const maisonItems = stockItems.filter(item => item.location === 'Maison');
  const avishayItems = stockItems.filter(item => item.location === 'Avishay');
  const avenirItems = stockItems.filter(item => item.location === 'Avenir');
  
  // Count items with low stock (less than or equal to 10)
  const lowStockCount = stockItems.filter(item => {
    const currentStock = item.stockRestant ?? 0;
    return currentStock <= 10;
  }).length;

  // Calculate total stock value and items
  const totalItems = stockItems.length;
  const totalStockValue = stockItems.reduce((acc, item) => {
    const currentStock = item.stockRestant ?? 0;
    return acc + currentStock;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Gestion du Stock
          </span>
          <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
            {totalItems} articles
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Gérez efficacement votre inventaire et suivez les mouvements de stock
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <p className="text-2xl font-bold">{totalStockValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 opacity-75" />
            <div className="ml-4">
              <p className="text-amber-100 text-sm">Emplacements</p>
              <p className="text-2xl font-bold">4</p>
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
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          to="/stock/liste" 
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
        >
          <div className="p-5 flex items-center">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-4 group-hover:bg-blue-100 transition-colors duration-200">
              <List className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Liste complète</p>
              <p className="text-lg font-semibold text-gray-900">{stockItems.length} articles</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </Link>
        
        <Link 
          to="/stock/entree" 
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
        >
          <div className="p-5 flex items-center">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 mr-4 group-hover:bg-emerald-100 transition-colors duration-200">
              <ArrowDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Entrée</p>
              <p className="text-lg font-semibold text-gray-900">Ajouter stock</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </Link>
        
        <Link 
          to="/stock/sortie" 
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
        >
          <div className="p-5 flex items-center">
            <div className="p-3 rounded-xl bg-red-50 text-red-600 mr-4 group-hover:bg-red-100 transition-colors duration-200">
              <ArrowUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sortie</p>
              <p className="text-lg font-semibold text-gray-900">Retirer stock</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-red-500 transform group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </Link>
        
        <Link 
          to="/stock/movements" 
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
        >
          <div className="p-5 flex items-center">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 mr-4 group-hover:bg-purple-100 transition-colors duration-200">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Mouvements</p>
              <p className="text-lg font-semibold text-gray-900">Historique</p>
            </div>
            <ArrowRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all duration-200" />
          </div>
        </Link>
      </div>
      
      {/* Stock Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Cotona</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                {cotonaItems.length} articles
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {cotonaItems.slice(0, 3).map(item => {
                const currentStock = item.stockRestant ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="truncate">{item.reference}</span>
                      </div>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      currentStock <= 10
                        ? 'bg-red-100 text-red-800'
                        : currentStock <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            {cotonaItems.length > 3 && (
              <Link 
                to="/stock/liste" 
                className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir tous les articles
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Maison</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full">
                {maisonItems.length} articles
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {maisonItems.slice(0, 3).map(item => {
                const currentStock = item.stockRestant ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="truncate">{item.reference}</span>
                      </div>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      currentStock <= 10
                        ? 'bg-red-100 text-red-800'
                        : currentStock <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            {maisonItems.length > 3 && (
              <Link 
                to="/stock/liste" 
                className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Voir tous les articles
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Avishay</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded-full">
                {avishayItems.length} articles
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {avishayItems.slice(0, 3).map(item => {
                const currentStock = item.stockRestant ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="truncate">{item.reference}</span>
                      </div>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      currentStock <= 10
                        ? 'bg-red-100 text-red-800'
                        : currentStock <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            {avishayItems.length > 3 && (
              <Link 
                to="/stock/liste" 
                className="mt-4 inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Voir tous les articles
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-orange-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Avenir</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 rounded-full">
                {avenirItems.length} articles
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {avenirItems.slice(0, 3).map(item => {
                const currentStock = item.stockRestant ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span className="truncate">{item.reference}</span>
                      </div>
                    </div>
                    <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      currentStock <= 10
                        ? 'bg-red-100 text-red-800'
                        : currentStock <= 30
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            {avenirItems.length > 3 && (
              <Link 
                to="/stock/liste" 
                className="mt-4 inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Voir tous les articles
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Mouvements récents</h3>
              <Link 
                to="/stock/movements" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                Voir tout
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-4">
            {recentMovements.length > 0 ? (
              <div className="space-y-4">
                {recentMovements.map(movement => {
                  const itemId = typeof movement.stockItem === 'string'
                    ? movement.stockItem.split('/').pop()
                    : movement.stockItem.id;
                  const item = stockItems.find(item => item.id === itemId);
                  return (
                    <div key={movement.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className={`p-2 rounded-lg mr-3 ${
                        movement.type === 'entree' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movement.type === 'entree' ? (
                          <ArrowDown className={`h-4 w-4 text-green-600`} />
                        ) : (
                          <ArrowUp className={`h-4 w-4 text-red-600`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item?.name || 'Article inconnu'}</p>
                        <div className="flex items-center mt-1">
                          <p className="text-sm text-gray-600">
                            {movement.type === 'entree' ? 'Entrée' : 'Sortie'} de {movement.quantity} {item?.unit || 'unités'}
                          </p>
                          <span className="mx-2 text-gray-300">•</span>
                          <p className="text-sm text-gray-500">{new Date(movement.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`ml-4 text-sm font-medium ${
                        movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Aucun mouvement récent</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Alertes de stock</h3>
          </div>
          <div className="p-4">
            {lowStockCount > 0 ? (
              <>
                <div className="p-4 mb-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <p className="font-medium text-red-800">
                      {lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock critique
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {stockItems
                    .filter(item => {
                      const currentStock = item.stockRestant ?? 0;
                      return currentStock <= 10;
                    })
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.location}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          (item.stockRestant ?? 0) <= 10
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stockRestant ?? 0} {item.unit}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </>
            ) : (
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <p className="font-medium text-green-800">
                    Tous les articles ont un niveau de stock suffisant
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 