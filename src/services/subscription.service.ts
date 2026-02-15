import Api from './Api';
import type {
  SubscriptionPlan,
  Subscription,
  SubscriptionPayment,
  CreatePlanDto,
  UpdatePlanDto,
  SubscribeResponse,
} from '@/types/subscription';

class SubscriptionServiceClass {
  private base = '/subscriptions';

  // Plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await Api.get(`${this.base}/plans`);
    return res.data.data ?? res.data;
  }

  async getPlan(id: string): Promise<SubscriptionPlan> {
    const res = await Api.get(`${this.base}/plans/${id}`);
    return res.data.data ?? res.data;
  }

  async createPlan(data: CreatePlanDto): Promise<SubscriptionPlan> {
    const res = await Api.post(`${this.base}/plans`, data);
    return res.data.data ?? res.data;
  }

  async updatePlan(id: string, data: UpdatePlanDto): Promise<SubscriptionPlan> {
    const res = await Api.patch(`${this.base}/plans/${id}`, data);
    return res.data.data ?? res.data;
  }

  async deletePlan(id: string): Promise<void> {
    await Api.delete(`${this.base}/plans/${id}`);
  }

  // Subscriptions
  async subscribe(userId: string, planId: string): Promise<SubscribeResponse> {
    const res = await Api.post(`${this.base}/subscribe`, { userId, planId });
    return res.data.data ?? res.data;
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const res = await Api.get(`${this.base}/user/${userId}/active`);
      return res.data.data ?? res.data;
    } catch {
      return null;
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const res = await Api.get(`${this.base}/user/${userId}`);
    return res.data.data ?? res.data;
  }

  // Payments
  async getUserPayments(userId: string): Promise<SubscriptionPayment[]> {
    const res = await Api.get(`${this.base}/payments/user/${userId}`);
    return res.data.data ?? res.data;
  }

  async getPaymentByRef(ref: string): Promise<SubscriptionPayment> {
    const res = await Api.get(`${this.base}/payments/ref/${ref}`);
    return res.data.data ?? res.data;
  }
}

export const SubscriptionService = new SubscriptionServiceClass();
