// HYBRID PRINTING SOLUTION - Works with Windows printer drivers
// Alternative to Web Serial API for printers already installed in Windows

import React, { useState } from 'react';

export const HybridPrintingSolution: React.FC = () => {
  const [orderData, setOrderData] = useState({
    customerName: '',
    items: [] as Array<{ name: string; quantity: number; price: number; washType: string }>
  });
  const [printMethod, setPrintMethod] = useState<'webserial' | 'windows' | 'escpos'>('windows');

  // Add sample items for testing
  const sampleItems = [
    { name: 'Shirt (Cotton)', price: 50 },
    { name: 'Pant (Formal)', price: 80 },
    { name: 'Saree (Silk)', price: 200 }
  ];

  const addItem = (item: typeof sampleItems[0], washType: string) => {
    const existingItem = orderData.items.find(i => i.name === item.name && i.washType === washType);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      orderData.items.push({
        ...item,
        quantity: 1,
        washType
      });
    }
    setOrderData({ ...orderData });
  };

  const removeItem = (index: number) => {
    orderData.items.splice(index, 1);
    setOrderData({ ...orderData });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Method 1: Try Web Serial (if available)
  const printViaWebSerial = async () => {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported');
      }

      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      
      // Generate ESC/POS commands
      let receipt = '\x1B\x40'; // Initialize
      receipt += '\x1B\x61\x01'; // Center align
      receipt += 'GENZ LAUNDRY\n';
      receipt += '================================\n';
      receipt += `Customer: ${orderData.customerName}\n`;
      receipt += '================================\n';
      
      orderData.items.forEach(item => {
        receipt += `${item.name} x${item.quantity}\n`;
        receipt += `${item.washType} - Rs.${item.price * item.quantity}\n`;
        receipt += '--------------------------------\n';
      });
      
      receipt += `TOTAL: Rs.${calculateTotal()}\n`;
      receipt += '================================\n';
      receipt += '\x1B\x69'; // Cut paper
      
      await writer.write(encoder.encode(receipt));
      await writer.close();
      await port.close();
      
      alert('✅ Receipt printed via Web Serial!');
    } catch (error) {
      alert(`❌ Web Serial failed: ${(error as Error).message}`);
    }
  };

  // Method 2: Use Windows Print API (works with installed printers)
  const printViaWindows = () => {
    const printContent = `
      <div style="width: 80mm; font-family: monospace; font-size: 12px;">
        <div style="text-align: center; font-weight: bold;">
          GENZ LAUNDRY
        </div>
        <div style="text-align: center; border-bottom: 1px solid black; padding-bottom: 5px;">
          123 Laundry Street, Delhi
        </div>
        <br>
        <div><strong>Customer:</strong> ${orderData.customerName}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        <div style="border-bottom: 1px solid black; margin: 10px 0;"></div>
        
        ${orderData.items.map(item => `
          <div style="display: flex; justify-content: space-between;">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
          </div>
          <div style="font-size: 10px; color: #666;">${item.washType}</div>
        `).join('')}
        
        <div style="border-top: 1px solid black; margin: 10px 0; padding-top: 5px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>TOTAL:</span>
            <span>₹${calculateTotal()}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 10px;">
          Your clothes, cared for with Gen-Z speed.<br>
          THANK YOU!
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Laundry Receipt</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { size: 80mm auto; margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Method 3: Copy ESC/POS commands (for manual printing)
  const copyESCPOSCommands = () => {
    let escpos = '\\x1B\\x40'; // Initialize
    escpos += '\\x1B\\x61\\x01'; // Center align
    escpos += 'GENZ LAUNDRY\\n';
    escpos += '================================\\n';
    escpos += `Customer: ${orderData.customerName}\\n`;
    escpos += '================================\\n';
    
    orderData.items.forEach(item => {
      escpos += `${item.name} x${item.quantity}\\n`;
      escpos += `${item.washType} - Rs.${item.price * item.quantity}\\n`;
      escpos += '--------------------------------\\n';
    });
    
    escpos += `TOTAL: Rs.${calculateTotal()}\\n`;
    escpos += '================================\\n';
    escpos += '\\x1B\\x69'; // Cut paper

    navigator.clipboard.writeText(escpos);
    alert('✅ ESC/POS commands copied to clipboard!\n\nPaste these into your thermal printer software.');
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🖨️ Hybrid Printing Solution
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Works with your Windows-connected SP POS891US printer
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Order Creation */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>📝 Create Order</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Customer Name:
            </label>
            <input
              type="text"
              value={orderData.customerName}
              onChange={(e) => setOrderData({ ...orderData, customerName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px'
              }}
              placeholder="Enter customer name"
            />
          </div>

          <h4>Add Items:</h4>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
            {sampleItems.map((item, index) => (
              <div key={index} style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold' }}>{item.name} - ₹{item.price}</div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <button onClick={() => addItem(item, 'WASH')} style={{
                    padding: '5px 10px', background: '#007bff', color: 'white',
                    border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
                  }}>WASH</button>
                  <button onClick={() => addItem(item, 'IRON')} style={{
                    padding: '5px 10px', background: '#28a745', color: 'white',
                    border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
                  }}>IRON</button>
                  <button onClick={() => addItem(item, 'WASH+IRON')} style={{
                    padding: '5px 10px', background: '#ffc107', color: 'black',
                    border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
                  }}>BOTH</button>
                  <button onClick={() => addItem(item, 'DRY CLEAN')} style={{
                    padding: '5px 10px', background: '#dc3545', color: 'white',
                    border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'
                  }}>DRY</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Printing */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>🧾 Order Summary</h3>
          
          <div style={{ marginBottom: '20px', minHeight: '200px' }}>
            {orderData.items.length === 0 ? (
              <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '50px 0' }}>
                No items added yet
              </div>
            ) : (
              orderData.items.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{item.name} x{item.quantity}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.washType}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                    <button onClick={() => removeItem(index)} style={{
                      background: '#dc3545', color: 'white', border: 'none',
                      borderRadius: '3px', padding: '2px 6px', cursor: 'pointer'
                    }}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{
            borderTop: '2px solid #333',
            paddingTop: '10px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'right'
          }}>
            TOTAL: ₹{calculateTotal()}
          </div>

          <h4 style={{ marginTop: '30px' }}>🖨️ Printing Options:</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={printViaWindows}
              disabled={orderData.items.length === 0}
              style={{
                padding: '15px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: orderData.items.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: orderData.items.length === 0 ? 0.5 : 1
              }}
            >
              🖨️ Print via Windows (Recommended)
            </button>

            <button
              onClick={printViaWebSerial}
              disabled={orderData.items.length === 0}
              style={{
                padding: '15px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: orderData.items.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: orderData.items.length === 0 ? 0.5 : 1
              }}
            >
              🔌 Try Web Serial Connection
            </button>

            <button
              onClick={copyESCPOSCommands}
              disabled={orderData.items.length === 0}
              style={{
                padding: '15px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: orderData.items.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: orderData.items.length === 0 ? 0.5 : 1
              }}
            >
              📋 Copy ESC/POS Commands
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            <strong>💡 How it works:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li><strong>Windows Print:</strong> Uses your installed "80mm Series Printer"</li>
              <li><strong>Web Serial:</strong> Direct connection (if permissions allow)</li>
              <li><strong>ESC/POS:</strong> Copy commands to thermal printer software</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridPrintingSolution;