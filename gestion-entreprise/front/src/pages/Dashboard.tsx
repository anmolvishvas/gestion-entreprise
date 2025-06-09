import  { Link } from 'react-router-dom';
import { ShoppingBag, Package, DollarSign, Users, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Dashboard() {
  const { fournisseurs, transactions, stockItems } = useAppContext();
  
  const totalAchat = transactions.reduce((sum, transaction) => sum + transaction.achat, 0);
  const totalReste = transactions.reduce((sum, transaction) => sum + transaction.reste, 0);
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
        <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="mt-1 text-gray-600">Bienvenue dans votre application de gestion</p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fournisseurs</p>
              <p className="text-lg font-semibold">{fournisseurs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Achats</p>
              <p className="text-lg font-semibold">{totalAchat.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Articles</p>
              <p className="text-lg font-semibold">{stockItems.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">À payer</p>
              <p className="text-lg font-semibold">{totalReste.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stock Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventaire des Magasins</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Avishay</h3>
              <p className="text-2xl font-bold text-blue-900">{avishayItems.length}</p>
              <p className="text-xs text-blue-700 mt-1">articles en stock</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Avenir</h3>
              <p className="text-2xl font-bold text-indigo-900">{avenirItems.length}</p>
              <p className="text-xs text-indigo-700 mt-1">articles en stock</p>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-700 mb-2">Articles récents</h3>
          <div className="space-y-2">
            {stockItems.slice(0, 3).map(item => {
              const currentStock = item.stockRestant ?? item.stockInitial;
              return (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentStock <= 10
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {currentStock} {item.unit}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <Link to="/stock" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
              Voir tous les articles
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">État des Dépôts</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-700">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Cotona</p>
                <p className="text-lg font-semibold text-gray-900">{cotonaItems.length} articles</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-700">
                <Package className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Maison</p>
                <p className="text-lg font-semibold text-gray-900">{maisonItems.length} articles</p>
              </div>
            </div>
          </div>
          
          {lowStockCount > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-red-800">
                {lowStockCount} article{lowStockCount > 1 ? 's' : ''} en stock faible
              </p>
              <Link to="/stock/liste" className="text-xs text-red-700 hover:text-red-900 flex items-center mt-1">
                Voir les détails
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <p className="text-sm font-medium text-green-800">
                Tous les articles ont un niveau de stock suffisant
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/stock/entry" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center text-sm">
              Entrée de stock
            </Link>
            <Link to="/stock/exit" className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 text-center text-sm">
              Sortie de stock
            </Link>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Transactions Récentes</h2>
          <Link to="/comptabilite" className="text-sm text-blue-600 hover:text-blue-800">
            Voir tout
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Achat (Ar)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reste (Ar)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {fournisseurs.find(f => String(f.id) === String(transaction.fournisseur))?.nom || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
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
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune transaction récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
 