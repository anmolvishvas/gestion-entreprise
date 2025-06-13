import { useState } from 'react';
import { Plus, FileText, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../context/AppContext';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TransactionFormData {
  date: string;
  fournisseurId: string;
  achat: number;
  virement: number;
  description: string;
}

// Composant StatCard pour les statistiques
function StatCard({ 
  title, 
  amount, 
  icon: Icon, 
  colorClass 
}: { 
  title: string; 
  amount: number; 
  icon: any;
  colorClass: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {amount.toLocaleString('fr-FR')} Ar
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colorClass.replace('text-', 'bg-').replace('/20', '')} transition-all duration-500`} 
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant du formulaire d'ajout de transaction
function TransactionForm({ onSubmit, onCancel }: { 
  onSubmit: (data: TransactionFormData) => void, 
  onCancel: () => void 
}) {
  const { fournisseurs = [] } = useAppContext();
  const [date, setDate] = useState('');
  const [fournisseurId, setFournisseurId] = useState<string>('');
  const [achat, setAchat] = useState('');
  const [virement, setVirement] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !fournisseurId || !achat || !virement) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    const achatValue = parseFloat(achat);
    const virementValue = parseFloat(virement);
    
    if (isNaN(achatValue) || isNaN(virementValue)) {
      setError('Les montants doivent être des nombres valides');
      return;
    }
    
    onSubmit({
      date,
      fournisseurId,
      achat: achatValue,
      virement: virementValue,
      description
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
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="fournisseur" className="block text-sm font-medium text-gray-700 mb-1">
          Fournisseur
        </label>
        <select
          id="fournisseur"
          value={fournisseurId}
          onChange={(e) => setFournisseurId(e.target.value)}
          className="input"
        >
          <option value="">-- Sélectionner un fournisseur --</option>
          {fournisseurs.map((fournisseur) => (
            <option key={fournisseur.id} value={String(fournisseur.id)}>
              {fournisseur.code} - {fournisseur.nom}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label htmlFor="achat" className="block text-sm font-medium text-gray-700 mb-1">
          Achat (Ar)
        </label>
        <input
          type="number"
          id="achat"
          value={achat}
          onChange={(e) => setAchat(e.target.value)}
          className="input"
          placeholder="Montant de l'achat"
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="virement" className="block text-sm font-medium text-gray-700 mb-1">
          Virement (Ar)
        </label>
        <input
          type="number"
          id="virement"
          value={virement}
          onChange={(e) => setVirement(e.target.value)}
          className="input"
          placeholder="Montant du virement"
          min="0"
          step="0.01"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          placeholder="Description de la transaction"
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
          Ajouter
        </button>
      </div>
    </form>
  );
}

export default function Comptabilite() {
  const { transactions = [], addTransaction, fournisseurs = [], isLoading } = useAppContext();
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 20;

  // Fonction pour calculer le reste pour un fournisseur spécifique jusqu'à une transaction donnée
  const calculateResteForFournisseur = (fournisseurId: string, currentTransactionId: string) => {
    const fournisseurTransactions = transactions
      .filter(t => String(t.fournisseur.id) === String(fournisseurId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalAchats = 0;
    let totalVirements = 0;

    for (const transaction of fournisseurTransactions) {
      totalAchats += transaction.achat;
      totalVirements += transaction.virement;
      
      if (String(transaction.id) === String(currentTransactionId)) {
        break;
      }
    }

    return totalAchats - totalVirements;
  };

  const handleSubmit = (formData: TransactionFormData) => {
    const selectedFournisseur = fournisseurs.find(f => String(f.id) === formData.fournisseurId);
    
    if (!selectedFournisseur) {
      return;
    }

    // Calculer le reste pour ce fournisseur
    const fournisseurTransactions = transactions.filter(t => String(t.fournisseur.id) === formData.fournisseurId);
    const totalAchats = fournisseurTransactions.reduce((sum, t) => sum + t.achat, 0) + formData.achat;
    const totalVirements = fournisseurTransactions.reduce((sum, t) => sum + t.virement, 0) + formData.virement;
    const reste = totalAchats - totalVirements;

    addTransaction({
      date: formData.date,
      fournisseur: {
        id: formData.fournisseurId,
        code: selectedFournisseur.code,
        nom: selectedFournisseur.nom
      },
      achat: formData.achat,
      virement: formData.virement,
      reste,
      description: formData.description
    });
    
    setIsModalOpen(false);
  };

  // Grouper les transactions par fournisseur
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const fournisseurId = transaction.fournisseur.id;
    if (!acc[fournisseurId]) {
      acc[fournisseurId] = [];
    }
    acc[fournisseurId].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Préparer les transactions pour l'affichage avec le reste calculé par fournisseur
  const prepareTransactionsForDisplay = () => {
    let displayTransactions = selectedFournisseur
      ? transactions.filter(t => String(t.fournisseur.id) === selectedFournisseur)
      : transactions;

    // Trier par date
    displayTransactions = [...displayTransactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculer le reste cumulatif pour chaque transaction
    return displayTransactions.map(transaction => ({
      ...transaction,
      reste: calculateResteForFournisseur(String(transaction.fournisseur.id), String(transaction.id))
    }));
  };

  const transactionsToDisplay = prepareTransactionsForDisplay();
  
  // Pagination logic
  const totalPages = Math.ceil(transactionsToDisplay.length / itemsPerPage);
  const paginatedTransactions = transactionsToDisplay.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculer les totaux globaux
  const totalAchat = transactions.reduce((sum, t) => sum + t.achat, 0);
  const totalVirement = transactions.reduce((sum, t) => sum + t.virement, 0);
  const totalReste = totalAchat - totalVirement;

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Orientation paysage
    
    // Calculer les totaux en fonction du filtre fournisseur
    const filteredTransactions = selectedFournisseur 
      ? transactions.filter(t => String(t.fournisseur.id) === selectedFournisseur)
      : transactions;
    
    const totalAchatFiltered = filteredTransactions.reduce((sum, t) => sum + t.achat, 0);
    const totalVirementFiltered = filteredTransactions.reduce((sum, t) => sum + t.virement, 0);
    const totalResteFiltered = totalAchatFiltered - totalVirementFiltered;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Transactions', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Add summary statistics
    doc.setFontSize(11);
    doc.text(`Total Achats: ${totalAchatFiltered.toLocaleString('fr-FR').replace(/\s/g, ' ')} Ar`, 14, 38);
    doc.text(`Total Virements: ${totalVirementFiltered.toLocaleString('fr-FR').replace(/\s/g, ' ')} Ar`, 14, 42);
    doc.text(`Total Reste: ${totalResteFiltered.toLocaleString('fr-FR').replace(/\s/g, ' ')} Ar`, 14, 46);
    
    // Add filter info if a supplier is selected
    if (selectedFournisseur) {
      const selectedFournisseurData = fournisseurs.find(f => String(f.id) === selectedFournisseur);
      if (selectedFournisseurData) {
        doc.text(`Fournisseur: ${selectedFournisseurData.code} - ${selectedFournisseurData.nom}`, 14, 50);
      }
    }
    
    // Prepare table data
    const tableData = transactionsToDisplay.map(transaction => {
      return [
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        `${transaction.fournisseur.code} - ${transaction.fournisseur.nom}`,
        transaction.description || '-',
        transaction.achat.toLocaleString('fr-FR').replace(/\s/g, ' '),
        transaction.virement.toLocaleString('fr-FR').replace(/\s/g, ' '),
        transaction.reste.toLocaleString('fr-FR').replace(/\s/g, ' ')
      ];
    });

    // Add main table
    autoTable(doc, {
      startY: selectedFournisseur ? 55 : 50,
      head: [['Date', 'Fournisseur', 'Description', 'Achat (Ar)', 'Virement (Ar)', 'Reste (Ar)']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
        5: { cellWidth: 35, halign: 'right' }
      },
      margin: { top: selectedFournisseur ? 55 : 50, left: 14, right: 14 },
      pageBreak: 'auto',
      showFoot: 'lastPage',
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} sur ${data.pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    const fileName = selectedFournisseur 
      ? `transactions-${fournisseurs.find(f => String(f.id) === selectedFournisseur)?.code}-${new Date().toISOString().slice(0, 10)}.pdf`
      : `transactions-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
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
                  Comptabilité
                </span>
                <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                  {transactions.length} transactions
                </span>
              </h1>
              <p className="mt-3 text-lg text-gray-600">
                Gérez efficacement vos transactions financières et suivez vos paiements
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Transaction
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-blue-100 text-sm">Total Achats</p>
                <p className="text-2xl font-bold">{totalAchat.toLocaleString('fr-FR')} Ar</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-emerald-100 text-sm">Total Virements</p>
                <p className="text-2xl font-bold">{totalVirement.toLocaleString('fr-FR')} Ar</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 opacity-75" />
              <div className="ml-4">
                <p className="text-red-100 text-sm">Total Reste</p>
                <p className="text-2xl font-bold">{totalReste.toLocaleString('fr-FR')} Ar</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
                <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                  {transactionsToDisplay.length} total
                </span>
                <button
                  onClick={exportToPDF}
                  className="inline-flex items-center px-3 py-1 border border-gray-200 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Exporter PDF
                </button>
              </div>
              <div className="w-full sm:w-64">
                <select
                  value={selectedFournisseur}
                  onChange={(e) => {
                    setSelectedFournisseur(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input w-full text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
                >
                  <option value="">Tous les fournisseurs</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur.id} value={String(fournisseur.id)}>
                      {fournisseur.code} - {fournisseur.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Achat (Ar)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Virement (Ar)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reste (Ar)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {transaction.fournisseur.nom.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{transaction.fournisseur.nom}</p>
                          <p className="text-sm text-gray-500">{transaction.fournisseur.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {transaction.achat.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {transaction.virement.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        transaction.reste > 0 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {transaction.reste.toLocaleString('fr-FR')}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500">Aucune transaction trouvée</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle Transaction"
      >
        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
 