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
}

const SimplePOSInterface: React.FC = () => {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'pos' | 'items' | 'settings'>('pos');
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [businessName, setBusinessName] = useState('MANOHAR');
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

  const filteredItems = predefinedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToOrder = (item: typeof predefinedItems[0], washType: OrderItem['washType']) => {
    const newOrderItem: OrderItem = {
      id: `${item.id}-${washType}-${Date.now()}`,
      name: item.name,
      quantity: 1,
      price: item.price,
      washType,
      category: item.category
    };
    setOrderItems([...orderItems, newOrderItem]);
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

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

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
  };  cons
t printClothingTags = () => {
    if (!customer.name) {
      alert('Please enter customer name first');
      return;
    }

    const tags = [];
    let tagCounter = 1;
    const totalTagCount = getTotalTagCount();
    const billNumber = `${businessName.substring(0,2).toUpperCase()}${Date.now().toString().slice(-3)}`;
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });

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

    const printWindow = window.open('', '_blank', 'width=400,height=800');
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
    @page { size: 4in auto; margin: 0; }
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
      width: 4in;
    }
    
    .tag {
      width: 50mm;
      height: 30mm;
      border: 2px solid #000;
      margin: 3mm auto;
      padding: 2mm;
      background: white;
      display: block;
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
    
    .business-name { font-size: 9px; font-weight: bold; }
    .date { font-size: 7px; }
    
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
  <div style="text-align: center; margin-bottom: 5mm; font-weight: bold;">
    TSC TL240 Label Print - ${tags.length} Tags
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

  const printBill = () => {
    if (!customer.name) {
      alert('Please enter customer name');
      return;
    }

    const billData: BillData = {
      businessName: businessName,
      address: '123 Laundry Street, Delhi - 110001',
      phone: '+91 98765 43210',
      billNumber: `${businessName.substring(0,2).toUpperCase()}${Date.now().toString().slice(-6)}`,
      customerName: customer.name,
      items: orderItems.map(item => ({
        name: `${item.name} (${item.washType})`,
        quantity: item.quantity,
        rate: item.price,
        amount: item.price * item.quantity
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      gst: calculateGST(),
      grandTotal: calculateTotal(),
      thankYouMessage: `Thank you for choosing ${businessName}!`
    };

    if (deliveryCharge > 0) {
      billData.items.push({
        name: 'Delivery Charge',
        quantity: 1,
        rate: deliveryCharge,
        amount: deliveryCharge
      });
    }

    printThermalBill(billData);
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomer({ name: '', phone: '' });
    setDiscount(0);
    setDeliveryCharge(0);
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
  };  ret
urn (
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
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          color: 'white',
          padding: '30px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
              ✨ {businessName} LAUNDRY POS
            </h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
              Ultimate Point of Sale System | TSC TL240 Compatible
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            📅 {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          background: '#f8f9fa',
          borderBottom: '3px solid #e9ecef'
        }}>
          {[
            { key: 'pos', label: 'Point of Sale', icon: '🛒' },
            { key: 'items', label: 'Item Management', icon: '📦' },
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
                fontSize: '16px'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* POS Tab */}
        {currentTab === 'pos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', minHeight: '700px' }}>
            {/* Left Panel */}
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
                    fontWeight: 'bold'
                  }}
                >
                  ⚡ Quick Add Item
                </button>
              </div>

              {/* Search Bar */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '15px',
                marginBottom: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}>
                <input
                  type="text"
                  placeholder="🔍 Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Quick Add Modal */}
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
                    width: '400px'
                  }}>
                    <h4 style={{ marginBottom: '20px' }}>⚡ Quick Add Item</h4>
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
                        marginBottom: '15px'
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
                        marginBottom: '20px'
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
                        ✅ Add
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

              {/* Customer Info */}
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '15px',
                marginBottom: '25px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>👤 Customer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.</div>      
              </div>            />
                        }}
         x'
   ius: '6prRad   borde               
    olid #ddd','2px srder:    bo                   ,
ng: '8px' paddi                    00px',
 idth: '1  w                e={{
    tyl     s           0)}
    t.value) || at(e.targee(parseFloyChargtDeliver) => seange={(eCh        on           Charge}
 ={delivery   value                er="₹0"
 ldceho   pla          
       ber"="numtype              t
            <inpu           :</span>
 Deliverybold' }}> 'ontWeight: style={{ f    <span              15px' }}>
 'r', gap:'centes: lignItemlex', a display: 'fiv style={{         <d
       /div>    <             />
             }}
                   x'
     ntSize: '14p  fo                ,
     '8px'ius:adrRrde         bo          ecef',
   id #e9'2px sol   border:                    ,
ding: '12px'pad             
            style={{            })}
     ue et.valhone: e.targcustomer, p({ ...merstotCu> se{(e) =nChange=     o        
       phone}={customer. value                   Number"
e lder="Phon  placeho       
           e="tel"        typ            <input
                    />
                  }}
                  4px'
tSize: '1         fon           8px',
  us: ' borderRadi               ,
      e9ecef'solid #'2px  border:                      ',
dding: '12px        pa              yle={{
   st              }
   ue })val