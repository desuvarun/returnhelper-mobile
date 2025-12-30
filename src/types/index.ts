export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
}

export type ReturnStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DROPPED_OFF'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ReturnItem {
  id: string;
  retailer: string;
  productName: string;
  qrCodeUrl?: string;
  status: ReturnStatus;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  fragile: boolean;
}

export interface ReturnRequest {
  id: string;
  status: ReturnStatus;
  scheduledDate: string;
  timeWindow: string;
  items: ReturnItem[];
  address: Address;
  driverName?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Pickup {
  id: string;
  customerName: string;
  address: Address;
  scheduledDate: string;
  timeWindow: string;
  status: ReturnStatus;
  items: ReturnItem[];
  distance: string;
  estimatedEarnings: number;
}

export type Plan = 'BASIC' | 'STANDARD' | 'UNLIMITED';

export interface Subscription {
  plan: Plan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  returnsUsed: number;
  returnsLimit: number;
  currentPeriodEnd: string;
}
