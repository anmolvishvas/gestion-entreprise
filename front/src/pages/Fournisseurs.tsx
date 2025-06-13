import { useState, useEffect } from 'react';
import { Plus, Search, Users, Download, ChevronLeft, ChevronRight, TrendingUp, AlertCircle, X, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { EmbeddedTransaction } from '../context/AppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Fournisseur {
  id?: string;
  code: string;
  nom: string;
  transactions: EmbeddedTransaction[];
}

export default function Fournisseurs() {
  const { fournisseurs, addFournisseur, updateFournisseur, isLoading: globalLoading, error: apiError } = useAppContext();
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSearchTerm, setEditSearchTerm] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editNom, setEditNom] = useState('');
  
  // Filter fournisseurs based on search term
  const filteredFournisseurs = fournisseurs?.filter(
    (fournisseur) =>
      fournisseur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter fournisseurs for edit modal
  const editFilteredFournisseurs = fournisseurs?.filter(
    (fournisseur) =>
      fournisseur.code.toLowerCase().includes(editSearchTerm.toLowerCase()) ||
      fournisseur.nom.toLowerCase().includes(editSearchTerm.toLowerCase())
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

  const resetCreateForm = () => {
    setCode('');
    setNom('');
    setError('');
    setIsCreateModalOpen(false);
  };

  const resetEditForm = () => {
    setEditSearchTerm('');
    setSelectedFournisseur(null);
    setEditCode('');
    setEditNom('');
    setError('');
    setIsEditModalOpen(false);
  };
  
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
      
      resetCreateForm();
    } catch (err) {
      setError('Erreur lors de l\'ajout du fournisseur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFournisseur) {
      setError('Veuillez sélectionner un fournisseur');
      return;
    }

    if (!editCode || !editNom) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    // Check if code already exists and it's not the current fournisseur
    if (fournisseurs?.some((f) => f.code === editCode && f.id !== selectedFournisseur.id)) {
      setError('Un fournisseur avec ce code existe déjà');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (!selectedFournisseur.id) {
        throw new Error('ID du fournisseur manquant');
      }

      await updateFournisseur(
        selectedFournisseur.id,
        {
          code: editCode,
          nom: editNom
        }
      );
      
      resetEditForm();
    } catch (err) {
      setError('Erreur lors de la modification du fournisseur');
      console.error('Erreur de modification:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectFournisseurForEdit = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setEditCode(fournisseur.code);
    setEditNom(fournisseur.nom);
    setEditSearchTerm('');
  };
  
  // Calculate total achats and reste for each fournisseur
  const getFournisseurStats = (transactions: EmbeddedTransaction[]) => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let totalAchat = 0;
    let totalVirement = 0;

    for (const transaction of sortedTransactions) {
      totalAchat += transaction.achat;
      totalVirement += transaction.virement;
    }

    const totalReste = totalAchat - totalVirement;
    return { totalAchat, totalReste };
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage
    
    // Add title
    doc.setFontSize(20);
    doc.text('Liste des Fournisseurs', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Prepare table data
    const tableData = filteredFournisseurs.map(fournisseur => {
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
        totalAchat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        totalVirement.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "),
        totalReste.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      ];
    });

    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Code', 'Nom', 'Total Achats (Ar)', 'Total Virements (Ar)', 'Reste à Payer (Ar)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 45, halign: 'right' },
        3: { cellWidth: 45, halign: 'right' },
        4: { cellWidth: 45, halign: 'right' }
      },
      margin: { top: 35 },
      pageBreak: 'auto',
      showFoot: 'lastPage',
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`liste-fournisseurs-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (globalLoading || isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-200 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {apiError}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
            Gestion des Fournisseurs
          </span>
          <span className="ml-4 px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-full">
            {fournisseurs?.length || 0} total
          </span>
        </h1>
        <p className="mt-3 text-lg text-gray-600">Gérez efficacement vos relations fournisseurs</p>
      </div>
      
      <div className="space-y-8">
        {/* Action buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Fournisseur
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Modifier un Fournisseur
              </button>
        </div>
        
        {/* Fournisseurs list */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                  Liste des Fournisseurs
                </span>
              </h2>
              <div className="flex items-center gap-4">
                  <button
                    onClick={exportToPDF}
                  className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors duration-200 font-medium text-sm"
                  >
                  <Download className="h-4 w-4 mr-2" />
                    Exporter PDF
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
                className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full hidden md:table">
                <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100">
                      Code
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100">
                      Nom
                    </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100">
                      Total Achats (Ar)
                    </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-y border-gray-100">
                      Reste à Payer (Ar)
                    </th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-gray-100">
                  {paginatedFournisseurs.map((fournisseur) => {
                    const { totalAchat, totalReste } = getFournisseurStats(fournisseur.transactions);
                    
                    return (
                    <tr key={fournisseur.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
                          {fournisseur.code}
                        </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{fournisseur.nom}</span>
                        </div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="font-medium text-gray-900">
                          {totalAchat.toLocaleString('fr-FR')}
                        </span>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-medium ${
                          totalReste > 0 
                            ? 'bg-red-50 text-red-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {totalReste.toLocaleString('fr-FR')}
                          <TrendingUp className={`h-4 w-4 ml-1.5 ${
                            totalReste > 0 ? 'text-red-500' : 'text-green-500'
                          }`} />
                        </span>
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredFournisseurs.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                        {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur ajouté'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {searchTerm ? 'Essayez avec un autre terme' : 'Commencez par ajouter un fournisseur'}
                        </p>
                      </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Mobile View */}
              <div className="md:hidden">
                {paginatedFournisseurs.map((fournisseur) => {
                  const { totalAchat, totalReste } = getFournisseurStats(fournisseur.transactions);
                  
                  return (
                    <div key={fournisseur.id} className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                            <Users className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{fournisseur.nom}</h3>
                            <span className="text-xs text-gray-500">{fournisseur.code}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Achats</span>
                          <span className="text-sm font-medium text-gray-900">{totalAchat.toLocaleString('fr-FR')} Ar</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Reste à Payer</span>
                          <span className={`text-sm font-medium ${
                            totalReste > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {totalReste.toLocaleString('fr-FR')} Ar
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {filteredFournisseurs.length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur ajouté'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {searchTerm ? 'Essayez avec un autre terme' : 'Commencez par ajouter un fournisseur'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              {/* Desktop Pagination */}
              <div className="hidden md:flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        currentPage === page
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>

              {/* Mobile Pagination */}
              <div className="md:hidden">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`p-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      «
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      ‹
                    </button>
                    <button
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-md"
                    >
                      {currentPage}
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      ›
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 text-sm font-medium rounded-md ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouveau Fournisseur</h2>
                <button
                  onClick={resetCreateForm}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="create-code" className="block text-sm font-medium text-gray-700 mb-2">
                      Code Fournisseur
                    </label>
                    <input
                      type="text"
                      id="create-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      placeholder="Ex: F001"
                    />
                  </div>

                  <div>
                    <label htmlFor="create-nom" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du Fournisseur
                    </label>
                    <input
                      type="text"
                      id="create-nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                      placeholder="Entrez le nom"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetCreateForm}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Modifier un Fournisseur</h2>
                <button
                  onClick={resetEditForm}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {!selectedFournisseur ? (
                <div>
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Rechercher un fournisseur..."
                      value={editSearchTerm}
                      onChange={(e) => setEditSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 pl-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {editFilteredFournisseurs.map((fournisseur) => (
                      <button
                        key={fournisseur.id}
                        onClick={() => selectFournisseurForEdit(fournisseur)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                      >
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{fournisseur.nom}</p>
                          <p className="text-sm text-gray-500">Code: {fournisseur.code}</p>
                        </div>
                      </button>
                    ))}

                    {editFilteredFournisseurs.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        Aucun fournisseur trouvé
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEdit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-2">
                        Code Fournisseur
                      </label>
                      <input
                        type="text"
                        id="edit-code"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Ex: F001"
                      />
                    </div>

                    <div>
                      <label htmlFor="edit-nom" className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du Fournisseur
                      </label>
                      <input
                        type="text"
                        id="edit-nom"
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                        placeholder="Entrez le nom"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedFournisseur(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={resetEditForm}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
 