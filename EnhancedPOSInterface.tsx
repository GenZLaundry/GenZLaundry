import React, { useState, useEffect } from 'react';
import { printThermalBill, BillData } from './ThermalPrintManager';
import { directThermalPrinter } from './DirectThermalIntegration';

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
  email?: string;
}

interface LaundryTag {
  businessName: string;
  billNumber: string;
  customerName: string;
  itemName: string;
  washType: string;
  tagIndex: number;
  totalTags: number;
  date: string;
}

interface EnhancedPOSInterfaceProps {
  onLogout?: () => void;
}

const EnhancedPOSInterface: React.FC<EnhancedPOSInterfaceProps> = ({ onLogout }) => {
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
  const [gstRate, setGstRate] = useState(0); // Default GST 0%
  const [deliveryCharge, setDeliveryCharge] = useState(0); // Add delivery charge
  const [businessName, setBusinessName] = useState('GenZ');
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [searchTerm, setSearchTerm] = useState(''); // Add search functionality
  const [quickAddItem, setQuickAddItem] = useState({ name: '', price: '' }); // Quick add
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  // Confirmation modal states
  const [showClearOrderConfirm, setShowClearOrderConfirm] = useState(false);
  const [showResetStatsConfirm, setShowResetStatsConfirm] = useState(false);
  const [showResetAllDataConfirm, setShowResetAllDataConfirm] = useState(false);
  
  // Item editing states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState('');

  // Enhanced predefined items with more categories
  const [predefinedItems, setPredefinedItems] = useState([
    // Men's Clothing
    { id: '1', name: 'Shirt', price: 50, category: 'CLOTHING' as const },
    { id: '2', name: 'Pant', price: 50, category: 'CLOTHING' as const },
    { id: '3', name: 'Shirt (Cotton)', price: 50, category: 'CLOTHING' as const },
    { id: '4', name: 'Shirt (Formal)', price: 60, category: 'CLOTHING' as const },
    { id: '5', name: 'T-Shirt', price: 30, category: 'CLOTHING' as const },
    { id: '6', name: 'Pant (Casual)', price: 70, category: 'CLOTHING' as const },
    { id: '7', name: 'Pant (Formal)', price: 80, category: 'CLOTHING' as const },
    { id: '8', name: 'Jeans', price: 90, category: 'CLOTHING' as const },
    { id: '9', name: 'Suit (2 Piece)', price: 300, category: 'CLOTHING' as const },
    { id: '10', name: 'Blazer', price: 200, category: 'CLOTHING' as const },
    { id: '11', name: 'Kurta', price: 80, category: 'CLOTHING' as const },
    { id: '12', name: 'Dhoti', price: 40, category: 'CLOTHING' as const },
    
    // Women's Clothing
    { id: '11', name: 'Saree (Cotton)', price: 150, category: 'CLOTHING' as const },
    { id: '12', name: 'Saree (Silk)', price: 200, category: 'CLOTHING' as const },
    { id: '13', name: 'Dress', price: 120, category: 'CLOTHING' as const },
    { id: '14', name: 'Blouse', price: 60, category: 'CLOTHING' as const },
    { id: '15', name: 'Lehenga', price: 400, category: 'CLOTHING' as const },
    { id: '16', name: 'Salwar Suit', price: 180, category: 'CLOTHING' as const },
    
    // Household Items
    { id: '17', name: 'Bed Sheet (Single)', price: 80, category: 'HOUSEHOLD' as const },
    { id: '18', name: 'Bed Sheet (Double)', price: 120, category: 'HOUSEHOLD' as const },
    { id: '19', name: 'Pillow Cover', price: 25, category: 'HOUSEHOLD' as const },
    { id: '20', name: 'Curtain (Small)', price: 100, category: 'HOUSEHOLD' as const },
    { id: '21', name: 'Curtain (Large)', price: 180, category: 'HOUSEHOLD' as const },
    { id: '22', name: 'Table Cloth', price: 60, category: 'HOUSEHOLD' as const },
    { id: '23', name: 'Towel (Bath)', price: 40, category: 'HOUSEHOLD' as const },
    { id: '24', name: 'Towel (Face)', price: 20, category: 'HOUSEHOLD' as const },
    
    // Special Items
    { id: '25', name: 'Wedding Dress', price: 500, category: 'SPECIAL' as const },
    { id: '26', name: 'Leather Jacket', price: 400, category: 'SPECIAL' as const },
    { id: '27', name: 'Carpet (Small)', price: 300, category: 'SPECIAL' as const },
    { id: '28', name: 'Blanket (Heavy)', price: 200, category: 'SPECIAL' as const },
    { id: '29', name: 'Sofa Cover', price: 250, category: 'SPECIAL' as const },
    { id: '30', name: 'Car Seat Cover', price: 150, category: 'SPECIAL' as const }
  ]);

  useEffect(() => {
    // Load saved data from localStorage
    const savedOrders = localStorage.getItem('todayOrders');
    const savedRevenue = localStorage.getItem('todayRevenue');
    const savedBusinessName = localStorage.getItem('businessName');
    const savedDeliveryCharge = localStorage.getItem('deliveryCharge');
    
    if (savedOrders) setTodayOrders(parseInt(savedOrders));
    if (savedRevenue) setTodayRevenue(parseFloat(savedRevenue));
    if (savedBusinessName) setBusinessName(savedBusinessName);
    if (savedDeliveryCharge) setDeliveryCharge(parseFloat(savedDeliveryCharge));
  }, []);

  // Filter items based on search term
  const filteredItems = predefinedItems.filter(item =>
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
      category: newItemForm.category
    };

    setPredefinedItems([...predefinedItems, newItem]);
    setNewItemForm({ name: '', price: '', category: 'CLOTHING' });
    setShowNewItemForm(false);
  };

  // Quick add item function for instant addition
  const quickAddItemToList = () => {
    if (!quickAddItem.name || !quickAddItem.price) return;

    const newItem = {
      id: `quick-${Date.now()}`,
      name: quickAddItem.name,
      price: parseFloat(quickAddItem.price),
      category: 'CLOTHING' as const
    };

    setPredefinedItems([...predefinedItems, newItem]);
    setQuickAddItem({ name: '', price: '' });
    setShowQuickAdd(false);
    alert(`✅ "${newItem.name}" added successfully!`);
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateGST = () => {
    return Math.round((calculateSubtotal() - discount) * (gstRate / 100));
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + calculateGST() + deliveryCharge;
  };

  const getTotalTagCount = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Generate clothing tags - one tag per item quantity (correct counting)
  const generateClothingTags = (): LaundryTag[] => {
    const billNumber = `${businessName.substring(0,2).toUpperCase()}${Date.now().toString().slice(-3)}`;
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });

    const tags: LaundryTag[] = [];
    let tagCounter = 1;
    const totalTagCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    orderItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        tags.push({
          businessName: businessName,
          billNumber,
          customerName: customer.name,
          itemName: item.name.toUpperCase(),
          washType: item.washType,
          tagIndex: tagCounter,
          totalTags: totalTagCount,
          date: currentDate
        });
        tagCounter++;
      }
    });

    return tags;
  };

  // Print clothing tags with the exact format from your image
  const printClothingTags = () => {
    if (!customer.name) {
      alert('Please enter customer name first');
      return;
    }

    const tags = generateClothingTags();
    
    // Create print window with exact tag format
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for tag printing');
      return;
    }

    const tagHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>TSC TL240 Clothing Tags - ${businessName}</title>
  <style>
    @page {
      size: 4.25in auto; /* TSC TL240 max width: 4.25 inches (108mm) */
      margin: 0;
    }
    
    @media print {
      body { margin: 0; padding: 0; }
      .tag { page-break-after: always; }
      .tag:last-child { page-break-after: avoid; }
    }
    
    body {
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 5mm;
      background: #f0f0f0;
      width: 4.25in; /* TSC TL240 max width */
    }
    
    /* 1×n matrix layout - tags in single column for TSC TL240 */
    .tag {
      width: 50mm;
      height: 30mm;
      border: 2px solid #000;
      margin: 3mm auto; /* Center align, vertical spacing only */
      padding: 2mm;
      background: white;
      display: block; /* Block display for 1×n matrix */
      position: relative;
      box-sizing: border-box;
      page-break-inside: avoid;
    }
    
    .tag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8px;
      font-weight: bold;
      margin-bottom: 1mm;
      border-bottom: 1px solid #000;
      padding-bottom: 1mm;
    }
    
    .business-name {
      font-size: 9px;
      font-weight: bold;
    }
    
    .date {
      font-size: 7px;
    }
    
    .item-section {
      text-align: center;
      margin: 2mm 0;
    }
    
    .item-name {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 1mm;
    }
    
    .bill-number {
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 1px;
    }
    
    .bottom-section {
      position: absolute;
      bottom: 2mm;
      left: 2mm;
      right: 2mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7px;
      border-top: 1px solid #000;
      padding-top: 1mm;
    }
    
    .customer-info {
      font-size: 6px;
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .tag-counter {
      background: #000;
      color: white;
      padding: 1px 3px;
      font-size: 8px;
      font-weight: bold;
    }
    
    .wash-type {
      font-size: 6px;
      font-weight: bold;
      margin-top: 1mm;
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 5mm; font-weight: bold; font-size: 12px;">
    TSC TL240 Label Print - ${tags.length} Tags (1×n Matrix)
  </div>
  
  ${tags.map(tag => `
    <div class="tag">
      <div class="tag-header">
        <span class="business-name">${tag.businessName}</span>
        <span class="date">${tag.date}</span>
      </div>
      
      <div class="item-section">
        <div class="item-name">${tag.itemName}</div>
        <div class="bill-number">${tag.billNumber}</div>
        <div class="wash-type">${tag.washType}</div>
      </div>
      
      <div class="bottom-section">
        <span class="customer-info">Customer: ${tag.customerName.substring(0, 12)}</span>
        <span class="tag-counter">${tag.tagIndex}/${tag.totalTags}</span>
      </div>
    </div>
  `).join('')}
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() {
          window.close();
        }, 1000);
      }, 500);
    }
  </script>
