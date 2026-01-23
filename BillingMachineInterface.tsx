import React, { useState, useRef, useEffect } from 'react';
import { printThermalBill, BillData } from './ThermalPrintManager';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  washType: 'WASH' | 'IRON' | 'WASH+IRON' | 'DRY CLEAN';
  total: number;
}

interface Customer {
  name: string;
  phone: string;
}

interface BillingMachineInterfaceProps {
  onLogout?: () => void;
}

const BillingMachineInterface: React.FC<BillingMachineInterfaceProps> = ({ onLogout }) => {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [currentWashType, setCurrentWashType] = useState<'WASH' | 'IRON' | 'WASH+IRON' | 'DRY CLEAN'>('WASH');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [billNumber, setBillNumber] = useState('');
  
  const itemInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const quickItems = [
    { name: 'Shirt', price: 60, washTypes: ['WASH', 'IRON', 'WASH+IRON'], icon: '👔' },
    { name: 'Pant', price: 70, washTypes: ['WASH', 'IRON', 'WASH+IRON'], icon: '👖' },
    { name: 'T-Shirt', price: 40, washTypes: ['WASH', 'IRON'], icon: '👕' },
    { name: 'Saree', price: 150, washTypes: ['WASH', 'DRY CLEAN'], icon: '🥻' },
    { name: 'Suit', price: 300, washTypes: ['DRY CLEAN'], icon: '🤵' },
    { name: 'Bedsheet', price: 100, washTypes: ['WASH'], icon: '🛏️' },
    { name: 'Curtain', price: 120, washTypes: ['WASH', 'DRY CLEAN'], icon: '🪟' },
    { name: 'Towel', price: 30, washTypes: ['WASH'], icon: '🏖️' }
  ];

  useEffect(() => {
    setBillNumber(`GZ${Date.now().toString().slice(-6)}`);
    if (itemInputRef.current) {
      itemInputRef.current.focus();
    }
  }, []);

  const addItemToOrder = () => {
    if (!currentItem || !currentPrice) {
      alert('Please enter item name and price');
      return;
    }

    const price = parseFloat(currentPrice);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const newItem: OrderItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: currentItem,
      quantity: currentQuantity,
      price: price,
      washType: currentWashType,
      total: price * currentQuantity
    };

    setOrderItems([...orderItems, newItem]);
    setCurrentItem('');
    setCurrentPrice('');
    setCurrentQuantity(1);
    if (itemInputRef.current) {
      itemInputRef.current.focus();
    }
  };

  const addQuickItem = (item: typeof quickItems[0]) => {
    setCurrentItem(item.name);
    setCurrentPrice(item.price.toString());
    setCurrentWashType(item.washTypes[0] as any);
    if (priceInputRef.current) {
      priceInputRef.current.focus();
    }
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setOrderItems(orderItems.map(item => 
      item.id === id 
        ? { ...item, quantity, total: item.price * quantity }
        : item
    ));
  };

  const calculateSubtotal = () => orderItems.reduce((sum, item) => sum + item.total, 0);
  const calculateTotal = () => calculateSubtotal() - discount;

  const processOrder = async () => {
    if (!customer.name || orderItems.length === 0) {
      alert('Please enter customer name and add items');
      return;
    }
    
    setIsProcessing(true);
    
    const billData: BillData = {
      businessName: 'GenZ Laundry',
      address: 'Sabji Mandi Circle, Ratanada Jodhpur-342011',
      phone: '+91 9256930727',
      billNumber,
      customerName: customer.name,
      items: orderItems.map(item => ({
        name: `${item.name} (${item.washType})`,
        quantity: item.quantity,
        rate: item.price,
        amount: item.total
      })),
      subtotal: calculateSubtotal(),
      discount,
      grandTotal: calculateTotal(),
      thankYouMessage: 'Thank you for choosing GenZ Laundry!'
    };

    try {
      await printThermalBill(billData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setOrderItems([]);
        setCustomer({ name: '', phone: '' });
        setDiscount(0);
        setBillNumber(`GZ${Date.now().toString().slice(-6)}`);
        if (itemInputRef.current) {
          itemInputRef.current.focus();
        }
      }, 2000);
    } catch (error) {
      console.error('Print failed:', error);
      alert('Print failed. Please try again.');
    }
    
    setIsProcessing(false);
  };

  const printClothingTags = () => {
    if (!customer.name || orderItems.length === 0) {
      alert('Please add items and customer name first');
      return;
    }

    const tags: any[] = [];
    let tagCounter = 1;
    const totalTags = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });

    orderItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        tags.push({
          businessName: 'GenZ Laundry',
          billNumber,
          customerName: customer.name,
          itemName: item.name.toUpperCase(),
          washType: item.washType,
          tagIndex: tagCounter,
          totalTags: totalTags,
          date: currentDate,
          barcode: `GZ${billNumber}${tagCounter.toString().padStart(3, '0')}`,
          price: item.price
        });
        tagCounter++;
      }
    });
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for tag printing');
      return;
    }

    const tagHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Clothing Tags - ${billNumber}</title>
  <style>
    @page { size: 4.25in auto; margin: 0; }
    @media print {
      body { margin: 0; padding: 0; }
      .tag { page-break-after: always; }
      .tag:last-child { page-break-after: avoid; }
    }
    body { font-family: 'Courier New', monospace; margin: 0; padding: 3mm; background: #f0f0f0; width: 4.25in; }
    .tag { width: 50mm; height: 30mm; border: 2px solid #000; margin: 2mm auto; padding: 2mm; background: white; display: block; position: relative; box-sizing: border-box; page-break-inside: avoid; }
    .tag-header { display: flex; justify-content: space-between; align-items: center; font-size: 7px; font-weight: bold; margin-bottom: 1mm; border-bottom: 1px solid #000; padding-bottom: 0.5mm; }
    .business-name { font-size: 8px; font-weight: bold; }
    .date { font-size: 6px; }
    .item-section { text-align: center; margin: 1mm 0; }
    .item-name { font-size: 9px; font-weight: bold; margin-bottom: 0.5mm; }
    .bill-number { font-size: 10px; font-weight: bold; letter-spacing: 0.5px; margin-bottom: 0.5mm; }
    .barcode { font-size: 8px; font-weight: bold; font-family: 'Courier New', monospace; letter-spacing: 1px; border: 1px solid #000; padding: 1px 2px; margin: 1mm 0; }
    .wash-type { font-size: 6px; font-weight: bold; background: #000; color: white; padding: 1px 3px; margin-top: 0.5mm; }
    .bottom-section { position: absolute; bottom: 1.5mm; left: 2mm; right: 2mm; display: flex; justify-content: space-between; align-items: center; font-size: 6px; border-top: 1px solid #000; padding-top: 0.5mm; }
    .customer-info { font-size: 5px; max-width: 60%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tag-counter { background: #000; color: white; padding: 1px 3px; font-size: 7px; font-weight: bold; }
    .price { font-size: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 3mm; font-weight: bold; font-size: 10px;">
    TSC TL240 Clothing Tags - ${tags.length} Tags
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
        <div class="barcode">*${tag.barcode}*</div>
        <div class="wash-type">${tag.washType}</div>
      </div>
      
      <div class="bottom-section">
        <div>
          <div class="customer-info">${tag.customerName.substring(0, 10)}</div>
          <div class="price">₹${tag.price}</div>
        </div>
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

  const clearOrder = () => {
    if (orderItems.length > 0 && confirm('Clear all items?')) {
      setOrderItems([]);
      setCurrentItem('');
      setCurrentPrice('');
      setCurrentQuantity(1);
      if (itemInputRef.current) {
        itemInputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'addItem') {
        addItemToOrder();
      } else if (action === 'processOrder') {
        processOrder();
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #3498db 100%)',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: 'relative'
    }}>
      <style>{`
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .input-modern { background: rgba(255, 255, 255, 0.15); border: 2px solid rgba(255, 255, 255, 0.2); color: white; transition: all 0.3s ease; }
        .input-modern:focus { background: rgba(255, 255, 255, 0.25); border-color: rgba(255, 255, 255, 0.5); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1); }
        .input-modern::placeholder { color: rgba(255, 255, 255, 0.7); }
        .btn-modern { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; font-weight: 600; }
        .btn-modern:hover { transform: translateY(-2px); }
        .quick-item { background: rgba(255, 255, 255, 0.1); border: 2px solid rgba(255, 255, 255, 0.2); transition: all 0.3s ease; }
        .quick-item:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-3px) scale(1.02); }
      `}</style>

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, backdropFilter: 'blur(10px)'
        }}>
          <div className="glass" style={{
            padding: '50px', borderRadius: '25px', textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)', color: 'white'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'pulse 2s infinite' }}>✅</div>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
              Success!
            </h2>
            <p style={{ margin: '15px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
              Bill #{billNumber} printed successfully<br/>
              {orderItems.reduce((sum, item) => sum + item.quantity, 0)} tags generated
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass" style={{
        color: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', margin: '15px', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/logo.png" alt="Logo" style={{
            height: '50px', width: '50px', borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.9)', padding: '6px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
          }} />
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              GenZ Laundry POS
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
              Bill #{billNumber} • {new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="glass" style={{ padding: '12px 20px', borderRadius: '15px', textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Operator</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>👤 Admin</div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="btn-modern" style={{
              padding: '12px 24px', borderRadius: '15px', fontSize: '14px',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: 'white', cursor: 'pointer',
              border: 'none'
            }}>
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', padding: '0 15px 15px', gap: '20px', height: 'calc(100vh - 120px)' }}>
        
        {/* Left Panel */}
        <div className="glass" style={{ width: '60%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Customer Section */}
          <div style={{
            padding: '25px', background: 'linear-gradient(135deg, #ffffff, #f8f9fa)', color: '#2c3e50'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
              👤 Customer Information
            </h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <input
                type="text" placeholder="Customer Name *" value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                style={{ 
                  flex: 1, padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none',
                  background: 'rgba(44, 62, 80, 0.1)', border: '2px solid rgba(44, 62, 80, 0.2)', 
                  color: '#2c3e50', transition: 'all 0.3s ease'
                }}
              />
              <input
                type="tel" placeholder="📱 Phone Number" value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                style={{ 
                  flex: 1, padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none',
                  background: 'rgba(44, 62, 80, 0.1)', border: '2px solid rgba(44, 62, 80, 0.2)', 
                  color: '#2c3e50', transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Item Entry */}
          <div style={{ padding: '25px', background: 'rgba(52, 73, 94, 0.8)', color: 'white' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#ecf0f1' }}>➕ Add Item</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#bdc3c7' }}>Item Name</label>
                <input
                  ref={itemInputRef} type="text" value={currentItem} onChange={(e) => setCurrentItem(e.target.value)}
                  placeholder="Enter item name" className="input-modern"
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none' }}
                  onKeyPress={(e) => handleKeyPress(e, 'addItem')}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#bdc3c7' }}>Price (₹)</label>
                <input
                  ref={priceInputRef} type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="0" className="input-modern"
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none' }}
                  onKeyPress={(e) => handleKeyPress(e, 'addItem')}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#bdc3c7' }}>Quantity</label>
                <input
                  type="number" value={currentQuantity} onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1" className="input-modern"
                  style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#bdc3c7' }}>Wash Type</label>
                <select
                  value={currentWashType} onChange={(e) => setCurrentWashType(e.target.value as any)}
                  className="input-modern" style={{ padding: '15px', borderRadius: '12px', fontSize: '16px', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="WASH">🧺 WASH</option>
                  <option value="IRON">🔥 IRON</option>
                  <option value="WASH+IRON">🧺🔥 WASH+IRON</option>
                  <option value="DRY CLEAN">✨ DRY CLEAN</option>
                </select>
              </div>
              <button onClick={addItemToOrder} className="btn-modern" style={{
                padding: '15px 25px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)', color: 'white', cursor: 'pointer'
              }}>
                ➕ ADD
              </button>
            </div>
          </div>

          {/* Quick Items */}
          <div style={{ padding: '25px', flex: 1, overflow: 'auto', background: 'rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: 'white' }}>⚡ Quick Items</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
              {quickItems.map((item, index) => (
                <button
                  key={index} onClick={() => addQuickItem(item)} className="quick-item"
                  style={{
                    padding: '20px 15px', borderRadius: '15px', cursor: 'pointer',
                    fontSize: '14px', fontWeight: 'bold', textAlign: 'center', color: 'white'
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
                  <div>{item.name}</div>
                  <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.8 }}>₹{item.price}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Bill */}
        <div className="glass" style={{ width: '40%', borderRadius: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Bill Header */}
          <div style={{
            padding: '25px', background: 'linear-gradient(135deg, #2c3e50, #34495e)', color: 'white'
          }}>
            <h2 style={{ margin: 0, fontSize: '24px', textAlign: 'center', fontWeight: 'bold' }}>
              🧾 BILL SUMMARY
            </h2>
          </div>

          {/* Items List */}
          <div style={{ flex: 1, overflow: 'auto', background: 'rgba(255, 255, 255, 0.05)' }}>
            {orderItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
                No items added yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.1)', position: 'sticky', top: 0, zIndex: 1 }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>ITEM</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>QTY</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>RATE</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>TOTAL</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: 'white' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                          ({item.washType}) • {item.quantity} tag{item.quantity > 1 ? 's' : ''}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer', fontSize: '12px', color: 'white', borderRadius: '4px' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer', fontSize: '12px', color: 'white', borderRadius: '4px' }}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: 'white' }}>₹{item.price}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: 'white' }}>₹{item.total}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{ width: '28px', height: '28px', border: 'none', background: 'linear-gradient(135deg, #ffffff, #f8f9fa)', color: '#2c3e50', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Bill Total */}
          <div style={{ padding: '15px', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Discount (₹)</label>
              <input
                type="number" value={discount} onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0" className="input-modern"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 'bold' }}>₹{calculateSubtotal()}</span>
              </div>
                      {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'white', fontSize: '16px' }}>
                  <span>Discount:</span>
                  <span style={{ fontWeight: 'bold' }}>-₹{discount}</span>
                </div>
              )}
              <hr style={{ margin: '15px 0', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>TOTAL:</span>
                <span style={{ color: '#3498db' }}>₹{calculateTotal()}</span>
              </div>
            </div>

            {/* Print Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={printClothingTags} disabled={orderItems.length === 0 || !customer.name}
                className="btn-modern" style={{
                  flex: 1, padding: '15px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                  background: orderItems.length === 0 || !customer.name ? 'rgba(189, 195, 199, 0.5)' : 'linear-gradient(135deg, #f39c12, #e67e22)',
                  color: 'white', cursor: orderItems.length === 0 || !customer.name ? 'not-allowed' : 'pointer'
                }}
              >
                🏷️ Print Tags
              </button>
              <button
                onClick={processOrder} disabled={!customer.name || orderItems.length === 0 || isProcessing}
                className="btn-modern" style={{
                  flex: 1, padding: '15px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold',
                  background: (!customer.name || orderItems.length === 0 || isProcessing) ? 'rgba(189, 195, 199, 0.5)' : 'linear-gradient(135deg, #27ae60, #2ecc71)',
                  color: 'white', cursor: (!customer.name || orderItems.length === 0 || isProcessing) ? 'not-allowed' : 'pointer'
                }}
              >
                🧾 Print Bill
              </button>
            </div>

            {/* Clear Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={clearOrder} disabled={orderItems.length === 0}
                className="btn-modern" style={{
                  padding: '8px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold',
                  background: orderItems.length === 0 ? 'rgba(189, 195, 199, 0.5)' : 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                  color: 'white', cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                🗑️ CLEAR ORDER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingMachineInterface;