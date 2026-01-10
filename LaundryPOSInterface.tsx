// COMPLETE LAUNDRY POS INTERFACE - TSC TL240 + SP POS891US
// Professional bill and tag printing software

import React, { useState, useEffect } from 'react';
import { dualPrinterManager, LaundryOrder } from './DualPrinterManager';

interface LaundryItem {
  id: string;
  name: string;
  category: 'SHIRT' | 'PANT' | 'SAREE' | 'DRESS' | 'JACKET' | 'OTHER';
  quantity: number;
  rate: number;
  washType: 'DRY CLEAN' | 'WASH' | 'IRON' | 'WASH+IRON';
}

interface BusinessSettings {
  name: string;
  address: string;
  phone: string;
  gstNumber?: string;
}

export const LaundryPOSInterface: React.FC = () => {
  // State management
  const [printerStatus, setPrinterStatus] = useState({ thermal: false, tsc: false });
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    name: 'GenZ Laundry',
    address: '123 Laundry Street, Delhi - 110001',
    phone: '+91 98765 43210'
  });
  
  const [currentOrder, setCurrentOrder] = useState<{
    customerName: string;
    customerPhone: string;
    items: LaundryItem[];
    discount: number;
    printTags: boolean;
    generateBarcodes: boolean;
  }>({
    customerName: '',
    customerPhone: '',
    items: [],
    discount: 0,
    printTags: true,
    generateBarcodes: true
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  // Predefined laundry items with rates
  const laundryItems = [
    { name: 'Shirt (Cotton)', category: 'SHIRT' as const, rate: 50 },
    { name: 'Shirt (Formal)', category: 'SHIRT' as const, rate: 60 },
    { name: 'T-Shirt', category: 'SHIRT' as const, rate: 40 },
    { name: 'Pant (Casual)', category: 'PANT' as const, rate: 70 },
    { name: 'Pant (Formal)', category: 'PANT' as const, rate: 80 },
    { name: 'Jeans', category: 'PANT' as const, rate: 75 },
    { name: 'Saree (Cotton)', category: 'SAREE' as const, rate: 150 },
    { name: 'Saree (Silk)', category: 'SAREE' as const, rate: 200 },
    { name: 'Dress (Casual)', category: 'DRESS' as const, rate: 90 },
    { name: 'Dress (Party)', category: 'DRESS' as const, rate: 120 },
    { name: 'Jacket', category: 'JACKET' as const, rate: 100 },
    { name: 'Blazer', category: 'JACKET' as const, rate: 150 }
  ];

  // Check printer status on component mount
  useEffect(() => {
    updatePrinterStatus();
  }, []);

  const updatePrinterStatus = () => {
    const status = dualPrinterManager.getPrinterStatus();
    setPrinterStatus({
      thermal: status.thermal.connected,
      tsc: status.tsc.connected
    });
  };

  // Connect both printers
  const connectPrinters = async () => {
    setIsProcessing(true);
    try {
      const results = await dualPrinterManager.connectAllPrinters();
      setPrinterStatus(results);
      setLastResult(`Printers Connected - Thermal: ${results.thermal ? '✅' : '❌'}, TSC: ${results.tsc ? '✅' : '❌'}`);
    } catch (error) {
      setLastResult(`Connection Error: ${(error as Error).message}`);
    }
    setIsProcessing(false);
  };

  // Add item to order
  const addItem = (itemTemplate: typeof laundryItems[0], washType: LaundryItem['washType']) => {
    const newItem: LaundryItem = {
      id: `${itemTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: itemTemplate.name,
      category: itemTemplate.category,
      quantity: 1,
      rate: itemTemplate.rate,
      washType
    };
    
    setCurrentOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  // Remove item from order
  const removeItem = (itemId: string) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = currentOrder.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = (subtotal * currentOrder.discount) / 100;
    const grandTotal = subtotal - discountAmount;
    
    return { subtotal, discountAmount, grandTotal };
  };

  // Generate bill number
  const generateBillNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-4);
    return `GenZ-${dateStr}-${timeStr}`;
  };

  // Process complete order (bill + tags)
  const processCompleteOrder = async () => {
    if (currentOrder.items.length === 0) {
      setLastResult('❌ No items in order');
      return;
    }

    if (!currentOrder.customerName.trim()) {
      setLastResult('❌ Customer name required');
      return;
    }

    setIsProcessing(true);
    try {
      const { subtotal, discountAmount, grandTotal } = calculateTotals();
      
      const order: LaundryOrder = {
        businessName: businessSettings.name,
        address: businessSettings.address,
        phone: businessSettings.phone,
        billNumber: generateBillNumber(),
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        items: currentOrder.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          washType: item.washType
        })),
        subtotal,
        discount: discountAmount,
        grandTotal,
        thankYouMessage: 'Your clothes, cared for with Gen-Z speed. THANK YOU!',
        printTags: currentOrder.printTags,
        generateBarcodes: currentOrder.generateBarcodes
      };

      const result = await dualPrinterManager.processLaundryOrder(order);
      
      if (result.billPrinted && result.tagsPrinted) {
        setLastResult(`✅ Order Complete - Bill: ✅ Tags: ✅ (${order.billNumber})`);
        clearOrder();
      } else if (result.billPrinted) {
        setLastResult(`⚠️ Bill Printed ✅ Tags Failed ❌ - ${result.errors.join(', ')}`);
      } else {
        setLastResult(`❌ Order Failed - ${result.errors.join(', ')}`);
      }

    } catch (error) {
      setLastResult(`❌ Processing Error: ${(error as Error).message}`);
    }
    setIsProcessing(false);
  };

  // Print bill only
  const printBillOnly = async () => {
    if (currentOrder.items.length === 0) return;

    setIsProcessing(true);
    try {
      const { subtotal, discountAmount, grandTotal } = calculateTotals();
      
      const order: LaundryOrder = {
        businessName: businessSettings.name,
        address: businessSettings.address,
        phone: businessSettings.phone,
        billNumber: generateBillNumber(),
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        items: currentOrder.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          washType: item.washType
        })),
        subtotal,
        discount: discountAmount,
        grandTotal,
        thankYouMessage: 'Your clothes, cared for with Gen-Z speed. THANK YOU!'
      };

      const success = await dualPrinterManager.printBillOnly(order);
      setLastResult(success ? `✅ Bill Printed (${order.billNumber})` : '❌ Bill Print Failed');

    } catch (error) {
      setLastResult(`❌ Bill Error: ${(error as Error).message}`);
    }
    setIsProcessing(false);
  };

  // Print tags only
  const printTagsOnly = async () => {
    if (currentOrder.items.length === 0) return;

    setIsProcessing(true);
    try {
      const order: LaundryOrder = {
        businessName: businessSettings.name,
        address: businessSettings.address,
        phone: businessSettings.phone,
        billNumber: generateBillNumber(),
        customerName: currentOrder.customerName,
        customerPhone: currentOrder.customerPhone,
        items: currentOrder.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
          washType: item.washType
        })),
        subtotal: 0,
        grandTotal: 0,
        printTags: true,
        generateBarcodes: currentOrder.generateBarcodes
      };

      const success = await dualPrinterManager.printTagsOnly(order);
      setLastResult(success ? `✅ Tags Printed (${order.billNumber})` : '❌ Tags Print Failed');

    } catch (error) {
      setLastResult(`❌ Tags Error: ${(error as Error).message}`);
    }
    setIsProcessing(false);
  };

  // Test both printers
  const testPrinters = async () => {
    setIsProcessing(true);
    try {
      const results = await dualPrinterManager.testAllPrinters();
      setLastResult(`Test Results - Thermal: ${results.thermal ? '✅' : '❌'}, TSC: ${results.tsc ? '✅' : '❌'}`);
    } catch (error) {
      setLastResult(`❌ Test Error: ${(error as Error).message}`);
    }
    setIsProcessing(false);
  };

  // Clear current order
  const clearOrder = () => {
    setCurrentOrder({
      customerName: '',
      customerPhone: '',
      items: [],
      discount: 0,
      printTags: true,
      generateBarcodes: true
    });
  };

  const { subtotal, discountAmount, grandTotal } = calculateTotals();

  return (
    <div className="laundry-pos-interface">
      <style>{`
        .laundry-pos-interface {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          color: #333;
          min-height: 100vh;
        }
        
        .pos-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .printer-status {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .printer-card {
          flex: 1;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: #333;
        }
        
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .status-connected { background: #4CAF50; }
        .status-disconnected { background: #f44336; }
        
        .main-content {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
        }
        
        .order-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .customer-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .input-group {
          display: flex;
          flex-direction: column;
        }
        
        .input-group label {
          margin-bottom: 5px;
          font-weight: 600;
          color: #333;
        }
        
        .input-group input {
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          background: white;
          color: #333;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .item-card {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          color: #333;
        }
        
        .item-card:hover {
          border-color: #667eea;
          transform: translateY(-2px);
        }
        
        .item-name {
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }
        
        .item-rate {
          color: #28a745;
          font-size: 14px;
          font-weight: 600;
        }
        
        .wash-type-selector {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }
        
        .wash-btn {
          padding: 5px 10px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }
        
        .wash-btn:hover {
          background: #667eea;
          color: white;
        }
        
        .order-summary {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .order-items {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
        }
        
        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #eee;
          color: #333;
        }
        
        .item-details {
          flex: 1;
          color: #333;
        }
        
        .item-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .qty-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          color: #333;
          font-weight: bold;
        }
        
        .qty-btn:hover {
          background: #f0f0f0;
        }
        
        .remove-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .totals {
          border-top: 2px solid #eee;
          padding-top: 15px;
          margin-bottom: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
        }
        
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          border-top: 1px solid #ddd;
          padding-top: 8px;
        }
        
        .print-options {
          margin-bottom: 20px;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .checkbox-group input {
          margin-right: 8px;
          accent-color: #667eea;
        }
        
        .checkbox-group label {
          color: #333;
          font-weight: 500;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .btn {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-secondary {
          background: #6c757d;
          color: white;
        }
        
        .btn-success {
          background: #28a745;
          color: white;
        }
        
        .btn-warning {
          background: #ffc107;
          color: #212529;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .status-message {
          padding: 10px;
          border-radius: 5px;
          margin-top: 15px;
          font-weight: 500;
          background: #e3f2fd;
          border: 1px solid #2196f3;
          color: #1976d2;
        }
        
        .processing {
          opacity: 0.7;
          pointer-events: none;
        }
      `}</style>

      {/* Header */}
      <div className="pos-header">
        <h1>🏪 GenZ Laundry POS System</h1>
        <p>Professional Bill & Tag Printing - TSC TL240 + SP POS891US</p>
      </div>

      {/* Printer Status */}
      <div className="printer-status">
        <div className="printer-card">
          <h3>
            <span className={`status-indicator ${printerStatus.thermal ? 'status-connected' : 'status-disconnected'}`}></span>
            SP POS891US (Receipt Printer)
          </h3>
          <p>Status: {printerStatus.thermal ? 'Connected ✅' : 'Disconnected ❌'}</p>
        </div>
        <div className="printer-card">
          <h3>
            <span className={`status-indicator ${printerStatus.tsc ? 'status-connected' : 'status-disconnected'}`}></span>
            TSC TL240 (Label Printer)
          </h3>
          <p>Status: {printerStatus.tsc ? 'Connected ✅' : 'Disconnected ❌'}</p>
        </div>
        <div className="printer-card">
          <button className="btn btn-primary" onClick={connectPrinters} disabled={isProcessing}>
            Connect Printers
          </button>
          <button className="btn btn-secondary" onClick={testPrinters} disabled={isProcessing} style={{marginTop: '10px'}}>
            Test Printers
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Order Creation */}
        <div className="order-section">
          <h2>📝 Create Order</h2>
          
          {/* Customer Information */}
          <div className="customer-info">
            <div className="input-group">
              <label>Customer Name *</label>
              <input
                type="text"
                value={currentOrder.customerName}
                onChange={(e) => setCurrentOrder(prev => ({...prev, customerName: e.target.value}))}
                placeholder="Enter customer name"
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={currentOrder.customerPhone}
                onChange={(e) => setCurrentOrder(prev => ({...prev, customerPhone: e.target.value}))}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Laundry Items */}
          <h3>Select Items</h3>
          <div className="items-grid">
            {laundryItems.map((item, index) => (
              <div key={index} className="item-card">
                <div className="item-name">{item.name}</div>
                <div className="item-rate">₹{item.rate}</div>
                <div className="wash-type-selector">
                  <button className="wash-btn" onClick={() => addItem(item, 'WASH')}>WASH</button>
                  <button className="wash-btn" onClick={() => addItem(item, 'IRON')}>IRON</button>
                  <button className="wash-btn" onClick={() => addItem(item, 'WASH+IRON')}>BOTH</button>
                  <button className="wash-btn" onClick={() => addItem(item, 'DRY CLEAN')}>DRY</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>🧾 Order Summary</h2>
          
          <div className="order-items">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-details">
                  <div style={{fontWeight: '600'}}>{item.name}</div>
                  <div style={{fontSize: '12px', color: '#666'}}>{item.washType} - ₹{item.rate}</div>
                </div>
                <div className="item-controls">
                  <button className="qty-btn" onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>-</button>
                  <span style={{minWidth: '20px', textAlign: 'center'}}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>+</button>
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>×</button>
                </div>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="input-group" style={{marginBottom: '15px'}}>
            <label>Discount (%)</label>
            <input
              type="number"
              value={currentOrder.discount}
              onChange={(e) => setCurrentOrder(prev => ({...prev, discount: Number(e.target.value)}))}
              min="0"
              max="100"
            />
          </div>

          {/* Totals */}
          <div className="totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="total-row">
              <span>Discount:</span>
              <span>-₹{discountAmount}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total:</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {/* Print Options */}
          <div className="print-options">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={currentOrder.printTags}
                onChange={(e) => setCurrentOrder(prev => ({...prev, printTags: e.target.checked}))}
              />
              <label>Print Laundry Tags</label>
            </div>
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={currentOrder.generateBarcodes}
                onChange={(e) => setCurrentOrder(prev => ({...prev, generateBarcodes: e.target.checked}))}
              />
              <label>Generate Barcodes</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              className="btn btn-success" 
              onClick={processCompleteOrder}
              disabled={isProcessing || currentOrder.items.length === 0}
            >
              🖨️ Print Bill + Tags
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={printBillOnly}
              disabled={isProcessing || currentOrder.items.length === 0}
            >
              🧾 Print Bill Only
            </button>
            
            <button 
              className="btn btn-warning" 
              onClick={printTagsOnly}
              disabled={isProcessing || currentOrder.items.length === 0}
            >
              🏷️ Print Tags Only
            </button>
            
            <button 
              className="btn btn-danger" 
              onClick={clearOrder}
              disabled={isProcessing}
            >
              🗑️ Clear Order
            </button>
          </div>

          {/* Status Message */}
          {lastResult && (
            <div className="status-message">
              {lastResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaundryPOSInterface;