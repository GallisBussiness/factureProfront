export interface InvoiceLine {
  produitId: string;
  produit?: {
    _id: string;
    nom: string;
    prix?: number;
    unite?: string;
  };
  quantite: number;
  prixUnitaire?: number;
  totalLigne?: number;
}

export interface Invoice {
  _id: string;
  numero: string;
  clientId: string;
  client?: {
    _id: string;
    nom: string;
    telephone?: string;
  };
  dateEmission: string;
  dateEcheance: string;
  lignes: InvoiceLine[];
  notes?: string;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceLineDto {
  produitId: string;
  quantite: number;
  prixUnitaire: number;
}

export interface CreateInvoiceDto {
  clientId: string;
  dateEmission: string;
  dateEcheance: string;
  lignes: CreateInvoiceLineDto[];
  notes?: string;
}

export interface QueryInvoiceDto {
  clientId?: string;
  dateDebut?: string;
  dateFin?: string;
}
