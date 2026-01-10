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
    const currentDate = new Date();
    const billNumber = `GenZ-${currentDate.getFullYear().toString().slice(-2)}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const dateStr = currentDate.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
    const timeStr = currentDate.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const subtotal = calculateTotal();
    const gst = Math.round(subtotal * 0.18); // 18% GST
    const discount = Math.round(subtotal * 0.05); // 5% discount
    const finalTotal = subtotal + gst - discount;

    const printContent = `
      <div style="width: 80mm; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.2; margin: 0; padding: 8px;">
        
        <!-- Header with Logo Area -->
        <div style="text-align: center; margin-bottom: 8px;">
          <div style="font-size: 18px; font-weight: bold; letter-spacing: 2px; margin-bottom: 2px;">
            ✨ GENZ LAUNDRY ✨
          </div>
          <div style="font-size: 9px; color: #666; margin-bottom: 1px;">
            Premium Laundry & Dry Cleaning Services
          </div>
          <div style="font-size: 9px; color: #666; margin-bottom: 1px;">
            📍 123 Laundry Street, Delhi - 110001
          </div>
          <div style="font-size: 9px; color: #666; margin-bottom: 1px;">
            📞 +91 98765 43210 | 🌐 genzlaundry.com
          </div>
          <div style="font-size: 8px; color: #666;">
            GST No: 07AABCU9603R1ZX | FSSAI: 12345678901234
          </div>
        </div>

        <!-- Decorative Border -->
        <div style="text-align: center; font-size: 8px; margin: 4px 0;">
          ═══════════════════════════════════════════
        </div>

        <!-- Bill Details -->
        <div style="margin: 6px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="font-weight: bold;">📋 BILL NO:</span>
            <span style="font-weight: bold;">${billNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>👤 CUSTOMER:</span>
            <span style="text-transform: uppercase; font-weight: bold;">${orderData.customerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>📅 DATE:</span>
            <span>${dateStr}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🕐 TIME:</span>
            <span>${timeStr}</span>
          </div>
        </div>

        <!-- Items Header -->
        <div style="text-align: center; font-size: 8px; margin: 6px 0;">
          ═══════════════════════════════════════════
        </div>
        
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 9px; margin-bottom: 3px; border-bottom: 1px dashed #333; padding-bottom: 2px;">
          <span style="width: 50%;">ITEM DESCRIPTION</span>
          <span style="width: 15%; text-align: center;">QTY</span>
          <span style="width: 20%; text-align: right;">RATE</span>
          <span style="width: 15%; text-align: right;">AMOUNT</span>
        </div>

        <!-- Items List -->
        ${orderData.items.map((item, index) => `
          <div style="margin-bottom: 4px; font-size: 9px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="width: 50%; font-weight: bold;">${item.name}</span>
              <span style="width: 15%; text-align: center;">${item.quantity}</span>
              <span style="width: 20%; text-align: right;">₹${item.price}</span>
              <span style="width: 15%; text-align: right; font-weight: bold;">₹${item.price * item.quantity}</span>
            </div>
            <div style="font-size: 8px; color: #666; margin-left: 2px; font-style: italic;">
              🧽 Service: ${item.washType} | Item #${index + 1}
            </div>
          </div>
        `).join('')}

        <!-- Totals Section -->
        <div style="border-top: 1px dashed #333; margin: 8px 0 6px 0; padding-top: 4px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 10px;">
            <span>Subtotal (${orderData.items.length} items):</span>
            <span>₹${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 9px; color: #666;">
            <span>GST @ 18%:</span>
            <span>₹${gst}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 9px; color: #e74c3c;">
            <span>Discount (5%):</span>
            <span>-₹${discount}</span>
          </div>
          <div style="border-top: 2px solid #333; padding-top: 4px;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
              <span>💰 TOTAL PAYABLE:</span>
              <span style="background: #333; color: white; padding: 2px 6px; border-radius: 3px;">₹${finalTotal}</span>
            </div>
          </div>
        </div>

        <!-- Payment & Service Info -->
        <div style="text-align: center; font-size: 8px; margin: 6px 0; color: #666;">
          ═══════════════════════════════════════════
        </div>
        
        <div style="font-size: 9px; margin: 4px 0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>💳 Payment Mode:</span>
            <span style="font-weight: bold;">CASH</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span>📦 Ready for Pickup:</span>
            <span style="font-weight: bold; color: #27ae60;">${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>⏰ Pickup Time:</span>
            <span style="font-weight: bold;">10:00 AM - 8:00 PM</span>
          </div>
        </div>

        <!-- Terms & Conditions -->
        <div style="text-align: center; font-size: 8px; margin: 6px 0; color: #666;">
          ═══════════════════════════════════════════
        </div>
        
        <div style="font-size: 7px; color: #666; text-align: center; margin: 4px 0; line-height: 1.3;">
          <div style="margin-bottom: 2px;">📋 <strong>TERMS & CONDITIONS:</strong></div>
          <div>• Items not collected within 30 days will be donated</div>
          <div>• We are not responsible for items left in pockets</div>
          <div>• Dry clean only items processed as per fabric requirements</div>
          <div>• Color bleeding/shrinkage not guaranteed for old garments</div>
        </div>

        <!-- Footer Message -->
        <div style="text-align: center; font-size: 8px; margin: 6px 0; color: #666;">
          ═══════════════════════════════════════════
        </div>
        
        <div style="text-align: center; margin: 6px 0;">
          <div style="font-size: 11px; font-weight: bold; color: #2c3e50; margin-bottom: 2px;">
            ✨ Your clothes, cared for with Gen-Z speed! ✨
          </div>
          <div style="font-size: 8px; color: #666; margin-bottom: 2px;">
            🌟 Rate us on Google | 📱 Follow @genzlaundry
          </div>
          <div style="font-size: 8px; color: #666;">
            💚 Eco-friendly processes | 🚚 Free home pickup/delivery
          </div>
        </div>

        <!-- QR Code Area -->
        <div style="text-align: center; margin: 6px 0;">
          <div style="border: 2px dashed #666; padding: 8px; display: inline-block;">
            <div style="font-size: 8px; margin-bottom: 2px;">📱 SCAN FOR TRACKING</div>
            <div style="font-family: monospace; font-size: 6px; letter-spacing: 1px;">
              ████ ██ ████ ██ ████<br>
              ██ ████ ██ ████ ██ ██<br>
              ████ ██ ████ ██ ████<br>
            </div>
            <div style="font-size: 7px; margin-top: 2px;">Bill: ${billNumber}</div>
          </div>
        </div>

        <!-- Final Thank You -->
        <div style="text-align: center; font-size: 10px; font-weight: bold; margin: 6px 0; color: #2c3e50;">
          🙏 THANK YOU FOR CHOOSING GENZ LAUNDRY! 🙏
        </div>
        
        <div style="text-align: center; font-size: 6px; color: #999; margin-top: 4px;">
          Printed on: ${new Date().toLocaleString('en-IN')} | POS Terminal: Web-001
        </div>

      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>GenZ Laundry - Professional Receipt</title>
            <style>
              @media print {
                body { 
                  margin: 0; 
                  padding: 0;
                  font-family: 'Courier New', monospace;
                }
                @page { 
                  size: 80mm auto; 
                  margin: 0; 
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
            </style>
          </head>
          <body>
            ${printContent}
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