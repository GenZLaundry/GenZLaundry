import React, { useState, useEffect } from 'react';
import { printThermalBill, BillData } from './ThermalPrintManager';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  washType: 'WASH' | 'IRON' | 'WASH+IRON' | 'DRY CLEAN';
  category: 'CLOTHING' | 'HOUSEHOLD' | 'SPECIAL';
}

interface Customer {
  name: string;
  phone: string;
  address?: string;
}

const UltimatePOSInterface: React.FC = () => {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'pos' | 'items' | 'reports' | 'settings'>('pos');
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    price: '',
    category: 'CLOTHING' as OrderItem['category']
  });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [businessName, setBusinessName] = useState('MANOHAR');
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddItem, setQuickAddItem] = useState({ name: '', price: '' });
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [predefinedItems, setPredefinedItems] = useState([
    { id: '1', name: 'Shirt (Cotton)', price: 50, category: 'CLOTHING' as const },
    { id: '2', name: 'Shirt (Formal)', price: 60, category: 'CLOTHING' as const },
    { id: '3', name: 'T-Shirt', price: 30, category: 'CLOTHING' as const },
    { id: '4', name: 'Pant (Casual)', price: 70, category: 'CLOTHING' as const },
    { id: '5', name: 'Pant (Formal)', price: 80, category: 'CLOTHING' as const },
    { id: '6', name: 'Jeans', price: 90, category: 'CLOTHING' as const },
    { id: '7', name: 'Saree (Cotton)', price: 150, category: 'CLOTHING' as const },
    { id: '8', name: 'Saree (Silk)', price: 200, category: 'CLOTHING' as const },
    { id: '9', name: 'Kurta', price: 80, category: 'CLOTHING' as const },
    { id: '10', name: 'Suit (2 Piece)', price: 300, category: 'CLOTHING' as const },
    { id: '11', name: 'Bed Sheet (Single)', price: 80, category: 'HOUSEHOLD' as const },
    { id: '12', name: 'Bed Sheet (Double)', price: 120, category: 'HOUSEHOLD' as const },
    { id: '13', name: 'Pillow Cover', price: 25, category: 'HOUSEHOLD' as const },
    { id: '14', name: 'Curtain (Small)', price: 100, category: 'HOUSEHOLD' as const },
    { id: '15', name: 'Wedding Dress', price: 500, category: 'SPECIAL' as const },
    { id: '16', name: 'Leather Jacket', price: 400, category: 'SPECIAL' as const }
  ]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('todayOrders');
    const savedRevenue = localStorage.getItem('todayRevenue');
    const savedBusinessName = localStorage.getItem('businessName');
    const savedDeliveryCharge = localStorage.getItem('deliveryCharge');
    
    if (savedOrders) setTodayOrders(parseInt(savedOrders));
    if (savedRevenue) setTodayRevenue(parseFloat(savedRevenue));
    if (savedBusinessName) setBusinessName(savedBusinessName);
    if (savedDeliveryCharge) setDeliveryCharge(parseFloat(savedDeliveryCharge));
  }, []);  const filt
eredItems = predefinedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToOrder = (item: typeof predefinedItems[0], washType: OrderItem['washType']) => {
    const existingItem = orderItems.find(
      oi => oi.name === item.name && oi.washType === washType
    );

    if (existingItem) {
      setOrderItems(orderItems.map(oi => 
        oi.id === existingItem.id 
          ? { ...oi, quantity: oi.quantity + 1 }
          : oi
      ));
    } else {
      const newOrderItem: OrderItem = {
        id: `${item.id}-${washType}-${Date.now()}`,
        name: item.name,
        quantity: 1,
        price: item.price,
        washType,
        category: item.category
      };
      setOrderItems([...orderItems, newOrderItem]);
    }
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const updateItemPrice = (id: string, price: number) => {
    setOrderItems(orderItems.map(item => 
      item.id === id ? { ...item, price } : item
    ));
    setIsEditingItem(null);
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const addCustomItem = () => {
    if (!newItemForm.name || !newItemForm.price) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newItemForm.name,
      price: parseFloat(newItemForm.price),
      category: newI;, 0);
  }tem.quantity sum + item) =>uce((sum, ireds.orderItemurn  {
    ret = () =>CountTagalnst getTot
  coe;
  };
eryChargiv() + deleGSTalculatcount + cotal() - disteSubtlarn calcu {
    retu =>al = ()alculateTotconst c};

  ;
   100))tRate /) * (gs discountbtotal() -(calculateSuh.round(eturn Mat r {
   T = () =>ulateGS  const calc

0);
  };.quantity), e * itemicem.pr(itm + tem) => susum, ie((educItems.rrn order
    retu { =>otal = ()lateSubtst calcu
  con
  };
);y!`fullsuccessadded " name}"${newItem.alert(`✅ 
    false);kAdd(wQuicSho});
    setrice: ''  '', p name:AddItem({etQuick  sm]);
  , newIteinedItems...predefedItems([edefinsetPr;

       }
  const asCLOTHING'category: '    
  e),em.pricdItAdFloat(quickce: parseri
      pem.name,kAddItme: quic    na()}`,
  Date.now`quick-${d:       i {
ewItem =  const n;

  ) returnpriceAddItem. || !quickem.nameAddItick   if (!qu> {
 t = () =oLisemTkAddItict qu;

  consfalse);
  }emForm(etShowNewIt   s);
 ING' }OTHegory: 'CL', cat', price: ' name: 'm({emForewIt setN
   m]);, newIteedItemsfinrede[...pdItems(define  setPre;

  ry
    }.categotemForm