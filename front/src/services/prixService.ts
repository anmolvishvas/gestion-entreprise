import api, { API_URL } from "./api";
import { authService } from "./authService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Prix {
  id: number;
  nomArticle: string;
  reference: string;
  prixUnitaire: string;
  prixPaquetDetail: string;
  prixPaquetGros: string;
  prixCarton: string;
}

export interface PrixFormData {
  nomArticle: string;
  reference: string;
  prixUnitaire: string;
  prixPaquetDetail: string;
  prixPaquetGros: string;
  prixCarton: string;
}

class PrixService {
  private baseUrl = `${API_URL}/prixes`;

  private getHeaders() {
    const token = authService.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAll(): Promise<Prix[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des prix');
      }
      const data = await response.json();
      // API Platform returns data with items in the 'member' property
      return data.member || [];
    } catch (error) {
      console.error('Erreur dans getAll:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Prix> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du prix');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur dans getById:', error);
      throw error;
    }
  }

  async create(prixData: PrixFormData): Promise<Prix> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(prixData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du prix');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur dans create:', error);
      throw error;
    }
  }

  async update(id: number, prixData: PrixFormData): Promise<Prix> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(prixData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du prix');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur dans update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du prix');
      }
    } catch (error) {
      console.error('Erreur dans delete:', error);
      throw error;
    }
  }

  async search(query: string): Promise<Prix[]> {
    try {
      const response = await fetch(`${this.baseUrl}?nomArticle=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche des prix');
      }
      const data = await response.json();
      // API Platform returns data with items in the 'member' property
      return data.member || [];
    } catch (error) {
      console.error('Erreur dans search:', error);
      throw error;
    }
  }

  async exportToPDF(prix: Prix[], searchTerm?: string) {
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

    // Add search term if present
    if (searchTerm) {
      doc.text(`Recherche: "${searchTerm}"`, 14, 35);
    }

    // Add table
    autoTable(doc, {
      startY: searchTerm ? 40 : 35,
      head: [['Article', 'Référence', 'Prix Unitaire', 'Prix Paquet Détail', 'Prix Paquet Gros', 'Prix Carton']],
      body: prix.map(p => [
        p.nomArticle,
        p.reference || '-',
        `${p.prixUnitaire} Ar`,
        p.prixPaquetDetail ? `${p.prixPaquetDetail} Ar` : '-',
        p.prixPaquetGros ? `${p.prixPaquetGros} Ar` : '-',
        p.prixCarton ? `${p.prixCarton} Ar` : '-'
      ]),
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
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function(data) {
        // Add page number
        doc.setFontSize(8);
        doc.text(
          `Page ${data.pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`prix_${date.replace(/\//g, '-')}.pdf`);
  }
}

export const prixService = new PrixService(); 