import type { Unite } from "./unite";

export interface Product {
  _id: string;
  nom: string;
  description?: string;
  prix: number;
  unite: Unite;
  quantiteStock?: number;
  seuilAlerte?: number;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  nom: string;
  description?: string;
  prix: number;
  unite: string;
  quantiteStock?: number;
  seuilAlerte?: number;
  actif?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface QueryProductDto {
  nom?: string;
  actif?: boolean;
}
