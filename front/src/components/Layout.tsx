import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Package, DollarSign, ArrowDown, ArrowUp, List, Settings, LayoutDashboard, Clock, Menu, X } from 'lucide-react';
import { authService } from '../services/authService';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    authService.logout();
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                  Gestion Entreprise
                </Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/fournisseurs"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive('/fournisseurs') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="h-5 w-5 mr-1" />
                  Fournisseurs
                </Link>

                {/* Menu déroulant Stock */}
                <div className="relative group" style={{ top: '18px' }}>
                  <Link
                    to="/stock"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                      isActive('/stock') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Package className="h-5 w-5 mr-1" />
                    Stock
                  </Link>
                  <div className="absolute hidden group-hover:block w-48 bg-white border rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/stock/entree"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowDown className="h-4 w-4 inline mr-2" />
                      Entrée Stock
                    </Link>
                    <Link
                      to="/stock/sortie"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowUp className="h-4 w-4 inline mr-2" />
                      Sortie Stock
                    </Link>
                    <Link
                      to="/stock/liste"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <List className="h-4 w-4 inline mr-2" />
                      Liste Stock
                    </Link>
                    <Link
                      to="/stock/movements"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Clock className="h-4 w-4 inline mr-2" />
                      Mouvements
                    </Link>
                    <Link
                      to="/stock/types"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 inline mr-2" />
                      Types d'Articles
                    </Link>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive('/dashboard') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 mr-1" />
                  Dashboard
                </Link>

                <Link
                  to="/inventaire"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive('/inventaire') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Package className="h-5 w-5 mr-1" />
                  Inventaire
                </Link>

                <Link
                  to="/comptabilite"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    isActive('/comptabilite') ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <DollarSign className="h-5 w-5 mr-1" />
                  Comptabilité
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>

            <div className="hidden md:flex md:items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/fournisseurs"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/fournisseurs')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Users className="h-5 w-5 inline mr-2" />
                Fournisseurs
              </Link>

              <Link
                to="/stock"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/stock')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Stock
              </Link>

              <div className="pl-6 space-y-1">
                <Link
                  to="/stock/entree"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/stock/entree')
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ArrowDown className="h-4 w-4 inline mr-2" />
                  Entrée Stock
                </Link>
                <Link
                  to="/stock/sortie"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/stock/sortie')
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ArrowUp className="h-4 w-4 inline mr-2" />
                  Sortie Stock
                </Link>
                <Link
                  to="/stock/liste"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/stock/liste')
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <List className="h-4 w-4 inline mr-2" />
                  Liste Stock
                </Link>
                <Link
                  to="/stock/movements"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/stock/movements')
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Clock className="h-4 w-4 inline mr-2" />
                  Mouvements
                </Link>
                <Link
                  to="/stock/types"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/stock/types')
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Types d'Articles
                </Link>
              </div>

              <Link
                to="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <LayoutDashboard className="h-5 w-5 inline mr-2" />
                Dashboard
              </Link>

              <Link
                to="/inventaire"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/inventaire')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Package className="h-5 w-5 inline mr-2" />
                Inventaire
              </Link>

              <Link
                to="/comptabilite"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/comptabilite')
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <DollarSign className="h-5 w-5 inline mr-2" />
                Comptabilité
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium text-red-700 border-transparent hover:bg-red-50 hover:border-red-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
 