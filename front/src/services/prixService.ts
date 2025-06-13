import api, { API_URL } from "./api";
import { authService } from "./authService";

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
}

export const prixService = new PrixService(); 