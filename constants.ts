// CONSTANTS FOR LAUNDRY POS SYSTEM
// TSC TL240 + SP POS891US Bill & Tag Printing Software

import { LaundryItem } from './types';

// Storage keys for localStorage
export const STORAGE_KEYS = {
  ORDER_COUNT: 'laundry_order_count',
  SAVED_ITEMS: 'laundry_saved_items',
  SHOP_CONFIG: 'laundry_shop_config',
  PRINTER_SETTINGS: 'laundry_printer_settings'
} as const;

// Default laundry items with competitive pricing
export const DEFAULT_ITEMS: LaundryItem[] = [
  // Shirts
  { id: 'shirt-cotton', name: 'Shirt (Cotton)', price: 50, category: 'Shirts' },
  { id: 'shirt-formal', name: 'Shirt (Formal)', price: 60, category: 'Shirts' },
  { id: 'tshirt', name: 'T-Shirt', price: 40, category: 'Shirts' },
  { id: 'polo-shirt', name: 'Polo Shirt', price: 45, category: 'Shirts' },
  
  // Pants
  { id: 'pant-casual', name: 'Pant (Casual)', price: 70, category: 'Pants' },
  { id: 'pant-formal', name: 'Pant (Formal)', price: 80, category: 'Pants' },
  { id: 'jeans', name: 'Jeans', price: 75, category: 'Pants' },
  { id: 'trousers', name: 'Trousers', price: 85, category: 'Pants' },
  
  // Traditional Wear
  { id: 'saree-cotton', name: 'Saree (Cotton)', price: 150, category: 'Traditional' },
  { id: 'saree-silk', name: 'Saree (Silk)', price: 200, category: 'Traditional' },
  { id: 'kurta-men', name: 'Kurta (Men)', price: 80, category: 'Traditional' },
  { id: 'kurta-women', name: 'Kurta (Women)', price: 85, category: 'Traditional' },
  { id: 'dupatta', name: 'Dupatta', price: 30, category: 'Traditional' },
  { id: 'lehenga', name: 'Lehenga', price: 300, category: 'Traditional' },
  
  // Dresses
  { id: 'dress-casual', name: 'Dress (Casual)', price: 90, category: 'Dresses' },
  { id: 'dress-party', name: 'Dress (Party)', price: 120, category: 'Dresses' },
  { id: 'gown', name: 'Gown', price: 180, category: 'Dresses' },
  
  // Outerwear
  { id: 'jacket', name: 'Jacket', price: 100, category: 'Outerwear' },
  { id: 'blazer', name: 'Blazer', price: 150, category: 'Outerwear' },
  { id: 'coat', name: 'Coat', price: 200, category: 'Outerwear' },
  { id: 'sweater', name: 'Sweater', price: 80, category: 'Outerwear' },
  
  // Home Textiles
  { id: 'bedsheet-single', name: 'Bedsheet (Single)', price: 80, category: 'Home' },
  { id: 'bedsheet-double', name: 'Bedsheet (Double)', price: 100, category: 'Home' },
  { id: 'pillow-cover', name: 'Pillow Cover', price: 20, category: 'Home' },
  { id: 'curtain', name: 'Curtain', price: 120, category: 'Home' },
  { id: 'tablecloth', name: 'Table Cloth', price: 60, category: 'Home' },
  
  // Undergarments
  { id: 'innerwear', name: 'Innerwear', price: 25, category: 'Undergarments' },
  { id: 'socks', name: 'Socks (Pair)', price: 15, category: 'Undergarments' },
  
  // Specialty Items
  { id: 'tie', name: 'Tie', price: 30, category: 'Accessories' },
  { id: 'scarf', name: 'Scarf', price: 40, category: 'Accessories' },
  { id: 'uniform', name: 'Uniform', price: 90, category: 'Specialty' },
  { id: 'wedding-dress', name: 'Wedding Dress', price: 500, category: 'Specialty' }
];

// Wash type options with pricing modifiers
export const WASH_TYPES = {
  'WASH': { name: 'Wash Only', modifier: 1.0 },
  'IRON': { name: 'Iron Only', modifier: 0.6 },
  'WASH+IRON': { name: 'Wash + Iron', modifier: 1.2 },
  'DRY CLEAN': { name: 'Dry Clean', modifier: 1.5 }
} as const;

// Business configuration defaults
export const DEFAULT_SHOP_CONFIG = {
  shopName: 'GenZ Laundry',
  address: '123 Laundry Street, Delhi - 110001',
  contact: '+91 98765 43210',
  gstNumber: ''
};

// Printer configuration constants
export const PRINTER_CONSTANTS = {
  // TSC TL240 settings
  TSC: {
    VENDOR_ID: 0x1203,
    BAUD_RATE: 9600,
    LABEL_WIDTH: 50,  // mm
    LABEL_HEIGHT: 30, // mm
    DPI: 203,
    DENSITY: 10,
    SPEED: 4
  },
  
  // SP POS891US settings
  THERMAL: {
    VENDOR_ID: 0x0416,
    BAUD_RATE: 9600,
    PAPER_WIDTH: 80,  // mm
    MAX_CHARS: 42,    // characters per line
    CUT_TYPE: 'partial'
  }
};

// ESC/POS command constants
export const ESC_POS = {
  INIT: '\x1B\x40',
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  CENTER: '\x1B\x61\x01',
  LEFT: '\x1B\x61\x00',
  RIGHT: '\x1B\x61\x02',
  CUT: '\x1B\x69',
  FEED: '\x0A'
} as const;

// TSPL command constants for TSC TL240
export const TSPL = {
  SIZE: (w: number, h: number) => `SIZE ${w} mm, ${h} mm\r\n`,
  SPEED: (s: number) => `SPEED ${s}\r\n`,
  DENSITY: (d: number) => `DENSITY ${d}\r\n`,
  CLEAR: 'CLS\r\n',
  PRINT: 'PRINT 1,1\r\n'
} as const;

// Application settings
export const APP_SETTINGS = {
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  MAX_RECENT_CUSTOMERS: 50,
  DEFAULT_DISCOUNT_TYPE: 'fixed' as const,
  CURRENCY_SYMBOL: '₹',
  DATE_FORMAT: 'DD MMM YYYY',
  TIME_FORMAT: 'HH:mm'
};

export default {
  STORAGE_KEYS,
  DEFAULT_ITEMS,
  WASH_TYPES,
  DEFAULT_SHOP_CONFIG,
  PRINTER_CONSTANTS,
  ESC_POS,
  TSPL,
  APP_SETTINGS
};