</body>
</html>
    `;

    printWindow.document.write(tagHTML);
    printWindow.document.close();
  };

  const printBill = async () => {
    if (!customer.name) {
      alert('Please enter customer name');
      return;
    }

    // First try direct thermal printing
    const receiptData = {
      businessName: businessName,
      address: 'Sabji Mandi Circle, Ratanada Jodhpur-342022',
      phone: '+91 9256930727',
      customerName: customer.name,
      billNumber: `${businessName.substring(0,2).toUpperCase()}${Date.now().toString().slice(-6)}`,
      items: orderItems.map(item => ({
        name: `${item.name} (${item.washType})`,
        quantity: item.quantity,
        rate: item.price, // FIX: Added rate field to prevent "undefined" in bills
        amount: item.price * item.quantity
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      deliveryCharge: deliveryCharge,
      grandTotal: calculateTotal()
    };

    try {
      // Try direct thermal printing first
      const result = await directThermalPrinter.printReceipt(receiptData);
      
      if (result.success) {
        alert('✅ Bill printed successfully on thermal printer!');
        
        // Update daily stats
        const newOrderCount = todayOrders + 1;
        const newRevenue = todayRevenue + calculateTotal();
        setTodayOrders(newOrderCount);
        setTodayRevenue(newRevenue);
        localStorage.setItem('todayOrders', newOrderCount.toString());
        localStorage.setItem('todayRevenue', newRevenue.toString());
        
        return;
      } else {
        console.log('Direct thermal printing failed:', result.message);
        // Fall back to browser printing
        throw new Error(result.message);
      }
    } catch (error) {
      console.log('Falling back to browser printing:', error.message);
      
      // Fallback to browser print dialog
      const billData: BillData = {
        businessName: businessName,
        address: 'Sabji Mandi Circle, Ratanada Jodhpur-342022',
        phone: '+91 9256930727',
        billNumber: receiptData.billNumber,
        customerName: customer.name,
        items: receiptData.items,
        subtotal: receiptData.subtotal,
        discount: discount,
        gst: calculateGST(),
        grandTotal: receiptData.grandTotal,
        thankYouMessage: `Thank you for choosing ${businessName}!`
      };

      // Add delivery charge as separate line item if applicable
      if (deliveryCharge > 0) {
        billData.items.push({
          name: 'Delivery Charge',
          quantity: 1,
          rate: deliveryCharge,
          amount: deliveryCharge
        });
      }

      printThermalBill(billData);
      
      // Update daily stats
      const newOrderCount = todayOrders + 1;
      const newRevenue = todayRevenue + calculateTotal();
      setTodayOrders(newOrderCount);
      setTodayRevenue(newRevenue);
      localStorage.setItem('todayOrders', newOrderCount.toString());
      localStorage.setItem('todayRevenue', newRevenue.toString());
    }
  };

  const clearOrder = () => {
    setShowClearOrderConfirm(true);
  };

  const confirmClearOrder = () => {
    setOrderItems([]);
    setCustomer({ name: '', phone: '' });
    setDiscount(0);
    setShowClearOrderConfirm(false);
  };

  const resetDailyStats = () => {
    setShowResetStatsConfirm(true);
  };

  const confirmResetStats = () => {
    setTodayOrders(0);
    setTodayRevenue(0);
    localStorage.removeItem('todayOrders');
    localStorage.removeItem('todayRevenue');
    setShowResetStatsConfirm(false);
  };

  const resetAllData = () => {
    setShowResetAllDataConfirm(true);
  };

  const confirmResetAllData = () => {
    localStorage.clear();
    setShowResetAllDataConfirm(false);
    window.location.reload();
  };

  const startEditingPrice = (itemId: string, currentPrice: number) => {
    setEditingItemId(itemId);
    setEditingPrice(currentPrice.toString());
  };

  const saveEditedPrice = (itemId: string) => {
    const newPrice = parseFloat(editingPrice);
    if (!isNaN(newPrice) && newPrice > 0) {
      setPredefinedItems(predefinedItems.map(i => 
        i.id === itemId ? { ...i, price: newPrice } : i
      ));
    }
    setEditingItemId(null);
    setEditingPrice('');
  };

  const cancelEditingPrice = () => {
    setEditingItemId(null);
    setEditingPrice('');
  };

  const getWashTypeColor = (washType: OrderItem['washType']) => {
    switch (washType) {
      case 'WASH': return '#007bff';
      case 'IRON': return '#28a745';
      case 'WASH+IRON': return '#ffc107';
      case 'DRY CLEAN': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryItems = (category: OrderItem['category']) => {
    return filteredItems.filter(item => item.category === category);
  };

  const getCategoryIcon = (category: OrderItem['category']) => {
    switch (category) {
      case 'CLOTHING': return '👕';
      case 'HOUSEHOLD': return '🏠';
      case 'SPECIAL': return '⭐';
      default: return '📦';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1600px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          padding: '25px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              ✨ {businessName} Laundry POS
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
              Professional Point of Sale System
            </p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '10px 18px',
              borderRadius: '20px',
              fontSize: '14px'
            }}>
              📅 {new Date().toLocaleDateString('en-IN')}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  padding: '12px 20px',
                  background: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🔓 Logout
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: '#f8f9fa',
          borderBottom: '3px solid #e9ecef'
        }}>
          {[
            { key: 'pos', label: 'Point of Sale', icon: '🛒' },
            { key: 'items', label: 'Item Management', icon: '📦' },
            { key: 'reports', label: 'Reports & Analytics', icon: '📊' },
            { key: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key as any)}
              style={{
                padding: '18px 30px',
                border: 'none',
                background: currentTab === tab.key ? 'white' : 'transparent',
                color: currentTab === tab.key ? '#2c3e50' : '#6c757d',
                fontWeight: currentTab === tab.key ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: currentTab === tab.key ? '4px solid #667eea' : 'none',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ marginRight: '8px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* POS Tab */}
        {currentTab === 'pos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', minHeight: '700px' }}>
            {/* Left Panel - Items */}
            <div style={{ padding: '40px', background: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ color: '#2c3e50', fontSize: '24px', margin: 0 }}>📦 Select Items</h3>
                <button
                  onClick={() => setShowQuickAdd(true)}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  ⚡ Quick Add Item
                </button>
              </div>

              {/* Quick Add Item Modal */}
              {showQuickAdd && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    width: '400px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}>
                    <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>⚡ Quick Add Item</h4>
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={quickAddItem.name}
                      onChange={(e) => setQuickAddItem({ ...quickAddItem, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={quickAddItem.price}
                      onChange={(e) => setQuickAddItem({ ...quickAddItem, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '14px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={quickAddItemToList}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Add Item
                      </button>
                      <button
                        onClick={() => setShowQuickAdd(false)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Customer Info */}
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                border: '2px solid #e9ecef'
              }}>
                <h4 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '18px' }}>👤 Customer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    style={{
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    style={{
                      padding: '15px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Payment Method:</span>
                    {(['CASH', 'CARD', 'UPI'] as const).map(method => (
                      <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                        />
                        <span style={{ fontWeight: paymentMethod === method ? 'bold' : 'normal' }}>{method}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>Delivery Charge:</span>
                    <input
                      type="number"
                      placeholder="₹0"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100px',
                        padding: '8px',
                        border: '2px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '25px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                border: '2px solid #e9ecef'
              }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search items by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px 20px',
                      border: '2px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      paddingLeft: '50px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                  <span style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: '#6c757d'
                  }}>🔍</span>
                </div>
                {searchTerm && (
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#6c757d' }}>
                    Found {filteredItems.length} items matching "{searchTerm}"
                  </div>
                )}
              </div>

              {/* Enhanced Items by Category */}
              {(['CLOTHING', 'HOUSEHOLD', 'SPECIAL'] as const).map(category => (
                <div key={category} style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '15px',
                  marginBottom: '25px',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                  border: '2px solid #e9ecef'
                }}>
                  <h4 style={{ 
                    marginBottom: '20px', 
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '18px'
                  }}>
                    <span style={{ fontSize: '24px' }}>{getCategoryIcon(category)}</span>
                    {category} ITEMS ({getCategoryItems(category).length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {getCategoryItems(category).map(item => (
                      <div key={item.id} style={{
                        border: '2px solid #e9ecef',
                        borderRadius: '12px',
                        padding: '20px',
                        background: '#f8f9fa',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '15px'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '16px' }}>{item.name}</span>
                          <span style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white', 
                            padding: '6px 12px', 
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            ₹{item.price}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {(['WASH', 'IRON', 'WASH+IRON', 'DRY CLEAN'] as const).map(washType => (
                            <button
                              key={washType}
                              onClick={() => addItemToOrder(item, washType)}
                              style={{
                                padding: '10px 15px',
                                background: getWashTypeColor(washType),
                                color: washType === 'WASH+IRON' ? 'black' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              {washType}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Right Panel - Order Summary */}
            <div style={{ 
              padding: '40px', 
              background: 'white',
              borderLeft: '3px solid #e9ecef'
            }}>
              <h3 style={{ marginBottom: '25px', color: '#2c3e50', fontSize: '24px' }}>🧾 Order Summary</h3>
              
              <div style={{ 
                maxHeight: '450px', 
                overflowY: 'auto',
                marginBottom: '25px',
                border: '2px solid #e9ecef',
                borderRadius: '15px',
                padding: '20px',
                background: '#f8f9fa'
              }}>
                {orderItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#6c757d', 
                    padding: '60px 0',
                    fontStyle: 'italic',
                    fontSize: '16px'
                  }}>
                    No items added yet
                  </div>
                ) : (
                  orderItems.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '15px',
                      borderBottom: '2px solid #e9ecef',
                      marginBottom: '10px',
                      background: 'white',
                      borderRadius: '10px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{item.name}</div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: getWashTypeColor(item.washType),
                          fontWeight: 'bold',
                          background: `${getWashTypeColor(item.washType)}20`,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          display: 'inline-block'
                        }}>
                          {item.washType}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: 'none',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '30px',
                            height: '30px',
                            border: 'none',
                            background: '#28a745',
                            color: 'white',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          +
                        </button>
                        <div style={{ minWidth: '80px', textAlign: 'right' }}>
                          {isEditingItem === item.id ? (
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              onBlur={() => setIsEditingItem(null)}
                              onKeyPress={(e) => e.key === 'Enter' && setIsEditingItem(null)}
                              style={{
                                width: '60px',
                                padding: '5px',
                                border: '2px solid #667eea',
                                borderRadius: '5px',
                                fontSize: '14px'
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setIsEditingItem(item.id)}
                              style={{ 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: '#667eea',
                                fontSize: '16px'
                              }}
                            >
                              ₹{item.price * item.quantity}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            width: '25px',
                            height: '25px',
                            border: 'none',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enhanced Totals */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                padding: '20px', 
                borderRadius: '15px',
                marginBottom: '25px',
                border: '2px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 'bold' }}>₹{calculateSubtotal()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span>Discount:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100px',
                      padding: '8px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      textAlign: 'right',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '16px' }}>
                  <span>Delivery Charge:</span>
                  <span style={{ fontWeight: 'bold' }}>₹{deliveryCharge}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '16px' }}>
                  <span>GST ({gstRate}%):</span>
                  <span style={{ fontWeight: 'bold' }}>₹{calculateGST()}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold',
                  fontSize: '22px',
                  borderTop: '3px solid #667eea',
                  paddingTop: '15px',
                  color: '#2c3e50'
                }}>
                  <span>TOTAL:</span>
                  <span style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '8px 15px',
                    borderRadius: '10px'
                  }}>₹{calculateTotal()}</span>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button
                  onClick={printBill}
                  disabled={orderItems.length === 0 || !customer.name}
                  style={{
                    padding: '18px',
                    background: orderItems.length === 0 || !customer.name ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: orderItems.length === 0 || !customer.name ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🖨️ Print Bill & Complete Order
                </button>

                <button
                  onClick={printClothingTags}
                  disabled={orderItems.length === 0 || !customer.name}
                  style={{
                    padding: '18px',
                    background: orderItems.length === 0 || !customer.name ? '#6c757d' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: orderItems.length === 0 || !customer.name ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🏷️ Print Clothing Tags ({getTotalTagCount()} tags)
                </button>

                <button
                  onClick={clearOrder}
                  style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  🗑️ Clear Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Management Tab */}
        {currentTab === 'items' && (
          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ color: '#2c3e50', fontSize: '24px' }}>📦 Item Management</h3>
              <button
                onClick={() => setShowNewItemForm(true)}
                style={{
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                ➕ Add New Item
              </button>
            </div>

            {/* Add New Item Form */}
            {showNewItemForm && (
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '30px',
                border: '3px solid #667eea'
              }}>
                <h4 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '18px' }}>Add New Item</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Item Name</label>
                    <input
                      type="text"
                      value={newItemForm.name}
                      onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Price (₹)</label>
                    <input
                      type="number"
                      value={newItemForm.price}
                      onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Category</label>
                    <select
                      value={newItemForm.category}
                      onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value as OrderItem['category'] })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="CLOTHING">Clothing</option>
                      <option value="HOUSEHOLD">Household</option>
                      <option value="SPECIAL">Special</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={addCustomItem}
                      style={{
                        padding: '12px 18px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✅ Add
                    </button>
                    <button
                      onClick={() => setShowNewItemForm(false)}
                      style={{
                        padding: '12px 18px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
              {predefinedItems.map(item => (
                <div key={item.id} style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '15px',
                  border: '2px solid #e9ecef',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>{item.name}</h4>
                    <span style={{
                      background: item.category === 'CLOTHING' ? '#007bff' : 
                                 item.category === 'HOUSEHOLD' ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {getCategoryIcon(item.category)} {item.category}
                    </span>
                  </div>
                  
                  {/* Price Display/Edit Section */}
                  {editingItemId === item.id ? (
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2c3e50' }}>
                        Edit Price (₹)
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            border: '2px solid #667eea',
                            borderRadius: '8px',
                            fontSize: '16px',
                            outline: 'none'
                          }}
                          placeholder="Enter new price"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              saveEditedPrice(item.id);
                            } else if (e.key === 'Escape') {
                              cancelEditingPrice();
                            }
                          }}
                        />
                        <button
                          onClick={() => saveEditedPrice(item.id)}
                          style={{
                            padding: '12px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✅
                        </button>
                        <button
                          onClick={cancelEditingPrice}
                          style={{
                            padding: '12px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ❌
                        </button>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '5px' }}>
                        Press Enter to save, Escape to cancel
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      color: '#667eea',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>₹{item.price}</span>
                      <button
                        onClick={() => startEditingPrice(item.id, item.price)}
                        style={{
                          padding: '8px 12px',
                          background: 'transparent',
                          color: '#667eea',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#667eea';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#667eea';
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  )}
                  
                  {/* Action Button - Only show when not editing */}
                  {editingItemId !== item.id && (
                    <button
                      onClick={() => startEditingPrice(item.id, item.price)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      ✏️ Edit Price
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {currentTab === 'reports' && (
          <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>📊 Reports & Analytics</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '40px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Today's Orders</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{todayOrders}</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Today's Revenue</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₹{todayRevenue}</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h4 style={{ fontSize: '18px', marginBottom: '10px' }}>Average Order</h4>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                  ₹{todayOrders > 0 ? Math.round(todayRevenue / todayOrders) : 0}
                </div>
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>Quick Actions</h4>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={resetDailyStats}
                  style={{
                    padding: '12px 20px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Reset Daily Stats
                </button>
                <button
                  onClick={() => {
                    const data = {
                      date: new Date().toLocaleDateString(),
                      orders: todayOrders,
                      revenue: todayRevenue,
                      items: predefinedItems.length
                    };
                    console.log('Daily Report:', data);
                    alert(`Daily Report Generated!\nOrders: ${todayOrders}\nRevenue: ₹${todayRevenue}`);
                  }}
                  style={{
                    padding: '12px 20px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📄 Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === 'settings' && (
          <div style={{ padding: '40px' }}>
            <h3 style={{ marginBottom: '30px', color: '#2c3e50', fontSize: '24px' }}>⚙️ Settings</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              {/* Business Settings */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '25px', color: '#2c3e50', fontSize: '18px' }}>🏢 Business Settings</h4>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.target.value);
                      localStorage.setItem('businessName', e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Default Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Default Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => {
                      const charge = parseFloat(e.target.value) || 0;
                      setDeliveryCharge(charge);
                      localStorage.setItem('deliveryCharge', charge.toString());
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  💾 Save Settings
                </button>
              </div>

              {/* System Info */}
              <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '25px', color: '#2c3e50', fontSize: '18px' }}>ℹ️ System Information</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Total Items:</strong> {predefinedItems.length}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>TSC TL240 Printer:</strong> ✅ Compatible
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Print Resolution:</strong> 203 DPI (8 dots/mm)
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Max Print Width:</strong> 4.25 inches (108mm)
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Tag Layout:</strong> 1×n Matrix (Optimized)
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Today's Date:</strong> {new Date().toLocaleDateString('en-IN')}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>System Version:</strong> v3.0.0 TSC Edition
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <strong>Last Updated:</strong> {new Date().toLocaleString('en-IN')}
                </div>

                <button
                  onClick={resetAllData}
                  style={{
                    width: '100%',
                    padding: '15px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  🔄 Reset All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Confirmation Modals */}
        
        {/* Clear Order Confirmation */}
        {showClearOrderConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px',
              width: '500px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
              <h3 style={{ marginBottom: '15px', color: '#dc3545', fontSize: '24px' }}>Clear Current Order?</h3>
              <p style={{ marginBottom: '30px', color: '#6c757d', fontSize: '16px', lineHeight: '1.5' }}>
                This action will permanently remove all items from the current order and reset customer information. 
                This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowClearOrderConfirm(false)}
                  style={{
                    padding: '15px 30px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearOrder}
                  style={{
                    padding: '15px 30px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Yes, Clear Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Daily Stats Confirmation */}
        {showResetStatsConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px',
              width: '500px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <h3 style={{ marginBottom: '15px', color: '#dc3545', fontSize: '24px' }}>Reset Daily Statistics?</h3>
              <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '16px', lineHeight: '1.5' }}>
                This will permanently reset today's order count and revenue data:
              </p>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '10px', 
                marginBottom: '30px',
                border: '2px solid #e9ecef'
              }}>
                <div style={{ marginBottom: '10px', fontSize: '16px' }}>
                  <strong>Today's Orders:</strong> {todayOrders}
                </div>
                <div style={{ fontSize: '16px' }}>
                  <strong>Today's Revenue:</strong> ₹{todayRevenue}
                </div>
              </div>
              <p style={{ marginBottom: '30px', color: '#dc3545', fontSize: '14px', fontStyle: 'italic' }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowResetStatsConfirm(false)}
                  style={{
                    padding: '15px 30px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetStats}
                  style={{
                    padding: '15px 30px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Yes, Reset Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset All Data Confirmation */}
        {showResetAllDataConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '20px',
              width: '550px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚨</div>
              <h3 style={{ marginBottom: '15px', color: '#dc3545', fontSize: '24px' }}>Reset All System Data?</h3>
              <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '16px', lineHeight: '1.5' }}>
                <strong>WARNING:</strong> This will permanently delete ALL system data including:
              </p>
              <div style={{ 
                background: '#fff3cd', 
                padding: '20px', 
                borderRadius: '10px', 
                marginBottom: '20px',
                border: '2px solid #ffeaa7',
                textAlign: 'left'
              }}>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404' }}>
                  <li>All custom items ({predefinedItems.length - 16} custom items)</li>
                  <li>Business settings and configuration</li>
                  <li>Daily statistics and revenue data</li>
                  <li>All saved preferences</li>
                </ul>
              </div>
              <p style={{ marginBottom: '30px', color: '#dc3545', fontSize: '16px', fontWeight: 'bold' }}>
                This action is IRREVERSIBLE and will restart the application.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => setShowResetAllDataConfirm(false)}
                  style={{
                    padding: '15px 30px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Cancel (Safe)
                </button>
                <button
                  onClick={confirmResetAllData}
                  style={{
                    padding: '15px 30px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  Yes, Delete Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPOSInterface;