// OPTIMIZED ESC/POS COMMANDS FOR SP-POS893UED
// Eliminates paper waste and ensures proper cutting

export const generateSP_POS893UED_Commands = (receiptData: {
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
  const LF = '\n';
  
  let commands = '';
  
  // SP-POS893UED specific initialization
  commands += ESC + '@'; // Initialize printer
  commands += ESC + 'R' + '\x00'; // Select international character set
  commands += ESC + 't' + '\x00'; // Select character code table
  commands += ESC + 'M' + '\x00'; // Select font A (12x24)
  commands += ESC + '3' + '\x14'; // Set line spacing to 20/180 inch (compact)
  
  // Header (Center aligned, compact)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += ESC + '!' + '\x18'; // Double height + bold
  commands += receiptData.shopName + LF;
  commands += ESC + '!' + '\x00'; // Normal text
  commands += receiptData.address + LF;
  commands += 'Ph: ' + receiptData.contact + LF;
  
  // Separator
  commands += ESC + 'a' + '\x00'; // Left align
  commands += '================================' + LF;
  
  // Order info (compact)
  commands += 'CUST: ' + receiptData.customerName + LF;
  commands += 'ORDER: ' + receiptData.orderId + LF;
  commands += 'DATE: ' + new Date().toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + LF;
  commands += '================================' + LF;
  
  // Items header
  commands += 'ITEM'.padEnd(16) + 'QTY'.padStart(4) + 'PRICE'.padStart(8) + LF;
  commands += '--------------------------------' + LF;
  
  // Items
  receiptData.items.forEach(item => {
    const itemName = item.name.length > 16 ? item.name.substring(0, 16) : item.name.padEnd(16);
    const qty = item.quantity.toString().padStart(4);
    const price = ('₹' + (item.price * item.quantity)).padStart(8);
    commands += itemName + qty + price + LF;
  });
  
  commands += '--------------------------------' + LF;
  
  // Totals
  commands += ('Subtotal: ₹' + receiptData.subtotal).padStart(32) + LF;
  if (receiptData.discount > 0) {
    commands += ('Discount: -₹' + receiptData.discount).padStart(32) + LF;
  }
  commands += '================================' + LF;
  commands += ESC + '!' + '\x08'; // Bold
  commands += ('TOTAL: ₹' + receiptData.total).padStart(32) + LF;
  commands += ESC + '!' + '\x00'; // Normal
  commands += '================================' + LF;
  
  // Footer (minimal)
  commands += ESC + 'a' + '\x01'; // Center align
  commands += 'Your clothes, cared for with Gen-Z speed.' + LF;
  commands += ESC + '!' + '\x08'; // Bold
  commands += 'THANK YOU!' + LF;
  commands += ESC + '!' + '\x00'; // Normal
  
  // SP-POS893UED specific cutting sequence
  commands += ESC + 'd' + '\x01'; // Feed 1 line only
  commands += GS + 'V' + '\x41' + '\x02'; // Partial cut with 2 dots remaining
  commands += ESC + 'm'; // Partial cut (alternative)
  commands += GS + 'V' + '\x00'; // Full cut (if partial cut fails)
  
  return commands;
};

// Generate ultra-compact version (minimal paper waste)
export const generateCompactReceipt = (receiptData: any) => {
  const ESC = '\x1B';
  const GS = '\x1D';
  
  let commands = '';
  
  // Ultra-compact initialization
  commands += ESC + '@'; // Initialize
  commands += ESC + 'M' + '\x01'; // Select font B (9x17, smaller)
  commands += ESC + '3' + '\x10'; // Minimal line spacing
  
  // Compact header
  commands += ESC + 'a' + '\x01'; // Center
  commands += ESC + '!' + '\x10'; // Bold only (no double height)
  commands += receiptData.shopName + '\n';
  commands += ESC + '!' + '\x00'; // Normal
  commands += receiptData.address + '\n';
  commands += receiptData.contact + '\n';
  
  // Compact body
  commands += ESC + 'a' + '\x00'; // Left align
  commands += '================================\n';
  commands += receiptData.customerName + ' | ' + receiptData.orderId + '\n';
  commands += new Date().toLocaleString('en-IN', { 
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
  }) + '\n';
  commands += '================================\n';
  
  // Compact items
  receiptData.items.forEach((item: any) => {
    commands += item.name.substring(0, 20).padEnd(20) + 
               item.quantity.toString().padStart(2) + 
               ('₹' + (item.price * item.quantity)).padStart(6) + '\n';
  });
  
  // Compact totals
  commands += '--------------------------------\n';
  commands += ('TOTAL: ₹' + receiptData.total).padStart(32) + '\n';
  commands += '================================\n';
  commands += ESC + 'a' + '\x01'; // Center
  commands += 'THANK YOU!\n';
  
  // Immediate cut (no extra feeds)
  commands += GS + 'V' + '\x42' + '\x00'; // Full cut immediately
  
  return commands;
};

// Copy optimized commands to clipboard
export const copyOptimizedESCPOS = (receiptData: any) => {
  const commands = generateSP_POS893UED_Commands(receiptData);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(commands).then(() => {
      alert('✅ OPTIMIZED ESC/POS COMMANDS COPIED!\n\n🎯 SP-POS893UED OPTIMIZED:\n• Minimal paper waste\n• Proper cutting\n• Compact spacing\n• Professional appearance\n\nPaste into your thermal printer software for perfect results!');
    });
  } else {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = commands;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Optimized commands copied to clipboard!');
  }
};

// Copy ultra-compact version
export const copyCompactESCPOS = (receiptData: any) => {
  const commands = generateCompactReceipt(receiptData);
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(commands).then(() => {
      alert('✅ ULTRA-COMPACT COMMANDS COPIED!\n\n🎯 MINIMAL PAPER WASTE:\n• Smallest possible receipt\n• Immediate cutting\n• Essential info only\n\nPerfect for high-volume operations!');
    });
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = commands;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('✅ Compact commands copied!');
  }
};