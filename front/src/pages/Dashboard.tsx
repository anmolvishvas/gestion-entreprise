import  { Link } from 'react-router-dom';
import { ShoppingBag, Package, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { fournisseurs, transactions, stockItems } = useAppContext();
  
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tableau de Bord</h1>
        <p className="mt-3 text-lg text-gray-600">Gérez votre entreprise efficacement</p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Fournisseurs</p>
                <p className="text-3xl font-bold text-gray-900">{fournisseurs.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-indigo-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">Actifs</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Articles</p>
                <p className="text-3xl font-bold text-gray-900">{stockItems.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
                <ShoppingBag className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-medium">En stock</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
        </div>
      </div>
      
      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Inventaire des Magasins</span>
            </h2>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 p-5 rounded-2xl border border-blue-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">Avishay</h3>
                  <p className="text-3xl font-bold text-blue-900">{avishayItems.length}</p>
                  <p className="text-xs text-blue-700 mt-1">articles en stock</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-16 w-16 text-blue-900" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-50 p-5 rounded-2xl border border-indigo-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-indigo-800 mb-2">Avenir</h3>
                  <p className="text-3xl font-bold text-indigo-900">{avenirItems.length}</p>
                  <p className="text-xs text-indigo-700 mt-1">articles en stock</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-16 w-16 text-indigo-900" />
                </div>
              </div>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">Articles récents</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{stockItems.length} total</span>
            </h3>
            <div className="space-y-3">
              {stockItems.slice(0, 3).map(item => {
                const currentStock = item.stockRestant ?? 0;
                return (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      currentStock <= 10
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {currentStock} {item.unit}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6">
              <Link 
                to="/stock" 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
              >
                Voir tous les articles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">État des Dépôts</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 p-5 rounded-2xl border border-purple-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-purple-800 mb-2">Cotona</h3>
                  <p className="text-3xl font-bold text-purple-900">{cotonaItems.length}</p>
                  <p className="text-xs text-purple-700 mt-1">articles</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-16 w-16 text-purple-900" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 via-pink-100 to-pink-50 p-5 rounded-2xl border border-pink-200 relative overflow-hidden group hover:shadow-md transition-all duration-300">
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-pink-800 mb-2">Maison</h3>
                  <p className="text-3xl font-bold text-pink-900">{maisonItems.length}</p>
                  <p className="text-xs text-pink-700 mt-1">articles</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-16 w-16 text-pink-900" />
                </div>
              </div>
            </div>
            
            {lowStockCount > 0 ? (
              <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 border border-red-200 rounded-xl p-5 mb-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    {lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock faible
                  </p>
                  <Link to="/stock/liste" className="text-xs text-red-700 hover:text-red-900 flex items-center mt-2 font-medium">
                    Voir les détails
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-12 w-12 text-red-900" />
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 border border-green-200 rounded-xl p-5 mb-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-sm font-semibold text-green-800">
                    Tous les articles ont un niveau de stock suffisant
                  </p>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Package className="h-12 w-12 text-green-900" />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-6">
              <Link 
                to="/stock/entree" 
                className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl text-center text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="relative z-10">Entrée de stock</span>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></div>
              </Link>
              <Link 
                to="/stock/sortie" 
                className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 text-white py-3 px-4 rounded-xl text-center text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                <span className="relative z-10">Sortie de stock</span>
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-rose-700 transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 text-transparent bg-clip-text">Transactions Récentes</span>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{transactions.length} total</span>
            </h2>
            <Link 
              to="/comptabilite" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Voir tout
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-l-xl">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                    Achat (Ar)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-r-xl">
                    Reste (Ar)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {fournisseurs.find(f => String(f.id) === String(transaction.fournisseur))?.nom || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {transaction.achat.toLocaleString('fr-FR')}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.reste > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.reste.toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
                
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl">
                      <div className="flex flex-col items-center">
                        <Package className="h-8 w-8 text-gray-400 mb-2" />
                        <p>Aucune transaction récente</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
 