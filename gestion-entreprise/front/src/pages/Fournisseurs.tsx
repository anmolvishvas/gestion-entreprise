import { useState, useEffect } from 'react';
import { Plus, Search, Users, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmbeddedTransaction } from '../context/AppContext';

export default function Fournisseurs() {
  const { fournisseurs, addFournisseur, isLoading: globalLoading, error: apiError } = useAppContext();
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter fournisseurs based on search term
  const filteredFournisseurs = fournisseurs?.filter(
    (fournisseur) =>
      fournisseur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredFournisseurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFournisseurs = filteredFournisseurs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !nom) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    // Check if code already exists
    if (fournisseurs?.some((f) => f.code === code)) {
      setError('Un fournisseur avec ce code existe déjà');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addFournisseur({
        code,
        nom,
        transactions: []
      });
      
      // Reset form
      setCode('');
      setNom('');
      setError('');
    } catch (err) {
      setError('Erreur lors de l\'ajout du fournisseur');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate total achats and reste for each fournisseur
  const getFournisseurStats = (transactions: EmbeddedTransaction[]) => {
    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let totalAchat = 0;
    let totalVirement = 0;

    // Calculer les totaux
    for (const transaction of sortedTransactions) {
      totalAchat += transaction.achat;
      totalVirement += transaction.virement;
    }

    // Le reste final est la différence entre le total des achats et le total des virements
    const totalReste = totalAchat - totalVirement;
    
    return { totalAchat, totalReste };
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Code', 'Nom', 'Total Achats (Ar)', 'Total Virements (Ar)', 'Reste à Payer (Ar)'];
    const csvData = filteredFournisseurs.map(fournisseur => {
      // Calculer les totaux pour ce fournisseur
      let totalAchat = 0;
      let totalVirement = 0;
      
      fournisseur.transactions.forEach(transaction => {
        totalAchat += transaction.achat;
        totalVirement += transaction.virement;
      });
      
      const totalReste = totalAchat - totalVirement;
      
      return [
        fournisseur.code,
        fournisseur.nom,
        totalAchat.toString(),
        totalVirement.toString(),
        totalReste.toString()
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `liste-fournisseurs-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (globalLoading || isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {apiError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Fournisseurs</h1>
        <p className="mt-1 text-gray-600">Ajoutez et gérez vos fournisseurs</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form to add fournisseur */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Fournisseur</h2>
            
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input"
                  placeholder="Ex: F001"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="input"
                  placeholder="Nom du fournisseur"
                />
              </div>
              
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </button>
            </form>
          </div>
          
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Pourquoi gérer vos fournisseurs?</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 ml-8 list-disc">
              <li>Suivre les achats par fournisseur</li>
              <li>Gérer les paiements et soldes</li>
              <li>Faciliter les commandes futures</li>
              <li>Analyser les performances des fournisseurs</li>
            </ul>
          </div>
        </div>
        
        {/* Fournisseurs list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Liste des Fournisseurs</h2>
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-gray-600">
                    {filteredFournisseurs.length} fournisseur(s) 
                    {filteredFournisseurs.length > 0 && ` • Page ${currentPage}/${totalPages}`}
                  </p>
                  <button
                    onClick={exportToCSV}
                    className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exporter CSV
                  </button>
                </div>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Achats (Ar)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reste à Payer (Ar)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedFournisseurs.map((fournisseur) => {
                    const { totalAchat, totalReste } = getFournisseurStats(fournisseur.transactions);
                    
                    return (
                      <tr key={fournisseur.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {fournisseur.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fournisseur.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                          {totalAchat.toLocaleString('fr-FR')}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          totalReste > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {totalReste.toLocaleString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredFournisseurs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur ajouté'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`btn-sm flex items-center ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`btn-sm flex items-center ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 