export type SubscriptionDuration = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface SubscriptionPlan {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  devise: string;
  duree: SubscriptionDuration;
  fonctionnalites: string[];
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  _id: string;
  userId: string;
  planId: SubscriptionPlan;
  statut: SubscriptionStatus;
  dateDebut: string;
  dateFin: string;
  paytechToken: string;
  refCommand: string;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPayment {
  _id: string;
  subscriptionId: string;
  userId: string;
  montant: number;
  devise: string;
  statut: PaymentStatus;
  refCommand: string;
  paymentMethod: string;
  createdAt: string;
}

export interface CreatePlanDto {
  nom: string;
  description: string;
  prix: number;
  devise?: string;
  duree: SubscriptionDuration;
  fonctionnalites: string[];
  actif?: boolean;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export interface SubscribeDto {
  userId: string;
  planId: string;
}

export interface SubscribeResponse {
  subscription: Subscription;
  redirectUrl: string;
}
