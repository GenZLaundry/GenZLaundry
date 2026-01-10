
export interface LaundryItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'fixed' | 'percent';
  total: number;
  timestamp: string;
}

export interface ShopConfig {
  shopName: string;
  address: string;
  contact: string;
}
