
export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER'
}

export enum OrderStatus {
  PENDING = 'pending',
  WASHING = 'washing',
  READY = 'ready',
  DELIVERED = 'delivered'
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  password?: string;
  fullName: string;
  address: string;
  role: UserRole;
  createdAt?: string;
}

export interface Order {
  id: string;
  tokenNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  isTemporary: boolean;
  status: OrderStatus;
  items: OrderItem[];
  deliveryCharge?: number;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
}
