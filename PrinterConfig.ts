// PRINTER CONFIGURATION - TSC TL240 + SP POS891US
// Optimized settings for your specific printer models

export interface PrinterSpecs {
  // TSC TL240 Barcode Printer Specifications
  tsc: {
    model: string;
    dpi: number;
    maxWidth: number;
    maxHeight: number;
    labelSizes: Array<{ width: number; height: number; name: string }>;
    vendorId: number;
    productId?: number;
    baudRate: number;
    density: number;
    speed: number;
  };
  
  // SP POS891US Thermal Receipt Printer Specifications  
  thermal: {
    model: string;
    paperWidth: number;
    maxCharsPerLine: number;
    vendorId: number;
    productId?: number;
    baudRate: number;
    cutType: 'full' | 'partial';
    encoding: string;
  };
}

export const PRINTER_SPECS: PrinterSpecs = {
  // TSC TL240 - 203 DPI Barcode Label Printer
  tsc: {
    model: 'TSC TL240',
    dpi: 203,
    maxWidth: 108,  // 108mm max width
    maxHeight: 100, // 100mm max height
    labelSizes: [
      { width: 50, height: 30, name: 'Laundry Tag (50×30mm)' },
      { width: 40, height: 25, name: 'Small Tag (40×25mm)' },
      { width: 60, height: 40, name: 'Large Tag (60×40mm)' },
      { width: 50, height: 25, name: 'Compact Tag (50×25mm)' }
    ],
    vendorId: 0x1203, // TSC Auto ID Technology
    baudRate: 9600,
    density: 10,      // Optimal density for TL240
    speed: 4          // Optimal speed for quality
  },
  
  // SP POS891US - 80mm Thermal Receipt Printer
  thermal: {
    model: 'SP POS891US',
    paperWidth: 80,   // 80mm paper width
    maxCharsPerLine: 42, // Characters per line at normal font
    vendorId: 0x0416, // Star Micronics (common for SP series)
    baudRate: 9600,
    cutType: 'partial', // Partial cut for easy tear
    encoding: 'utf-8'
  }
};

// ESC/POS Commands optimized for SP POS891US
export const SP_POS891US_COMMANDS = {
  // Initialization
  INIT: '\x1B\x40',                    // Initialize printer
  
  // Text formatting
  NORMAL: '\x1B\x21\x00',             // Normal text
  BOLD: '\x1B\x21\x08',               // Bold text
  LARGE: '\x1B\x21\x10',              // Large text
  BOLD_LARGE: '\x1B\x21\x18',         // Bold + Large
  
  // Alignment
  ALIGN_LEFT: '\x1B\x61\x00',         // Left align
  ALIGN_CENTER: '\x1B\x61\x01',       // Center align
  ALIGN_RIGHT: '\x1B\x61\x02',        // Right align
  
  // Line spacing
  LINE_SPACING_DEFAULT: '\x1B\x32',   // Default line spacing
  LINE_SPACING_TIGHT: '\x1B\x33\x10', // Tight spacing (16/180 inch)
  
  // Paper control
  FEED_LINE: '\x0A',                  // Line feed
  FEED_LINES: (n: number) => `\x1B\x64${String.fromCharCode(n)}`, // Feed n lines
  CUT_PARTIAL: '\x1B\x69',            // Partial cut (recommended for SP POS891US)
  CUT_FULL: '\x1B\x6D',               // Full cut
  
  // Special characters
  SEPARATOR: '================================\n',
  DASHED_LINE: '--------------------------------\n',
  
  // Barcode (Code 128)
  BARCODE_128: (data: string) => `\x1D\x6B\x49${String.fromCharCode(data.length)}${data}`,
  
  // QR Code
  QR_CODE: (data: string) => {
    const qrData = `\x1D\x28\x6B\x04\x00\x31\x41\x32\x00` + // QR Code model
                   `\x1D\x28\x6B\x03\x00\x31\x43\x08` +     // Module size
                   `\x1D\x28\x6B\x03\x00\x31\x45\x30` +     // Error correction
                   `\x1D\x28\x6B${String.fromCharCode(data.length + 3, 0)}\x31\x50\x30${data}` + // Store data
                   `\x1D\x28\x6B\x03\x00\x31\x51\x30`;      // Print QR
    return qrData;
  }
};

