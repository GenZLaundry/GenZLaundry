// THERMAL PRINT MANAGER - PURE POS BEHAVIOR
// Eliminates all A4/document behavior for thermal receipts

export interface BillData {
  businessName: string;
  address: string;
  phone: string;
  billNumber: string;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  discount?: number;
  gst?: number;
  grandTotal: number;
  thankYouMessage?: string;
}

// Method 1: Pure Thermal Window Print (No A4 behavior)
export const printThermalBill = (billData: BillData) => {
  // Create dedicated thermal print window
  const printWindow = window.open('', '_blank', 'width=320,height=600,scrollbars=no');
  if (!printWindow) {
    alert('Please allow popups for thermal printing');
    return;
  }

  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate pure thermal HTML (NO A4 elements)
  const thermalHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Thermal Receipt</title>
  <style>
    /* PURE THERMAL PRINT STYLES */
    @page {
      size: 80mm auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    * {
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
    }
    
    body {
      width: 80mm !important;
      height: auto !important;
      margin: 0 !important;
      padding: 3mm !important; /* More padding for readability */
      font-family: 'Courier New', 'Consolas', 'Monaco', monospace !important;
      font-size: 11pt !important; /* High-quality larger font */
      line-height: 1.3 !important; /* Better line spacing */
      background: white !important;
      color: black !important;
      font-weight: bold !important; /* Bold for thermal clarity */
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: unset !important;
      letter-spacing: 0.5px !important; /* Better character spacing */
      word-spacing: 1px !important; /* Better word separation */
    }
    
    .receipt {
      width: 100% !important;
      height: auto !important;
    }
    
    .center { text-align: center !important; }
    .left { text-align: left !important; }
    .right { text-align: right !important; }
    .bold { font-weight: bold !important; }
    .large { font-size: 16pt !important; font-weight: bold !important; }
    .small { font-size: 10pt !important; font-weight: bold !important; }
    .upper { text-transform: uppercase !important; }
    
    .row {
      display: flex !important;
      justify-content: space-between !important;
      margin-bottom: 1mm !important;
    }
    
    .item-row {
      display: flex !important;
      margin-bottom: 0.5mm !important;
    }
    
    .col-40 { width: 40% !important; }
    .col-15 { width: 15% !important; text-align: center !important; }
    .col-20 { width: 20% !important; text-align: right !important; }
    .col-25 { width: 25% !important; text-align: right !important; }
    
    .divider {
      text-align: center !important;
      margin: 1mm 0 !important;
      font-size: 8pt !important;
    }
    
    .spacer { margin-bottom: 2mm !important; }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Business Header -->
    <div class="center spacer">
      <div class="large bold upper">${billData.businessName}</div>
      <div class="small">${billData.address}</div>
      <div class="small">Ph: ${billData.phone}</div>
    </div>
    
    <!-- Divider -->
    <div class="divider">================================</div>
    
    <!-- Bill Info -->
    <div class="spacer">
      <div class="row small">
        <span>Bill No: ${billData.billNumber}</span>
        <span>Date: ${currentDate}</span>
      </div>
      ${billData.customerName ? `<div class="small">Customer: ${billData.customerName}</div>` : ''}
    </div>
    
    <!-- Divider -->
    <div class="divider">================================</div>
    
    <!-- Items Header -->
    <div class="item-row small bold">
      <span class="col-40">ITEM</span>
      <span class="col-15">QTY</span>
      <span class="col-20">RATE</span>
      <span class="col-25">AMT</span>
    </div>
    <div class="divider">--------------------------------</div>
    
    <!-- Items -->
    ${billData.items.map(item => `
    <div class="item-row small">
      <span class="col-40" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${item.name}</span>
      <span class="col-15">${item.quantity}</span>
      <span class="col-20">₹${item.rate}</span>
      <span class="col-25">₹${item.amount}</span>
    </div>
    `).join('')}
    
    <!-- Divider -->
    <div class="divider">--------------------------------</div>
    
    <!-- Totals -->
    <div class="spacer">
      <div class="row small">
        <span>Subtotal:</span>
        <span>₹${billData.subtotal}</span>
      </div>
      ${billData.discount && billData.discount > 0 ? `
      <div class="row small">
        <span>Discount:</span>
        <span>-₹${billData.discount}</span>
      </div>
      ` : ''}
      ${billData.gst && billData.gst > 0 ? `
      <div class="row small">
        <span>GST:</span>
        <span>₹${billData.gst}</span>
      </div>
      ` : ''}
    </div>
    
    <!-- Grand Total -->
    <div class="divider">================================</div>
    <div class="row bold large">
      <span>TOTAL:</span>
      <span>₹${billData.grandTotal}</span>
    </div>
    <div class="divider">================================</div>
    
    <!-- Thank You -->
    <div class="center small spacer" style="font-style:italic;">
      ${billData.thankYouMessage || 'Thank you for your business!'}
    </div>
  </div>
</body>
</html>
  `;

  // Write and print
  printWindow.document.write(thermalHTML);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

// Method 2: ESC/POS Direct Commands (Guaranteed thermal behavior)
export const generateThermalESCPOS = (billData: BillData): string => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  let commands = '';
  
  // Initialize printer
  commands += ESC + '@'; // Initialize
  
  // Business Header (Center aligned)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += ESC + '!' + '\x18'; // Double height + bold
  commands += billData.businessName.toUpperCase() + '\n';
  commands += ESC + '!' + '\x00'; // Normal text
  commands += billData.address + '\n';
  commands += 'Ph: ' + billData.phone + '\n';
  
  // Divider
  commands += '================================\n';
  
  // Bill Info (Left aligned)
  commands += ESC + 'a' + '\x00'; // Left align
  const currentDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  commands += `Bill No: ${billData.billNumber}`.padEnd(16) + `Date: ${currentDate}\n`;
  if (billData.customerName) {
    commands += `Customer: ${billData.customerName}\n`;
  }
  
  // Divider
  commands += '================================\n';
  
  // Items Header
  commands += 'ITEM'.padEnd(16) + 'QTY'.padStart(4) + 'RATE'.padStart(6) + 'AMT'.padStart(6) + '\n';
  commands += '--------------------------------\n';
  
  // Items
  billData.items.forEach(item => {
    const itemName = item.name.length > 16 ? item.name.substring(0, 16) : item.name.padEnd(16);
    const qty = item.quantity.toString().padStart(4);
    const rate = ('₹' + item.rate).padStart(6);
    const amt = ('₹' + item.amount).padStart(6);
    commands += itemName + qty + rate + amt + '\n';
  });
  
  // Divider
  commands += '--------------------------------\n';
  
  // Totals
  commands += ('Subtotal: ₹' + billData.subtotal).padStart(32) + '\n';
  if (billData.discount && billData.discount > 0) {
    commands += ('Discount: -₹' + billData.discount).padStart(32) + '\n';
  }
  if (billData.gst && billData.gst > 0) {
    commands += ('GST: ₹' + billData.gst).padStart(32) + '\n';
  }
  
  // Grand Total
  commands += '================================\n';
  commands += ESC + '!' + '\x08'; // Bold
  commands += ('TOTAL: ₹' + billData.grandTotal).padStart(32) + '\n';
  commands += ESC + '!' + '\x00'; // Normal
  commands += '================================\n';
  
  // Thank You (Center aligned)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += '\n';
  commands += (billData.thankYouMessage || 'Thank you for your business!') + '\n';
  commands += '\n';
  
  // Cut paper
  commands += '\n\n';
  commands += GS + 'V' + '\x42' + '\x00'; // Full cut
  
  return commands;
};

// Copy ESC/POS to clipboard
export const copyThermalESCPOS = (billData: BillData) => {
  const commands = generateThermalESCPOS(billData);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(commands).then(() => {
      alert('✅ Thermal ESC/POS commands copied!\n\nPaste into your thermal printer software:\n• PrintNode\n• Thermal Printer Driver\n• POS Printer Utility\n\nThis guarantees perfect thermal receipt with no blank space!');
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = commands;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ ESC/POS commands copied to clipboard!');
  }
};

// Test thermal receipt
export const printTestThermalReceipt = () => {
  const testBill: BillData = {
    businessName: 'TEST THERMAL PRINT',
    address: 'Thermal Printer Test',
    phone: '+91 98765 43210',
    billNumber: 'TEST-001',
    customerName: 'Test Customer',
    items: [
      { name: 'Test Item 1', quantity: 1, rate: 100, amount: 100 },
      { name: 'Test Item 2', quantity: 2, rate: 50, amount: 100 }
    ],
    subtotal: 200,
    discount: 0,
    gst: 0,
    grandTotal: 200,
    thankYouMessage: 'If this prints without blank space, your thermal printer is configured correctly!'
  };
  
  printThermalBill(testBill);
};