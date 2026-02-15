import Api from './Api';
import { Service } from './Service';
import type { Client, CreateClientDto, UpdateClientDto, QueryClientDto } from '@/types/client';

class ClientServiceClass extends Service {
  constructor() {
    super(Api, 'clients');
  }

  async create(data: CreateClientDto): Promise<Client> {
    return this.api.post(`/${this.ressource}`, data).then((res) => res.data.data);
  }

  async getAll(query?: QueryClientDto): Promise<Client[]> {
    return this.api.get(`/${this.ressource}`, { params: query }).then((res) => res.data.data);
  }

  async getOne(id: string): Promise<Client> {
    return this.api.get(`/${this.ressource}/${id}`).then((res) => res.data.data);
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    return this.api.patch(`/${this.ressource}/${id}`, data).then((res) => res.data.data);
  }

  async delete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then((res) => res.data.data);
  }
}

export const ClientService = new ClientServiceClass();
