export interface Unite {
  _id: string;
  nom: string;
  description?: string;
  nombre: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUniteDto {
  nom: string;
  description?: string;
  nombre: number;
}

export type UpdateUniteDto = Partial<CreateUniteDto>;
