import Api from './Api';
import { Service } from './Service';
import type { Product, CreateProductDto, UpdateProductDto, QueryProductDto } from '@/types/product';

class ProductServiceClass extends Service {
  constructor() {
    super(Api, 'products');
  }

  async create(data: CreateProductDto): Promise<Product> {
    return this.api.post(`/${this.ressource}`, data).then((res) => res.data.data);
  }

  async getAll(query?: QueryProductDto): Promise<Product[]> {
    return this.api.get(`/${this.ressource}`, { params: query }).then((res) => res.data.data);
  }

  async getOne(id: string): Promise<Product> {
    return this.api.get(`/${this.ressource}/${id}`).then((res) => res.data.data);
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    return this.api.patch(`/${this.ressource}/${id}`, data).then((res) => res.data.data);
  }

  async delete(id: string): Promise<void> {
    return this.api.delete(`/${this.ressource}/${id}`).then((res) => res.data.data);
  }

  async getStockAlerts(): Promise<Product[]> {
    return this.api.get(`/${this.ressource}/alerts`).then((res) => res.data.data);
  }
}

export const ProductService = new ProductServiceClass();
