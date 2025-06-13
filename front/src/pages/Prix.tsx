import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { prixService, Prix, PrixFormData } from '../services/prixService';

function PrixForm({ onSubmit, onCancel, initialData }: { 
  onSubmit: (data: PrixFormData) => void, 
  onCancel: () => void,
  initialData?: Prix
}) {
  const [nomArticle, setNomArticle] = useState(initialData?.nomArticle || '');
  const [reference, setReference] = useState(initialData?.reference || '');
  const [prixUnitaire, setPrixUnitaire] = useState(initialData?.prixUnitaire || '');
  const [prixPaquetDetail, setPrixPaquetDetail] = useState(initialData?.prixPaquetDetail || '');
  const [prixPaquetGros, setPrixPaquetGros] = useState(initialData?.prixPaquetGros || '');
  const [prixCarton, setPrixCarton] = useState(initialData?.prixCarton || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomArticle || !prixUnitaire) {
      setError('Veuillez remplir les champs obligatoires');
      return;
    }
    
    onSubmit({
      nomArticle,
      reference,
      prixUnitaire,
      prixPaquetDetail,
      prixPaquetGros,
      prixCarton
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="nomArticle" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de l'article *
        </label>
        <input
          type="text"
          id="nomArticle"
          value={nomArticle}
          onChange={(e) => setNomArticle(e.target.value)}
          className="input"
          placeholder="Nom de l'article"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
          Référence
        </label>
        <input
          type="text"
          id="reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="input"
          placeholder="Référence de l'article (optionnel)"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="prixUnitaire" className="block text-sm font-medium text-gray-700 mb-1">
          Prix unitaire (Ar) *
        </label>
        <input
          type="text"
          id="prixUnitaire"
          value={prixUnitaire}
          onChange={(e) => setPrixUnitaire(e.target.value)}
          className="input"
          placeholder="Prix unitaire"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="prixPaquetDetail" className="block text-sm font-medium text-gray-700 mb-1">
          Prix paquet détail (Ar)
        </label>
        <input
          type="text"
          id="prixPaquetDetail"
          value={prixPaquetDetail}
          onChange={(e) => setPrixPaquetDetail(e.target.value)}
          className="input"
          placeholder="Prix paquet détail"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="prixPaquetGros" className="block text-sm font-medium text-gray-700 mb-1">
          Prix paquet gros (Ar)
        </label>
        <input
          type="text"
          id="prixPaquetGros"
          value={prixPaquetGros}
          onChange={(e) => setPrixPaquetGros(e.target.value)}
          className="input"
          placeholder="Prix paquet gros"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="prixCarton" className="block text-sm font-medium text-gray-700 mb-1">
          Prix carton (Ar)
        </label>
        <input
          type="text"
          id="prixCarton"
          value={prixCarton}
          onChange={(e) => setPrixCarton(e.target.value)}
          className="input"
          placeholder="Prix carton"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="btn btn-primary flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          {initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

export default function PrixPage() {
  const [prix, setPrix] = useState<Prix[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrix, setSelectedPrix] = useState<Prix | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrix();
  }, []);

  const fetchPrix = async () => {
    try {
      const data = await prixService.getAll();
      setPrix(data);
    } catch (error) {
      console.error('Erreur lors du chargement des prix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: PrixFormData) => {
    try {
      if (selectedPrix) {
        await prixService.update(selectedPrix.id, formData);
      } else {
        await prixService.create(formData);
      }
      fetchPrix();
      setIsModalOpen(false);
      setSelectedPrix(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du prix:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prix ?')) {
      try {
        await prixService.delete(id);
        fetchPrix();
      } catch (error) {
        console.error('Erreur lors de la suppression du prix:', error);
      }
    }
  };

  const handleEdit = (prix: Prix) => {
    setSelectedPrix(prix);
    setIsModalOpen(true);
  };

  const handleSearch = async (query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      try {
        const results = await prixService.search(query);
        setPrix(results);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    } else {
      fetchPrix();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  Gestion des Prix
                </span>
                <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                  {prix.length} prix
                </span>
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Gérez les prix de vos articles et produits
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPrix(null);
                setIsModalOpen(true);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouveau Prix
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="relative flex-1 max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input pl-10 w-full"
                  placeholder="Rechercher un prix..."
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Unitaire
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Paquet Détail
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Paquet Gros
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Carton
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prix.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.nomArticle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.reference}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {p.prixUnitaire} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {p.prixPaquetDetail} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {p.prixPaquetGros} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {p.prixCarton} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {prix.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">Aucun prix trouvé</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrix(null);
        }}
        title={selectedPrix ? "Modifier le prix" : "Nouveau prix"}
      >
        <PrixForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedPrix(null);
          }}
          initialData={selectedPrix || undefined}
        />
      </Modal>
    </div>
  );
} 