import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { ItemType } from '../services/itemTypeService';

export default function ItemTypes() {
  const { itemTypes, addItemType, updateItemType, deleteItemType, isLoading, error } = useAppContext();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Types d'Articles</h1>
        <p className="mt-1 text-gray-600">Gérez les différents types d'articles de votre inventaire</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || showEditForm) && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
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
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={showAddForm ? handleAdd : handleEdit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du type
              </label>
              <input
                type="text"
                id="name"
                className="input w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnelle)
              </label>
              <textarea
                id="description"
                className="input w-full"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn bg-blue-600 text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Chargement...' : showAddForm ? 'Ajouter' : 'Modifier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Action Button */}
      {!showAddForm && !showEditForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-6 btn bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un type
        </button>
      )}

      {/* Types List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
          <tbody className="bg-white divide-y divide-gray-200">
            {itemTypes.map((type) => (
              <tr key={type.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {type.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {type.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => startEdit(type)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => type.id && handleDelete(type.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {itemTypes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Aucun type d'article défini
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 