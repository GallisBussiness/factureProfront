import type { AxiosInstance } from "axios";

export class Service {
  protected api: AxiosInstance;
  protected ressource: string;

  constructor(api: AxiosInstance, ressource: string) {
    this.api = api;
    this.ressource = ressource;
  }

  async create(data: any): Promise<any> {
    return this.api.post(`/${this.ressource}`, data).then((res: any) => res.data);
  }
  async getAll(): Promise<any[]> {
    return this.api.get(`/${this.ressource}`).then((res) => res.data);
  }

  async getOne(id: string): Promise<any> {
    return this.api.get(`/${this.ressource}/${id}`).then((res: any) => res.data);
  }
  async update(id: string, data: any): Promise<any> {
    return this.api.patch(`/${this.ressource}/${id}`, data).then((res: any) => res.data);
  }

  async delete(id: string): Promise<any> {
    return this.api.delete(`/${this.ressource}/${id}`).then((res: any) => res.data);
  }
}