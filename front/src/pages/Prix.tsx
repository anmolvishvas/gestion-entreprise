import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Download, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import { prixService, Prix, PrixFormData } from '../services/prixService';

type ArticleType = 'fourniture' | 'appareil';

function PrixForm({ onSubmit, onCancel, initialData }: { 
  onSubmit: (data: PrixFormData) => void, 
  onCancel: () => void,
  initialData?: Prix
}) {
  const [type, setType] = useState<ArticleType>(initialData?.type || 'fourniture');
  const [nomArticle, setNomArticle] = useState(initialData?.nomArticle || '');
  const [reference, setReference] = useState(initialData?.reference || '');
  const [prixUnitaire, setPrixUnitaire] = useState(initialData?.prixUnitaire || '');
  const [prixPaquetDetail, setPrixPaquetDetail] = useState(initialData?.prixPaquetDetail || '');
  const [prixPaquetGros, setPrixPaquetGros] = useState(initialData?.prixPaquetGros || '');
  const [prixCarton, setPrixCarton] = useState(initialData?.prixCarton || '');
  const [prixAfficher, setPrixAfficher] = useState(initialData?.prixAfficher || '');
  const [dernierPrix, setDernierPrix] = useState(initialData?.dernierPrix || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nomArticle) {
      setError('Veuillez remplir le nom de l\'article');
      return;
    }
    
    onSubmit({
      type,
      nomArticle,
      reference,
      prixUnitaire,
      prixPaquetDetail,
      prixPaquetGros,
      prixCarton,
      prixAfficher,
      dernierPrix
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type d'article *
        </label>
        <div className="flex space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="fourniture"
              checked={type === 'fourniture'}
              onChange={(e) => setType(e.target.value as ArticleType)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Fourniture scolaire</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="appareil"
              checked={type === 'appareil'}
              onChange={(e) => setType(e.target.value as ArticleType)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Appareil</span>
          </label>
        </div>
      </div>
      
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
      
      {type === 'fourniture' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="prixAfficher" className="block text-sm font-medium text-gray-700 mb-1">
              Prix affiché (Ar) *
            </label>
            <input
              type="text"
              id="prixAfficher"
              value={prixAfficher}
              onChange={(e) => setPrixAfficher(e.target.value)}
              className="input"
              placeholder="Prix affiché"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="dernierPrix" className="block text-sm font-medium text-gray-700 mb-1">
              Dernier prix (Ar) *
            </label>
            <input
              type="text"
              id="dernierPrix"
              value={dernierPrix}
              onChange={(e) => setDernierPrix(e.target.value)}
              className="input"
              placeholder="Dernier prix"
            />
          </div>
        </>
      )}
      
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<ArticleType>('fourniture');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPrix();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchTerm]);

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

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleExportPDF = () => {
    prixService.exportToPDF(filteredPrix, searchTerm, selectedType);
  };

  const filteredPrix = prixService.filter(prix, {
    type: selectedType,
    searchTerm: searchTerm
  });

  const totalPages = Math.ceil(filteredPrix.length / itemsPerPage);
  const paginatedPrix = filteredPrix.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Download className="h-5 w-5 mr-2" />
                Exporter PDF
              </button>
              <button
                onClick={() => {
                  setSelectedPrix(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouveau Prix
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="fourniture"
                      checked={selectedType === 'fourniture'}
                      onChange={(e) => setSelectedType(e.target.value as ArticleType)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Fournitures scolaires</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="appareil"
                      checked={selectedType === 'appareil'}
                      onChange={(e) => setSelectedType(e.target.value as ArticleType)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Appareils</span>
                  </label>
                </div>
              </div>
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
            {/* Desktop View */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  {selectedType === 'fourniture' ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix Affiché
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernier Prix
                      </th>
                    </>
                  )}
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPrix.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.nomArticle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.reference}
                    </td>
                    {selectedType === 'fourniture' ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {p.prixAfficher} Ar
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {p.dernierPrix} Ar
                        </td>
                      </>
                    )}
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
                    <td colSpan={selectedType === 'fourniture' ? 7 : 5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">Aucun prix trouvé</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile View */}
            <div className="md:hidden">
              {paginatedPrix.map((p) => (
                <div key={p.id} className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{p.nomArticle}</h3>
                      {p.reference && (
                        <p className="text-sm text-gray-500">Réf: {p.reference}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedType === 'fourniture' ? (
                      <>
                        <div>
                          <span className="text-gray-500">Prix Unitaire:</span>
                          <span className="ml-2 text-gray-900">{p.prixUnitaire} Ar</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Paquet Détail:</span>
                          <span className="ml-2 text-gray-900">{p.prixPaquetDetail} Ar</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Paquet Gros:</span>
                          <span className="ml-2 text-gray-900">{p.prixPaquetGros} Ar</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Carton:</span>
                          <span className="ml-2 text-gray-900">{p.prixCarton} Ar</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-gray-500">Prix Affiché:</span>
                          <span className="ml-2 text-gray-900">{p.prixAfficher} Ar</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Dernier Prix:</span>
                          <span className="ml-2 text-gray-900">{p.dernierPrix} Ar</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {prix.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Aucun prix trouvé</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredPrix.length)} sur {filteredPrix.length} prix
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Première
                </button>
                
                <button 
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                
                {/* Pages */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                    
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key="1"
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span key="start-ellipsis" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          className={`px-3 py-1.5 rounded-lg ${
                            currentPage === i
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="end-ellipsis" className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button 
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ArrowLeft className="h-4 w-4 transform rotate-180" />
                </button>
                
                <button 
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Dernière
                  <ArrowLeft className="h-4 w-4 ml-1 transform rotate-180" />
                </button>
              </div>
            </div>
          )}
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