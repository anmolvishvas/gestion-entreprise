import { useState } from 'react';
import { 
  Plus, Edit2, Trash2, X, 
  Package, Tags, AlertCircle, Search 
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { ItemType } from '../services/itemTypeService';

export default function ItemTypes() {
  const { itemTypes, addItemType, updateItemType, deleteItemType, isLoading, error } = useAppContext();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Filter types based on search query
  const filteredTypes = itemTypes.filter(type => 
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addItemType({
        name,
        description
      });
      setName('');
      setDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du type:', err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    try {
      await updateItemType(selectedType.id!, {
        name,
        description
      });
      setShowEditForm(false);
      setSelectedType(null);
    } catch (err) {
      console.error('Erreur lors de la modification du type:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'article ?')) {
      return;
    }

    try {
      await deleteItemType(id);
    } catch (err) {
      console.error('Erreur lors de la suppression du type:', err);
    }
  };

  const startEdit = (type: ItemType) => {
    setSelectedType(type);
    setName(type.name);
    setDescription(type.description || '');
    setShowEditForm(true);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Types d'Articles
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Gérez les différents types d'articles de votre inventaire
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Types Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Types</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{itemTypes.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Tags className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Types with Description Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec Description</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {itemTypes.filter(t => t.description && t.description.trim() !== '').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Types without Description Card */}
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-center justify-between">
    <div>
              <p className="text-sm font-medium text-gray-600">Sans Description</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {itemTypes.filter(t => !t.description || t.description.trim() === '').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          </div>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Rechercher un type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {!showAddForm && !showEditForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un type
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || showEditForm) && (
        <div className="mb-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {showAddForm ? 'Ajouter un type' : 'Modifier le type'}
            </h2>
            <button
              onClick={() => {
                setShowAddForm(false);
                setShowEditForm(false);
                setSelectedType(null);
                setName('');
                setDescription('');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={showAddForm ? handleAdd : handleEdit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du type
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Chargement...
                  </>
                ) : (
                  showAddForm ? 'Ajouter' : 'Modifier'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Types List */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Tags className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{type.name}</p>
                      </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {type.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => startEdit(type)}
                      className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors duration-200 mr-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => type.id && handleDelete(type.id)}
                      className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
              {filteredTypes.length === 0 && (
              <tr>
                  <td colSpan={3} className="px-6 py-10 text-center">
                    <Tags className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun type trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery
                        ? "Aucun type ne correspond à votre recherche."
                        : "Commencez par ajouter un type d'article."}
                    </p>
                    {searchQuery && (
                      <div className="mt-6">
                        <button
                          onClick={() => setSearchQuery('')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Réinitialiser la recherche
                        </button>
                      </div>
                    )}
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