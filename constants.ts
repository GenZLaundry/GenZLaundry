
import { LaundryItem } from './types';

export const DEFAULT_ITEMS: LaundryItem[] = [
  { id: '1', name: 'Shirt (White)', price: 80 },
  { id: '2', name: 'Shirt (Color)', price: 70 },
  { id: '3', name: 'Jeans', price: 120 },
  { id: '4', name: 'Saree', price: 250 },
  { id: '5', name: 'Bed Sheet', price: 150 },
  { id: '6', name: 'Suit (2-piece)', price: 450 },
  { id: '7', name: 'Kurta', price: 100 },
];

export const STORAGE_KEYS = {
  ORDER_COUNT: 'genz_order_count',
  SAVED_ITEMS: 'genz_saved_items',
  SHOP_CONFIG: 'genz_shop_config',
  ORDER_HISTORY: 'genz_order_history'
};
