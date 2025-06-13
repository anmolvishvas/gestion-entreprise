import { Link, Outlet, useLocation } from 'react-router-dom';
import { Users, Package, DollarSign, ArrowDown, ArrowUp, List, Settings, LayoutDashboard, Clock, Menu, X, LogOut, Tag } from 'lucide-react';
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
            <div className="hidden lg:flex lg:items-center lg:flex-1">
              <nav className="flex-1">
                <ul className="flex items-center space-x-2">
                <li>
                    <Link
                      to="/dashboard"
                      className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive('/dashboard') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <LayoutDashboard className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                        isActive('/dashboard') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/fournisseurs"
                      className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive('/fournisseurs') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Users className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                        isActive('/fournisseurs') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      Fournisseurs
                    </Link>
                  </li>

                  <li className="relative">
                    <div className="group">
                      <Link
                        to="/stock"
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          isActive('/stock') 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Package className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                          isActive('/stock') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`} />
                        Stock
                        <svg className="ml-2 h-5 w-5 text-gray-400 group-hover:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                      <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform">
                        <div className="py-1 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                          <Link
                            to="/stock/entree"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <ArrowDown className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            Entrée Stock
                          </Link>
                          <Link
                            to="/stock/sortie"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <ArrowUp className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            Sortie Stock
                          </Link>
                          <Link
                            to="/stock/liste"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <List className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            Liste Stock
                          </Link>
                          <Link
                            to="/stock/movements"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Clock className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            Mouvements
                          </Link>
                          <Link
                            to="/stock/types"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                            Types d'Articles
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <Link
                      to="/inventaire"
                      className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive('/inventaire') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Package className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                        isActive('/inventaire') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      Inventaire
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/comptabilite"
                      className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive('/comptabilite') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <DollarSign className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                        isActive('/comptabilite') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      Comptabilité
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/prix"
                      className={`group inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                        isActive('/prix') 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Tag className={`h-5 w-5 mr-2 transition-colors duration-150 ${
                        isActive('/prix') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      Prix
                    </Link>
                  </li>
                </ul>
              </nav>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
              >
                <LogOut className="h-5 w-5 mr-2" />
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

                <Link
                  to="/prix"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/prix')
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  <Tag className="h-5 w-5 inline mr-2" />
                  Prix
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
 