export interface Client {
  _id: string;
  nom: string;
  telephone?: string;
  adresse?: string;
  actif?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClientDto {
  nom: string;
  telephone?: string;
  adresse?: string;
  actif?: boolean;
}

export type UpdateClientDto = Partial<CreateClientDto>;

export interface QueryClientDto {
  nom?: string;
  actif?: boolean;
}
