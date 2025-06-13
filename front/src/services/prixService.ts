import api, { API_URL } from './api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ArticleType = 'fourniture' | 'appareil';

export interface Prix {
  id: number;
  type: ArticleType;
  nomArticle: string;
  reference: string;
  prixUnitaire?: string;
  prixPaquetDetail?: string;
  prixPaquetGros?: string;
  prixCarton?: string;
  prixAfficher?: string;
  dernierPrix?: string;
}

export interface PrixFormData {
  type: ArticleType;
  nomArticle: string;
  reference: string;
  prixUnitaire?: string;
  prixPaquetDetail?: string;
  prixPaquetGros?: string;
  prixCarton?: string;
  prixAfficher?: string;
  dernierPrix?: string;
}

interface ApiResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  'totalItems': number;
  'member': Prix[];
}

export const prixService = {
  async getAll(): Promise<Prix[]> {
    const response = await api.get<ApiResponse>(`${API_URL}/prixes`);
    return response.data.member || [];
  },

  async getById(id: number): Promise<Prix> {
    const response = await api.get<Prix>(`${API_URL}/prixes/${id}`);
    return response.data;
  },

  async create(data: PrixFormData): Promise<Prix> {
    const response = await api.post<Prix>(`${API_URL}/prixes`, data);
    return response.data;
  },

  async update(id: number, data: PrixFormData): Promise<Prix> {
    const response = await api.put<Prix>(`${API_URL}/prixes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${API_URL}/prixes/${id}`);
  },

  // Méthode pour filtrer par type côté front
  filterByType(prix: Prix[], type: ArticleType): Prix[] {
    return prix.filter(p => p.type === type);
  },

  // Méthode pour filtrer par recherche côté front
  filterBySearch(prix: Prix[], searchTerm: string): Prix[] {
    if (!searchTerm) return prix;
    const term = searchTerm.toLowerCase();
    return prix.filter(p => 
      p.nomArticle.toLowerCase().includes(term) ||
      (p.reference && p.reference.toLowerCase().includes(term))
    );
  },

  // Méthode pour compter les articles par type
  countByType(prix: Prix[]): { fourniture: number; appareil: number } {
    return prix.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, { fourniture: 0, appareil: 0 } as { fourniture: number; appareil: number });
  },

  // Méthode pour filtrer avec tous les critères
  filter(prix: Prix[], options: { type?: ArticleType; searchTerm?: string }): Prix[] {
    let filtered = [...prix];
    
    if (options.type) {
      filtered = this.filterByType(filtered, options.type);
    }
    
    if (options.searchTerm) {
      filtered = this.filterBySearch(filtered, options.searchTerm);
    }
    
    return filtered;
  },

  exportToPDF(prix: Prix[], searchTerm?: string, type?: ArticleType): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(20);
    doc.text('Liste des Prix', 14, 20);

    // Add date
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString('fr-FR');
    doc.text(`Date: ${date}`, 14, 30);

    // Add type if specified
    if (type) {
      doc.text(`Type: ${type === 'fourniture' ? 'Fournitures scolaires' : 'Appareils'}`, 14, 35);
    }

    // Add search term if present
    if (searchTerm) {
      doc.text(`Recherche: "${searchTerm}"`, 14, type ? 40 : 35);
    }

    // Add table
    autoTable(doc, {
      startY: searchTerm ? (type ? 45 : 40) : (type ? 40 : 35),
      head: type === 'fourniture' 
        ? [['Article', 'Référence', 'Prix Unitaire', 'Prix Paquet Détail', 'Prix Paquet Gros', 'Prix Carton']]
        : [['Article', 'Référence', 'Prix Affiché', 'Dernier Prix']],
      body: prix.map(p => type === 'fourniture'
        ? [
            p.nomArticle,
            p.reference || '-',
            `${p.prixUnitaire} Ar`,
            p.prixPaquetDetail ? `${p.prixPaquetDetail} Ar` : '-',
            p.prixPaquetGros ? `${p.prixPaquetGros} Ar` : '-',
            p.prixCarton ? `${p.prixCarton} Ar` : '-'
          ]
        : [
            p.nomArticle,
            p.reference || '-',
            `${p.prixAfficher} Ar`,
            `${p.dernierPrix} Ar`
          ]
      ),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      columnStyles: type === 'fourniture'
        ? {
            0: { cellWidth: 40 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' }
          }
        : {
            0: { cellWidth: 60 },
            1: { cellWidth: 40 },
            2: { cellWidth: 45, halign: 'right' },
            3: { cellWidth: 45, halign: 'right' }
          },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`liste-prix-${type || 'tous'}.pdf`);
  }
}; 