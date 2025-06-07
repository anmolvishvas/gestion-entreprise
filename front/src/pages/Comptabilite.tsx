import   { useState } from 'react';
import { Plus, FileText, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Transaction } from '../context/AppContext';

export default function Comptabilite() {
  const { transactions = [], addTransaction, fournisseurs = [], isLoading } = useAppContext();
  const [date, setDate] = useState('');
  const [fournisseurId, setFournisseurId] = useState<string>('');
  const [achat, setAchat] = useState('');
  const [virement, setVirement] = useState('');
  const [error, setError] = useState('');
  const [selectedFournisseur, setSelectedFournisseur] = useState('');

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
    
    const selectedFournisseur = fournisseurs.find(f => String(f.id) === fournisseurId);
    
    if (!selectedFournisseur) {
      setError('Fournisseur invalide');
      return;
    }

    // Calculer le reste pour ce fournisseur
    const fournisseurTransactions = transactions.filter(t => String(t.fournisseur.id) === fournisseurId);
    const totalAchats = fournisseurTransactions.reduce((sum, t) => sum + t.achat, 0) + achatValue;
    const totalVirements = fournisseurTransactions.reduce((sum, t) => sum + t.virement, 0) + virementValue;
    const reste = totalAchats - totalVirements;

    addTransaction({
      date,
      fournisseur: {
        id: fournisseurId,
        code: selectedFournisseur.code,
        nom: selectedFournisseur.nom
      },
      achat: achatValue,
      virement: virementValue,
      reste,
    });
    
    setDate('');
    setFournisseurId('');
    setAchat('');
    setVirement('');
    setError('');
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

  // Calculer les totaux globaux
  const totalAchat = transactions.reduce((sum, t) => sum + t.achat, 0);
  const totalVirement = transactions.reduce((sum, t) => sum + t.virement, 0);
  const totalReste = totalAchat - totalVirement;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Code Fournisseur', 'Nom Fournisseur', 'Achat (Ar)', 'Virement (Ar)', 'Reste (Ar)'];
    const csvData = transactionsToDisplay.map(transaction => {
      return [
        new Date(transaction.date).toLocaleDateString('fr-FR'),
        transaction.fournisseur.code,
        transaction.fournisseur.nom,
        transaction.achat.toString(),
        transaction.virement.toString(),
        transaction.reste.toString()
      ];
    });
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = selectedFournisseur 
      ? `transactions-${fournisseurs.find(f => String(f.id) === selectedFournisseur)?.code}-${new Date().toISOString().slice(0, 10)}.csv`
      : `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comptabilité</h1>
        <p className="mt-1 text-gray-600">Gérez vos transactions financières</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Achats</p>
              <p className="text-lg font-semibold">{totalAchat.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Virements</p>
              <p className="text-lg font-semibold">{totalVirement.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FileText className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reste</p>
              <p className="text-lg font-semibold">{totalReste.toLocaleString('fr-FR')} Ar</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form to add transaction */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une Transaction</h2>
            
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
              
              <button type="submit" className="btn btn-primary w-full flex items-center justify-center">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </button>
            </form>
          </div>
          
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <img 
              src="https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxidXNpbmVzcyUyMGFjY291bnRpbmclMjBpbnZlbnRvcnklMjBtYW5hZ2VtZW50fGVufDB8fHx8MTc0ODk2NDUxN3ww&ixlib=rb-4.1.0&fit=fillmax&h=500&w=800"
              alt="Business accounting" 
              className="w-full h-40 object-cover rounded-md"
            />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Suivez vos finances</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enregistrez toutes vos transactions pour maintenir une comptabilité précise et à jour.
            </p>
          </div>
        </div>
        
        {/* Transactions list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Liste des Transactions</h2>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <p className="text-sm text-gray-600">
                    {transactionsToDisplay.length} transaction{transactionsToDisplay.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={exportToCSV}
                    className="btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exporter CSV
                  </button>
                </div>
                <div className="w-64">
                  <select
                    value={selectedFournisseur}
                    onChange={(e) => setSelectedFournisseur(e.target.value)}
                    className="input text-sm"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Achat (Ar)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Virement (Ar)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reste (Ar)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactionsToDisplay.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {`${transaction.fournisseur.code} - ${transaction.fournisseur.nom}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                        {transaction.achat.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                        {transaction.virement.toLocaleString('fr-FR')}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        transaction.reste > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.reste.toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                  
                  {transactionsToDisplay.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune transaction trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 