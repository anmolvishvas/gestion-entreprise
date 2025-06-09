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
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                  Gestion Entreprise
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Desktop menu */}
            <div className="hidden lg:flex lg:items-center lg:space-x-8">
              <div className="flex items-center space-x-8">
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
                <div className="relative group">
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

              <button
                onClick={handleLogout}
                className="ml-8 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu}></div>
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl font-bold text-gray-800">Menu</div>
                <button
                  onClick={toggleMobileMenu}
                  className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-1">
                <Link
                  to="/fournisseurs"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/fournisseurs')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Users className="h-5 w-5 inline mr-2" />
                  Fournisseurs
                </Link>

                <Link
                  to="/stock"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/stock')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Package className="h-5 w-5 inline mr-2" />
                  Stock
                </Link>

                <div className="pl-5 space-y-1">
                  <Link
                    to="/stock/entree"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/stock/entree')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <ArrowDown className="h-4 w-4 inline mr-2" />
                    Entrée Stock
                  </Link>
                  <Link
                    to="/stock/sortie"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/stock/sortie')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <ArrowUp className="h-4 w-4 inline mr-2" />
                    Sortie Stock
                  </Link>
                  <Link
                    to="/stock/liste"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/stock/liste')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <List className="h-4 w-4 inline mr-2" />
                    Liste Stock
                  </Link>
                  <Link
                    to="/stock/movements"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/stock/movements')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Mouvements
                  </Link>
                  <Link
                    to="/stock/types"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/stock/types')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Types d'Articles
                  </Link>
                </div>

                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <LayoutDashboard className="h-5 w-5 inline mr-2" />
                  Dashboard
                </Link>

                <Link
                  to="/inventaire"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/inventaire')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Package className="h-5 w-5 inline mr-2" />
                  Inventaire
                </Link>

                <Link
                  to="/comptabilite"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/comptabilite')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <DollarSign className="h-5 w-5 inline mr-2" />
                  Comptabilité
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="w-full mt-4 px-4 py-2 text-center text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-16">
        <Outlet />
      </main>
    </div>
  );
}
 