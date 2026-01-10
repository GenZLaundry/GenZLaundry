import React, { useState, useEffect } from 'react';
import { tscLabelPrinter, LaundryTag } from './TSCLabelPrinter';
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
  email?: string;
}

const ProfessionalPOSInterface: React.FC = () => {
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '' });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'pos' | 'items' | 'settings'>('pos');
  const [isEditingItem, setIsEditingItem] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    price: '',
    category: 'CLOTHING' as OrderItem['category']
  });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [tscConnected, setTscConnected] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  // Predefined items with categories
  const [predefinedItems, setPredefinedItems] = useState([
    // Clothing Items
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
    { id: '11', name: 'Blazer', price: 200, category: 'CLOTHING' as const },
    { id: '12', name: 'Dress', price: 120, category: 'CLOTHING' as const },
    
    // Household Items
    { id: '13', name: 'Bed Sheet (Single)', price: 80, category: 'HOUSEHOLD' as const },
    { id: '14', name: 'Bed Sheet (Double)', price: 120, category: 'HOUSEHOLD' as const },
    { id: '15', name: 'Pillow Cover', price: 25, category: 'HOUSEHOLD' as const },
    { id: '16', name: 'Curtain (Small)', price: 100, category: 'HOUSEHOLD' as const },
    { id: '17', name: 'Curtain (Large)', price: 180, category: 'HOUSEHOLD' as const },
    { id: '18', name: 'Table Cloth', price: 60, category: 'HOUSEHOLD' as const },
    
    // Special Items
    { id: '19', name: 'Wedding Dress', price: 500, category: 'SPECIAL' as const },
    { id: '20', name: 'Leather Jacket', price: 400, category: 'SPECIAL' as const },
    { id: '21', name: 'Carpet (Small)', price: 300, category: 'SPECIAL' as const },
    { id: '22', name: 'Blanket (Heavy)', price: 200, category: 'SPECIAL' as const }
  ]);

  useEffect(() => {
    // Check TSC printer connection status
    setTscConnected(tscLabelPrinter.isTSCConnected());
  }, []);

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

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateGST = () => {
    return Math.round((calculateSubtotal() - discount) * (gstRate / 100));
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + calculateGST();
  };

  const connectTSCPrinter = async () => {
    const connected = await tscLabelPrinter.connectTSC();
    setTscConnected(connected);
    if (connected) {
      alert('✅ TSC TL240 Label Printer Connected!');
    } else {
      alert('❌ Failed to connect TSC printer. Please check connection.');
    }
  };

  const printClothingTags = async () => {
    if (!tscConnected) {
      alert('Please connect TSC TL240 printer first');
      return;
    }

    const billNumber = `GZ${Date.now().toString().slice(-6)}`;
    const tags: LaundryTag[] = orderItems.map((item, index) => ({
      laundryName: 'GenZ Laundry',
      billNumber,
      customerName: customer.name,
      customerPhone: customer.phone,
      itemName: item.name,
      washType: item.washType,
      barcode: `${billNumber}-${index + 1}`,
      tagIndex: index + 1,
      totalTags: orderItems.length
    }));

    const success = await tscLabelPrinter.printOrderTags(tags);
    if (success) {
      alert(`✅ ${tags.length} clothing tags printed successfully!`);
    } else {
      alert('❌ Failed to print clothing tags');
    }
  };

  const printBill = () => {
    if (!customer.name) {
      alert('Please enter customer name');
      return;
    }

    const billData: BillData = {
      businessName: 'GenZ Laundry',
      address: 'Sabji Mandi Circle, Ratanada Jodhpur-342022',
      phone: '+91 9256930727',
      billNumber: `GZ${Date.now().toString().slice(-6)}`,
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
      thankYouMessage: 'Thank you for choosing GenZ Laundry!'
    };

    printThermalBill(billData);
  };

  const clearOrder = () => {
    setOrderItems([]);
    setCustomer({ name: '', phone: '' });
    setDiscount(0);
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
    return predefinedItems.filter(item => item.category === category);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
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
          padding: '20px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              ✨ GenZ Laundry POS
            </h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.8 }}>
              Professional Point of Sale System
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{
              background: tscConnected ? '#27ae60' : '#e74c3c',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              🏷️ TSC TL240: {tscConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 15px',
              borderRadius: '20px',
              fontSize: '12px'
            }}>
              📅 {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: '#f8f9fa',
          borderBottom: '2px solid #e9ecef'
        }}>
          {[
            { key: 'pos', label: '🛒 Point of Sale', icon: '🛒' },
            { key: 'items', label: '📦 Item Management', icon: '📦' },
            { key: 'settings', label: '⚙️ Settings', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key as any)}
              style={{
                padding: '15px 25px',
                border: 'none',
                background: currentTab === tab.key ? 'white' : 'transparent',
                color: currentTab === tab.key ? '#2c3e50' : '#6c757d',
                fontWeight: currentTab === tab.key ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: currentTab === tab.key ? '3px solid #667eea' : 'none',
                fontSize: '14px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* POS Tab */}
        {currentTab === 'pos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', minHeight: '600px' }}>
            {/* Left Panel - Items */}
            <div style={{ padding: '30px', background: '#f8f9fa' }}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>📦 Select Items</h3>
              
              {/* Customer Info */}
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>👤 Customer Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    style={{
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
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
                      padding: '12px',
                      border: '2px solid #e9ecef',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                  />
                </div>
              </div>

              {/* Items by Category */}
              {(['CLOTHING', 'HOUSEHOLD', 'SPECIAL'] as const).map(category => (
                <div key={category} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <h4 style={{ 
                    marginBottom: '15px', 
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {category === 'CLOTHING' && '👕'} 
                    {category === 'HOUSEHOLD' && '🏠'} 
                    {category === 'SPECIAL' && '⭐'} 
                    {category} ITEMS
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {getCategoryItems(category).map(item => (
                      <div key={item.id} style={{
                        border: '2px solid #e9ecef',
                        borderRadius: '10px',
                        padding: '15px',
                        background: '#f8f9fa'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '10px'
                        }}>
                          <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>{item.name}</span>
                          <span style={{ 
                            background: '#667eea', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '15px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ₹{item.price}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {(['WASH', 'IRON', 'WASH+IRON', 'DRY CLEAN'] as const).map(washType => (
                            <button
                              key={washType}
                              onClick={() => addItemToOrder(item, washType)}
                              style={{
                                padding: '8px 12px',
                                background: getWashTypeColor(washType),
                                color: washType === 'WASH+IRON' ? 'black' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                transition: 'transform 0.2s'
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

            {/* Right Panel - Order Summary */}
            <div style={{ 
              padding: '30px', 
              background: 'white',
              borderLeft: '2px solid #e9ecef'
            }}>
              <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>🧾 Order Summary</h3>
              
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                marginBottom: '20px',
                border: '1px solid #e9ecef',
                borderRadius: '10px',
                padding: '15px'
              }}>
                {orderItems.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#6c757d', 
                    padding: '40px 0',
                    fontStyle: 'italic'
                  }}>
                    No items added yet
                  </div>
                ) : (
                  orderItems.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid #f1f3f4',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: getWashTypeColor(item.washType),
                          fontWeight: 'bold'
                        }}>
                          {item.washType}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          -
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            border: 'none',
                            background: '#28a745',
                            color: 'white',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          +
                        </button>
                        <div style={{ minWidth: '60px', textAlign: 'right' }}>
                          {isEditingItem === item.id ? (
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                              onBlur={() => setIsEditingItem(null)}
                              onKeyPress={(e) => e.key === 'Enter' && setIsEditingItem(null)}
                              style={{
                                width: '50px',
                                padding: '2px',
                                border: '1px solid #667eea',
                                borderRadius: '3px',
                                fontSize: '12px'
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              onClick={() => setIsEditingItem(item.id)}
                              style={{ 
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                color: '#667eea'
                              }}
                            >
                              ₹{item.price * item.quantity}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            border: 'none',
                            background: '#dc3545',
                            color: 'white',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '10px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span>Discount:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '80px',
                      padding: '4px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      textAlign: 'right'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>GST ({gstRate}%):</span>
                  <span>₹{calculateGST()}</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  borderTop: '2px solid #667eea',
                  paddingTop: '8px',
                  color: '#2c3e50'
                }}>
                  <span>TOTAL:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={printBill}
                  disabled={orderItems.length === 0 || !customer.name}
                  style={{
                    padding: '15px',
                    background: orderItems.length === 0 || !customer.name ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: orderItems.length === 0 || !customer.name ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  🖨️ Print Bill
                </button>

                <button
                  onClick={printClothingTags}
                  disabled={orderItems.length === 0 || !tscConnected}
                  style={{
                    padding: '15px',
                    background: orderItems.length === 0 || !tscConnected ? '#6c757d' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: orderItems.length === 0 || !tscConnected ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  🏷️ Print Clothing Tags ({orderItems.length})
                </button>

                <button
                  onClick={clearOrder}
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
                  🗑️ Clear Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Management Tab */}
        {currentTab === 'items' && (
          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{ color: '#2c3e50' }}>📦 Item Management</h3>
              <button
                onClick={() => setShowNewItemForm(true)}
                style={{
                  padding: '12px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ➕ Add New Item
              </button>
            </div>

            {/* Add New Item Form */}
            {showNewItemForm && (
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '2px solid #667eea'
              }}>
                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Add New Item</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Item Name</label>
                    <input
                      type="text"
                      value={newItemForm.name}
                      onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (₹)</label>
                    <input
                      type="number"
                      value={newItemForm.price}
                      onChange={(e) => setNewItemForm({ ...newItemForm, price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                      placeholder="Enter price"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
                    <select
                      value={newItemForm.category}
                      onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value as OrderItem['category'] })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
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
                        padding: '10px 15px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Add
                    </button>
                    <button
                      onClick={() => setShowNewItemForm(false)}
                      style={{
                        padding: '10px 15px',
                        background: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {predefinedItems.map(item => (
                <div key={item.id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #e9ecef',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#2c3e50' }}>{item.name}</h4>
                    <span style={{
                      background: item.category === 'CLOTHING' ? '#007bff' : 
                                 item.category === 'HOUSEHOLD' ? '#28a745' : '#dc3545',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#667eea',
                    marginBottom: '15px'
                  }}>
                    ₹{item.price}
                  </div>
                  <button
                    onClick={() => {
                      const newPrice = prompt('Enter new price:', item.price.toString());
                      if (newPrice && !isNaN(parseFloat(newPrice))) {
                        setPredefinedItems(predefinedItems.map(i => 
                          i.id === item.id ? { ...i, price: parseFloat(newPrice) } : i
                        ));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Edit Price
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {currentTab === 'settings' && (
          <div style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '30px', color: '#2c3e50' }}>⚙️ Settings</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Printer Settings */}
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>🖨️ Printer Settings</h4>
                
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span>TSC TL240 Label Printer:</span>
                    <span style={{
                      color: tscConnected ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {tscConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
                    </span>
                  </div>
                  <button
                    onClick={connectTSCPrinter}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: tscConnected ? '#6c757d' : '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {tscConnected ? '🔄 Reconnect' : '🔌 Connect'} TSC Printer
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => tscLabelPrinter.testPrint()}
                    disabled={!tscConnected}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: !tscConnected ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: !tscConnected ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🧪 Test Print Label
                  </button>
                </div>
              </div>

              {/* Business Settings */}
              <div style={{
                background: 'white',
                padding: '25px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>🏢 Business Settings</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    GST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Default Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  />
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalPOSInterface;