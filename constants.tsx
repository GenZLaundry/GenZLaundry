
import { ServiceItem } from './types';

export const SERVICES: ServiceItem[] = [
  { id: '1', name: 'Shirt (Wash & Iron)', price: 40 },
  { id: '2', name: 'Trouser (Wash & Iron)', price: 50 },
  { id: '3', name: 'Saree Dry Cleaning', price: 250 },
  { id: '4', name: 'Suit Dry Cleaning', price: 450 },
  { id: '5', name: 'Bedsheet Double', price: 120 },
  { id: '6', name: 'T-Shirt (Iron Only)', price: 15 },
  { id: '7', name: 'Blanket Heavy', price: 350 },
];

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-rose-100 text-rose-700 border-rose-200',
  washing: 'bg-amber-100 text-amber-700 border-amber-200',
  ready: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export const BUSINESS_CONFIG = {
  name: 'GenZLaundry Pro',
  tagline: 'Premium Fabric Care & Management',
  address: 'Commercial Hub, Suite 402, Bengaluru',
  phone: '+91 80 4567 8900',
  email: 'ops@GenZLaundry.com'
};
