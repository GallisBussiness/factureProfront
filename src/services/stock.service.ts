import Api from './Api';
import { Service } from './Service';
import type {
  StockMovement,
  CreateStockMovementDto,
  QueryStockMovementDto,
} from '@/types/stock';

class StockServiceClass extends Service {
  constructor() {
    super(Api, 'stocks');
  }

  async createMovement(data: CreateStockMovementDto): Promise<StockMovement> {
    return this.api.post(`/${this.ressource}/movements`, data).then((res) => res.data.data);
  }

  async getAll(query?: QueryStockMovementDto): Promise<StockMovement[]> {
    return this.api.get(`/${this.ressource}/movements`, { params: query }).then((res) => res.data.data);
  }

  async getByProduct(produitId: string): Promise<StockMovement[]> {
    return this.api.get(`/${this.ressource}/movements/product/${produitId}`).then((res) => res.data.data);
  }
}

export const StockService = new StockServiceClass();
