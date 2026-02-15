import Api from './Api';
import { Service } from './Service';
import type { Unite, CreateUniteDto, UpdateUniteDto } from '@/types/unite';

class UniteServiceClass extends Service {
  constructor() {
    super(Api, 'unite');
  }

  async create(data: CreateUniteDto): Promise<Unite> {
    return this.api.post(`/${this.ressource}`, data).then((res) => res.data.data ?? res.data);
  }

  async getAll(): Promise<Unite[]> {
    return this.api.get(`/${this.ressource}`).then((res) => res.data.data ?? res.data);
  }

  async getOne(id: string): Promise<Unite> {
    return this.api.get(`/${this.ressource}/${id}`).then((res) => res.data.data ?? res.data);
  }

  async update(id: string, data: UpdateUniteDto): Promise<Unite> {
    return this.api.patch(`/${this.ressource}/${id}`, data).then((res) => res.data.data ?? res.data);
  }

  async delete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then((res) => res.data.data ?? res.data);
  }
}

export const UniteService = new UniteServiceClass();