// TSPL Commands optimized for TSC TL240
export const TSC_TL240_COMMANDS = {
  // Label setup
  setLabelSize: (width: number, height: number) => `SIZE ${width} mm, ${height} mm\r\n`,
  setSpeed: (speed: number) => `SPEED ${speed}\r\n`,
  setDensity: (density: number) => `DENSITY ${density}\r\n`,
  
  // Print control
  clearBuffer: () => 'CLS\r\n',
  print: (copies: number = 1) => `PRINT ${copies},1\r\n`,
  
  // Text commands
  text: (x: number, y: number, font: string, rotation: number, xScale: number, yScale: number, text: string) => 
    `TEXT ${x},${y},"${font}",${rotation},${xScale},${yScale},"${text}"\r\n`,
  
  // Barcode commands
  barcode128: (x: number, y: number, height: number, readable: number, narrow: number, wide: number, data: string) =>
    `BARCODE ${x},${y},"128",${height},${readable},0,${narrow},${wide},"${data}"\r\n`,
  
  // QR Code
  qrCode: (x: number, y: number, level: string, cellWidth: number, mode: string, rotation: number, data: string) =>
    `QRCODE ${x},${y},${level},${cellWidth},${mode},${rotation},"${data}"\r\n`,
  
  // Graphics
  box: (x1: number, y1: number, x2: number, y2: number, thickness: number) =>
    `BOX ${x1},${y1},${x2},${y2},${thickness}\r\n`,
  
  line: (x1: number, y1: number, x2: number, y2: number, thickness: number) =>
    `BAR ${x1},${y1},${x2},${y2}\r\n`
};

// Printer connection settings
export const CONNECTION_SETTINGS = {
  tsc: {
    filters: [
      { usbVendorId: 0x1203 }, // TSC Auto ID Technology
      { usbVendorId: 0x0471 }, // TSC alternative VID
    ],
    serialOptions: {
      baudRate: 9600,
      dataBits: 8 as const,
      stopBits: 1 as const,
      parity: 'none' as const,
      flowControl: 'none' as const
    }
  },
  
  thermal: {
    filters: [
      { usbVendorId: 0x0416 }, // Star Micronics
      { usbVendorId: 0x04B8 }, // Epson
      { usbVendorId: 0x154F }, // Generic thermal
    ],
    serialOptions: {
      baudRate: 9600,
      dataBits: 8 as const,
      stopBits: 1 as const,
      parity: 'none' as const,
      flowControl: 'none' as const
    }
  }
};

// Label templates for different use cases
export const LABEL_TEMPLATES = {
  laundryTag: {
    width: 50,
    height: 30,
    elements: {
      businessName: { x: 8, y: 8, font: '2', size: { x: 1, y: 1 } },
      billNumber: { x: 320, y: 8, font: '1', size: { x: 1, y: 1 } },
      customerName: { x: 8, y: 40, font: '1', size: { x: 1, y: 1 } },
      itemName: { x: 8, y: 80, font: '3', size: { x: 1, y: 1 } },
      washType: { x: 8, y: 200, font: '1', size: { x: 1, y: 1 } },
      tagCounter: { x: 320, y: 200, font: '2', size: { x: 1, y: 1 } },
      barcode: { x: 280, y: 60, height: 60, narrow: 2, wide: 2 },
      border: { x1: 4, y1: 4, x2: 396, y2: 236, thickness: 2 }
    }
  }
};

// Receipt templates for different layouts
export const RECEIPT_TEMPLATES = {
  standard: {
    width: 42, // Characters per line
    sections: {
      header: { align: 'center', font: 'bold_large' },
      business: { align: 'center', font: 'normal' },
      separator: { char: '=', length: 42 },
      customer: { align: 'left', font: 'normal' },
      items: { align: 'left', font: 'normal' },
      totals: { align: 'right', font: 'bold' },
      footer: { align: 'center', font: 'normal' }
    }
  }
};

export default {
  PRINTER_SPECS,
  SP_POS891US_COMMANDS,
  TSC_TL240_COMMANDS,
  CONNECTION_SETTINGS,
  LABEL_TEMPLATES,
  RECEIPT_TEMPLATES
};