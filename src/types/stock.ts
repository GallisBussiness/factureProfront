export enum MovementType {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
}

export interface StockMovement {
  _id: string;
  produitId: any;
  produit?: {
    _id: string;
    nom: string;
    quantiteStock?: number;
  };
  type: MovementType;
  quantite: number;
  motif?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStockMovementDto {
  produitId: string;
  type: MovementType;
  quantite: number;
  motif?: string;
}

export interface QueryStockMovementDto {
  produitId?: string;
  type?: MovementType;
  dateDebut?: string;
  dateFin?: string;
}
