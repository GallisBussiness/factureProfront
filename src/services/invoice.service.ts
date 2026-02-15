import Api from './Api';
import { Service } from './Service';
import type {
  Invoice,
  CreateInvoiceDto,
  QueryInvoiceDto,
} from '@/types/invoice';

class InvoiceServiceClass extends Service {
  constructor() {
    super(Api, 'invoices');
  }

  async create(data: CreateInvoiceDto): Promise<Invoice> {
    return this.api.post(`/${this.ressource}`, data).then((res) => res.data.data);
  }

  async getAll(query?: QueryInvoiceDto): Promise<Invoice[]> {
    return this.api.get(`/${this.ressource}`, { params: query }).then((res) => res.data.data);
  }

  async getOne(id: string): Promise<Invoice> {
    return this.api.get(`/${this.ressource}/${id}`).then((res) => res.data.data ?? res.data);
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    return this.api.get(`/${this.ressource}/client/${clientId}`).then((res) => res.data.data);
  }

  async delete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then((res) => res.data.data);
  }
}

export const InvoiceService = new InvoiceServiceClass();
