// Thermal Printer Utilities for GenZ Laundry POS

export const optimizeForThermalPrint = () => {
  // Remove any existing print styles
  const existingStyles = document.querySelectorAll('style[data-thermal-print]');
  existingStyles.forEach(style => style.remove());

  // Ultra-aggressive thermal print styles
  const thermalCSS = `
    @media print {
      /* Force page dimensions */
      @page {
        size: 80mm auto !important;
        margin: 0mm !important;
        padding: 0mm !important;
        border: none !important;
      }
      
      /* Reset everything aggressively */
      *, *::before, *::after {
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        box-sizing: border-box !important;
        background: transparent !important;
        color: black !important;
        font-family: 'Courier New', monospace !important;
        font-size: 8pt !important;
        line-height: 1 !important;
        text-decoration: none !important;
        text-shadow: none !important;
        box-shadow: none !important;
        outline: none !important;
      }
      
      /* Body and HTML reset */
      html {
        width: 80mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      body {
        width: 80mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
        font-family: 'Courier New', monospace !important;
        font-size: 8pt !important;
        line-height: 1 !important;
        overflow: hidden !important;
      }
      
      /* Hide everything except thermal content */
      body * {
        visibility: hidden !important;
        display: none !important;
      }
      
      .thermal-receipt, .thermal-receipt * {
        visibility: visible !important;
        display: block !important;
      }
      
      /* Thermal receipt container */
      .thermal-receipt {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 80mm !important;
        max-width: 80mm !important;
        height: auto !important;
        margin: 0 !important;
        padding: 1mm !important;
        background: white !important;
        color: black !important;
        font-family: 'Courier New', monospace !important;
        font-size: 8pt !important;
        line-height: 1.1 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: visible !important;
      }
      
      /* Text elements */
      .thermal-receipt h1 { font-size: 12pt !important; font-weight: bold !important; }
      .thermal-receipt h2 { font-size: 10pt !important; font-weight: bold !important; }
      .thermal-receipt .text-sm { font-size: 7pt !important; }
      .thermal-receipt .text-xs { font-size: 6pt !important; }
      
      /* Spacing control */
      .thermal-receipt > * {
        margin-bottom: 1mm !important;
      }
      
      .thermal-receipt > *:last-child {
        margin-bottom: 0 !important;
      }
      
      /* Borders for thermal */
      .thermal-receipt .border-t,
      .thermal-receipt .border-b,
      .thermal-receipt .border-y {
        border-color: black !important;
        border-style: solid !important;
        border-width: 1px !important;
      }
      
      .thermal-receipt .border-t-2,
      .thermal-receipt .border-b-2,
      .thermal-receipt .border-y-2 {
        border-color: black !important;
        border-style: solid !important;
        border-width: 2px !important;
      }
      
      /* Flex layouts */
      .thermal-receipt .flex {
        display: flex !important;
      }
      
      .thermal-receipt .justify-between {
        justify-content: space-between !important;
      }
      
      .thermal-receipt .text-center {
        text-align: center !important;
      }
      
      .thermal-receipt .text-left {
        text-align: left !important;
      }
      
      .thermal-receipt .text-right {
        text-align: right !important;
      }
      
      .thermal-receipt .font-bold {
        font-weight: bold !important;
      }
      
      .thermal-receipt .uppercase {
        text-transform: uppercase !important;
      }
      
      /* Remove any transforms or effects */
      .thermal-receipt * {
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  // Add the styles to document
  const style = document.createElement('style');
  style.setAttribute('data-thermal-print', 'true');
  style.textContent = thermalCSS;
  document.head.appendChild(style);

  return style;
};

export const printThermalReceipt = () => {
  // Get the receipt content
  const printSection = document.getElementById('print-section');
  if (!printSection) return;

  // Create a new window for thermal printing
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  if (!printWindow) return;

  // Get receipt HTML content
  const receiptContent = printSection.innerHTML;

  // Create minimal HTML for thermal printing
  const thermalHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Thermal Receipt</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
          padding: 0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          width: 80mm;
          margin: 0;
          padding: 1mm;
          font-family: 'Courier New', monospace;
          font-size: 8pt;
          line-height: 1.1;
          background: white;
          color: black;
        }
        
        .thermal-content {
          width: 100%;
          max-width: 78mm;
        }
        
        .thermal-content h1 { font-size: 12pt; font-weight: bold; margin: 0; }
        .thermal-content .text-sm { font-size: 7pt; }
        .thermal-content .text-xs { font-size: 6pt; }
        .thermal-content .border-t { border-top: 1px solid black; }
        .thermal-content .border-b { border-bottom: 1px solid black; }
        .thermal-content .border-t-2 { border-top: 2px solid black; }
        .thermal-content .border-b-2 { border-bottom: 2px solid black; }
        .thermal-content .border-y { border-top: 1px solid black; border-bottom: 1px solid black; }
        .thermal-content .border-y-2 { border-top: 2px solid black; border-bottom: 2px solid black; }
        .thermal-content .flex { display: flex; }
        .thermal-content .justify-between { justify-content: space-between; }
        .thermal-content .text-center { text-align: center; }
        .thermal-content .text-left { text-align: left; }
        .thermal-content .text-right { text-align: right; }
        .thermal-content .font-bold { font-weight: bold; }
        .thermal-content .font-black { font-weight: 900; }
        .thermal-content .uppercase { text-transform: uppercase; }
        .thermal-content .mb-1 { margin-bottom: 1mm; }
        .thermal-content .mb-2 { margin-bottom: 2mm; }
        .thermal-content .mt-2 { margin-top: 2mm; }
        .thermal-content .mt-3 { margin-top: 3mm; }
        .thermal-content .pt-1 { padding-top: 1mm; }
        .thermal-content .pt-2 { padding-top: 2mm; }
        .thermal-content .pb-1 { padding-bottom: 1mm; }
        .thermal-content .py-0 { padding-top: 0; padding-bottom: 0; }
        .thermal-content .py-1 { padding-top: 1mm; padding-bottom: 1mm; }
        .thermal-content .my-1 { margin-top: 1mm; margin-bottom: 1mm; }
        .thermal-content .space-y-0 > * + * { margin-top: 0; }
        .thermal-content .w-1\\/2 { width: 50%; }
        .thermal-content .w-1\\/4 { width: 25%; }
        .thermal-content .pr-1 { padding-right: 1mm; }
        .thermal-content .truncate { 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap; 
        }
        .thermal-content .text-red-600 { color: #dc2626; }
        .thermal-content .opacity-50 { opacity: 0.5; }
        .thermal-content .leading-tight { line-height: 1.1; }
        .thermal-content .text-\\[8pt\\] { font-size: 8pt; }
        .thermal-content .text-\\[9pt\\] { font-size: 9pt; }
        .thermal-content .text-\\[6pt\\] { font-size: 6pt; }
        .thermal-content .border-dotted { border-style: dotted; }
        .thermal-content .border-gray-400 { border-color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="thermal-content">
        ${receiptContent}
      </div>
    </body>
    </html>
  `;

  // Write content to new window
  printWindow.document.write(thermalHTML);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

export const getThermalPrintInstructions = () => {
  return `🖨️ THERMAL PRINTER SOLUTIONS FOR SP-POS893UED:

📋 METHOD 1: BROWSER PRINT (Improved)
• Paper Size: 80mm (or Custom: 80mm x Auto)
• Margins: Set to 0 or None
• Scale: 100% (Disable "Fit to page")
• Orientation: Portrait
• Print Backgrounds: Enable if available
• Browser: Use Chrome or Edge

📋 METHOD 2: ESC/POS DIRECT (Recommended)
• Click "ESC/POS DIRECT" button
• Commands will be copied to clipboard
• Paste into thermal printer software like:
  - PrintNode
  - Thermal Printer Driver
  - POS Printer Utility
• This bypasses browser limitations completely!

🔧 WINDOWS THERMAL PRINTER SETUP:
1. Install SP-POS893UED driver from manufacturer
2. Set as default printer
3. Configure paper size to 80mm in printer properties
4. Test with Windows Notepad first

⚡ TROUBLESHOOTING BLANK SPACE:
• Browser Print: Check margins are exactly 0mm
• ESC/POS Direct: Use dedicated thermal software
• Driver Issue: Reinstall printer driver
• Paper Feed: Check thermal paper roll alignment

💡 BEST PRACTICE:
Use ESC/POS Direct method for production use - it eliminates browser print limitations and gives you perfect thermal receipts every time!

🎯 QUICK TEST:
1. Click "TEST" button to verify setup
2. Should print compact receipt with no blank space
3. If still issues, use ESC/POS Direct method`;
};

// ESC/POS Direct Printing (Advanced Option)
export const generateESCPOSCommands = (receiptData: {
  shopName: string;
  address: string;
  contact: string;
  customerName: string;
  orderId: string;
  items: Array<{name: string, quantity: number, price: number}>;
  subtotal: number;
  discount: number;
  total: number;
}) => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  let commands = '';
  
  // Initialize printer and set compact mode
  commands += ESC + '@'; // Initialize printer
  commands += ESC + 'M' + '\x01'; // Select font A (compact)
  commands += ESC + '3' + '\x18'; // Set line spacing to 24/180 inch (compact)
  
  // Header (Center aligned)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += ESC + '!' + '\x18'; // Double height + bold
  commands += receiptData.shopName + '\n';
  commands += ESC + '!' + '\x00'; // Normal text
  commands += receiptData.address + '\n';
  commands += 'Ph: ' + receiptData.contact + '\n';
  
  // Separator line
  commands += ESC + 'a' + '\x00'; // Left align
  commands += '================================\n';
  
  // Order info (compact)
  commands += 'CUST: ' + receiptData.customerName + '\n';
  commands += 'ORDER: ' + receiptData.orderId + '\n';
  commands += 'DATE: ' + new Date().toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + '\n';
  commands += '================================\n';
  
  // Items header
  commands += 'ITEM'.padEnd(16) + 'QTY'.padStart(4) + 'PRICE'.padStart(8) + '\n';
  commands += '--------------------------------\n';
  
  // Items (compact formatting)
  receiptData.items.forEach(item => {
    const itemName = item.name.length > 16 ? item.name.substring(0, 16) : item.name.padEnd(16);
    const qty = item.quantity.toString().padStart(4);
    const price = ('₹' + (item.price * item.quantity)).padStart(8);
    commands += itemName + qty + price + '\n';
  });
  
  commands += '--------------------------------\n';
  
  // Totals (compact)
  commands += ('Subtotal: ₹' + receiptData.subtotal).padStart(32) + '\n';
  if (receiptData.discount > 0) {
    commands += ('Discount: -₹' + receiptData.discount).padStart(32) + '\n';
  }
  commands += '================================\n';
  commands += ESC + '!' + '\x08'; // Bold
  commands += ('TOTAL: ₹' + receiptData.total).padStart(32) + '\n';
  commands += ESC + '!' + '\x00'; // Normal
  commands += '================================\n';
  
  // Footer (minimal spacing)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += 'Your clothes, cared for with Gen-Z speed.\n';
  commands += ESC + '!' + '\x08'; // Bold
  commands += 'THANK YOU!\n';
  commands += ESC + '!' + '\x00'; // Normal
  
  // Minimal spacing before cut
  commands += '\n'; // Just one line feed
  
  // Multiple cut commands for reliability
  commands += GS + 'V' + '\x41' + '\x03'; // Partial cut (3 dots)
  commands += GS + 'V' + '\x42' + '\x00'; // Full cut
  commands += ESC + 'm'; // Partial cut (alternative command)
  
  // Feed and cut (SP-POS893UED specific)
  commands += ESC + 'd' + '\x02'; // Feed 2 lines
  commands += ESC + 'i'; // Immediate cut
  
  return commands;
};

// Copy ESC/POS commands to clipboard for direct printer software
export const copyESCPOSToClipboard = (receiptData: any) => {
  const commands = generateESCPOSCommands(receiptData);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(commands).then(() => {
      alert('ESC/POS commands copied to clipboard!\n\nPaste these into your thermal printer software for direct printing without browser limitations.');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = commands;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('ESC/POS commands copied to clipboard!');
  }
};