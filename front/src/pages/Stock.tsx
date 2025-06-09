import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, ArrowRight, ArrowUp, ArrowDown, List, Clock } from 'lucide-react';
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
    const currentStock = item.stockRestant ?? item.stockInitial;
    return currentStock <= 10;
  }).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du Stock</h1>
        <p className="mt-1 text-gray-600">Tableau de bord pour la gestion de votre inventaire</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link 
          to="/stock/liste" 
          className="bg-white p-4 sm:p-5 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
        >
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-3 sm:mr-4">
            <List className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Liste complète</p>
            <p className="text-base sm:text-lg font-semibold">{stockItems.length} articles</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </Link>
        
        <Link 
          to="/stock/entry" 
          className="bg-white p-4 sm:p-5 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
        >
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3 sm:mr-4">
            <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Entrée</p>
            <p className="text-base sm:text-lg font-semibold">Ajouter stock</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </Link>
        
        <Link 
          to="/stock/exit" 
          className="bg-white p-4 sm:p-5 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
        >
          <div className="p-3 rounded-full bg-red-100 text-red-600 mr-3 sm:mr-4">
            <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Sortie</p>
            <p className="text-base sm:text-lg font-semibold">Retirer stock</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </Link>
        
        <Link 
          to="/stock/movements" 
          className="bg-white p-4 sm:p-5 rounded-lg shadow hover:shadow-md transition-shadow flex items-center"
        >
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-3 sm:mr-4">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Mouvements</p>
            <p className="text-base sm:text-lg font-semibold">Historique</p>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        </Link>
      </div>
      
      {/* Stock Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Cotona</h2>
          </div>
          <p className="text-gray-600 mb-4">Articles en stock: <span className="font-semibold">{cotonaItems.length}</span></p>
          <div className="space-y-3">
            {cotonaItems.slice(0, 3).map(item => {
              const currentStock = item.stockRestant ?? item.stockInitial;
              return (
                <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                  <span className="text-sm sm:text-base font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            {cotonaItems.length > 3 && (
              <Link to="/stock/liste" className="block text-sm text-blue-600 hover:underline mt-2">
                Voir tous les {cotonaItems.length} articles →
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Maison</h2>
          </div>
          <p className="text-gray-600 mb-4">Articles en stock: <span className="font-semibold">{maisonItems.length}</span></p>
          <div className="space-y-3">
            {maisonItems.slice(0, 3).map(item => {
              const currentStock = item.stockRestant ?? item.stockInitial;
              return (
                <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                  <span className="text-sm sm:text-base font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            {maisonItems.length > 3 && (
              <Link to="/stock/liste" className="block text-sm text-blue-600 hover:underline mt-2">
                Voir tous les {maisonItems.length} articles →
              </Link>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Avishay</h2>
          </div>
          <p className="text-gray-600 mb-4">Articles en stock: <span className="font-semibold">{avishayItems.length}</span></p>
          <div className="space-y-3">
            {avishayItems.slice(0, 3).map(item => {
              const currentStock = item.stockRestant ?? item.stockInitial;
              return (
                <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                  <span className="text-sm sm:text-base font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            {avishayItems.length > 3 && (
              <Link to="/stock/liste" className="block text-sm text-blue-600 hover:underline mt-2">
                Voir tous les {avishayItems.length} articles →
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Avenir</h2>
          </div>
          <p className="text-gray-600 mb-4">Articles en stock: <span className="font-semibold">{avenirItems.length}</span></p>
          <div className="space-y-3">
            {avenirItems.slice(0, 3).map(item => {
              const currentStock = item.stockRestant ?? item.stockInitial;
              return (
                <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                  <span className="text-sm sm:text-base font-medium">{item.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
            {avenirItems.length > 3 && (
              <Link to="/stock/liste" className="block text-sm text-blue-600 hover:underline mt-2">
                Voir tous les {avenirItems.length} articles →
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mouvements récents</h3>
          {recentMovements.length > 0 ? (
            <div className="space-y-4">
              {recentMovements.map(movement => {
                const itemId = typeof movement.stockItem === 'string'
                  ? movement.stockItem.split('/').pop()
                  : movement.stockItem.id;
                const item = stockItems.find(item => item.id === itemId);
                return (
                  <div key={movement.id} className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      movement.type === 'entree' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movement.type === 'entree' ? (
                        <ArrowDown className={`h-4 w-4 text-green-600`} />
                      ) : (
                        <ArrowUp className={`h-4 w-4 text-red-600`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{item?.name || 'Article inconnu'}</p>
                      <p className="text-sm text-gray-600">
                        {movement.type === 'entree' ? 'Entrée' : 'Sortie'} de {movement.quantity} {item?.unit || 'unités'}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(movement.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      movement.type === 'entree' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movement.type === 'entree' ? '+' : '-'}{movement.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Aucun mouvement récent</p>
          )}
          <Link to="/stock/movements" className="block text-sm text-blue-600 hover:underline mt-4">
            Voir tous les mouvements →
          </Link>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes de stock</h3>
          {lowStockCount > 0 ? (
            <>
              <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
                <p className="font-medium text-red-800">
                  {lowStockCount} article{lowStockCount > 1 ? 's' : ''} avec un niveau de stock critique
                </p>
              </div>
              <div className="space-y-3">
                {stockItems
                  .filter(item => {
                    const currentStock = item.stockRestant ?? item.stockInitial;
                    return currentStock <= 10;
                  })
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm sm:text-base font-medium">{item.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {item.location}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (item.stockRestant ?? item.stockInitial) <= 10
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.stockRestant ?? item.stockInitial} {item.unit}
                      </span>
                    </div>
                  ))
                }
              </div>
            </>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm sm:text-base font-medium text-green-800">
                Tous les articles ont un niveau de stock suffisant
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 