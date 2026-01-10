// DIRECT USB THERMAL PRINTER - IMMEDIATE PRINTING
// No print dialogs, no browser limitations - pure POS behavior

// Web Serial API types
interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream | null;
  writable: WritableStream | null;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: 'none' | 'even' | 'odd';
  flowControl?: 'none' | 'hardware';
}

interface Navigator {
  serial: {
    requestPort(options?: { filters?: Array<{ usbVendorId?: number }> }): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

export interface USBPrinterConfig {
  vendorId?: number;
  productId?: number;
  baudRate?: number;
}

export class DirectUSBThermalPrinter {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private isConnected: boolean = false;

  // Common thermal printer configurations
  private static readonly PRINTER_CONFIGS = {
    'SP-POS893UED': { vendorId: 0x0416, productId: 0x5011, baudRate: 9600 },
    'EPSON_TM': { vendorId: 0x04b8, productId: 0x0202, baudRate: 9600 },
    'GENERIC_80MM': { baudRate: 9600 }
  };

  // ESC/POS Commands
  private static readonly ESC = '\x1B';
  private static readonly GS = '\x1D';
  private static readonly LF = '\n';
  private static readonly CR = '\r';

  constructor(private config: USBPrinterConfig = {}) {
    this.config = { baudRate: 9600, ...config };
  }

  // Connect to USB thermal printer
  async connectUSB(): Promise<boolean> {
    try {
      // Check if Web Serial API is supported
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported. Use Chrome/Edge with HTTPS.');
      }

      // Request serial port access
      this.port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x0416 }, // SP-POS893UED
          { usbVendorId: 0x04b8 }, // Epson
          { usbVendorId: 0x067b }, // Prolific (common USB-Serial)
        ]
      });

      // Open the port
      await this.port.open({ 
        baudRate: this.config.baudRate || 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      // Get writer for sending data
      this.writer = this.port.writable?.getWriter() || null;
      this.isConnected = true;

      // Initialize printer
      await this.initializePrinter();

      console.log('✅ USB Thermal Printer Connected');
      return true;

    } catch (error) {
      console.error('❌ USB Printer Connection Failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Initialize thermal printer
  private async initializePrinter(): Promise<void> {
    if (!this.writer) return;

    const commands = [
      DirectUSBThermalPrinter.ESC + '@', // Initialize printer
      DirectUSBThermalPrinter.ESC + 't' + '\x00', // Select character code table
      DirectUSBThermalPrinter.ESC + 'R' + '\x00', // Select international character set
    ].join('');

    await this.sendRawData(commands);
  }

  // Send raw data to printer
  private async sendRawData(data: string): Promise<void> {
    if (!this.writer || !this.isConnected) {
      throw new Error('Printer not connected');
    }

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(data);
    await this.writer.write(uint8Array);
  }

  // Print thermal receipt immediately
  async printReceipt(billData: {
    businessName: string;
    address: string;
    phone: string;
    billNumber: string;
    customerName?: string;
    items: Array<{name: string, quantity: number, rate: number, amount: number}>;
    subtotal: number;
    discount?: number;
    gst?: number;
    grandTotal: number;
    thankYouMessage?: string;
  }): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Printer not connected. Connect USB first.');
      }

      const receipt = this.generateThermalReceipt(billData);
      await this.sendRawData(receipt);
      
      console.log('✅ Receipt printed successfully');
      return true;

    } catch (error) {
      console.error('❌ Print failed:', error);
      return false;
    }
  }

  // Generate thermal receipt with ESC/POS commands
  private generateThermalReceipt(billData: any): string {
    const ESC = DirectUSBThermalPrinter.ESC;
    const GS = DirectUSBThermalPrinter.GS;
    const LF = DirectUSBThermalPrinter.LF;
    
    let receipt = '';

    // Initialize
    receipt += ESC + '@'; // Initialize printer
    
    // Business Header (Center, Bold, Large)
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += ESC + '!' + '\x18'; // Double height + bold
    receipt += billData.businessName.toUpperCase() + LF;
    receipt += ESC + '!' + '\x00'; // Normal text
    receipt += billData.address + LF;
    receipt += 'Ph: ' + billData.phone + LF;
    
    // Divider
    receipt += '================================' + LF;
    
    // Bill Info (Left align)
    receipt += ESC + 'a' + '\x00'; // Left align
    const currentDate = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    
    receipt += `Bill: ${billData.billNumber}`.padEnd(16) + `Date: ${currentDate}` + LF;
    if (billData.customerName) {
      receipt += `Customer: ${billData.customerName}` + LF;
    }
    
    // Divider
    receipt += '================================' + LF;
    
    // Items Header
    receipt += 'ITEM'.padEnd(16) + 'QTY'.padStart(4) + 'RATE'.padStart(6) + 'AMT'.padStart(6) + LF;
    receipt += '--------------------------------' + LF;
    
    // Items
    billData.items.forEach((item: any) => {
      const itemName = item.name.length > 16 ? item.name.substring(0, 16) : item.name.padEnd(16);
      const qty = item.quantity.toString().padStart(4);
      const rate = ('₹' + item.rate).padStart(6);
      const amt = ('₹' + item.amount).padStart(6);
      receipt += itemName + qty + rate + amt + LF;
    });
    
    // Divider
    receipt += '--------------------------------' + LF;
    
    // Totals
    receipt += ('Subtotal: ₹' + billData.subtotal).padStart(32) + LF;
    if (billData.discount && billData.discount > 0) {
      receipt += ('Discount: -₹' + billData.discount).padStart(32) + LF;
    }
    if (billData.gst && billData.gst > 0) {
      receipt += ('GST: ₹' + billData.gst).padStart(32) + LF;
    }
    
    // Grand Total
    receipt += '================================' + LF;
    receipt += ESC + '!' + '\x08'; // Bold
    receipt += ('TOTAL: ₹' + billData.grandTotal).padStart(32) + LF;
    receipt += ESC + '!' + '\x00'; // Normal
    receipt += '================================' + LF;
    
    // Thank You (Center)
    receipt += ESC + 'a' + '\x01'; // Center align
    receipt += LF;
    receipt += (billData.thankYouMessage || 'Thank you for your business!') + LF;
    receipt += LF;
    
    // Cut paper and eject
    receipt += LF + LF + LF; // Extra line feeds
    receipt += GS + 'V' + '\x42' + '\x00'; // Full cut
    
    return receipt;
  }

  // Test print
  async testPrint(): Promise<boolean> {
    const testBill = {
      businessName: 'USB PRINT TEST',
      address: 'Direct USB Thermal Printing',
      phone: '+91 98765 43210',
      billNumber: 'USB-TEST-001',
      customerName: 'Test Customer',
      items: [
        { name: 'Test Item 1', quantity: 1, rate: 100, amount: 100 },
        { name: 'Test Item 2', quantity: 2, rate: 50, amount: 100 }
      ],
      subtotal: 200,
      discount: 0,
      gst: 0,
      grandTotal: 200,
      thankYouMessage: 'USB Direct Print Successful!'
    };

    return await this.printReceipt(testBill);
  }

  // Disconnect printer
  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      
      this.isConnected = false;
      console.log('✅ USB Printer Disconnected');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    }
  }

  // Check connection status
  isUSBConnected(): boolean {
    return this.isConnected;
  }

  // Get available serial ports
  static async getAvailablePorts(): Promise<SerialPort[]> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API not supported');
    }
    
    return await (navigator as any).serial.getPorts();
  }
}

// Singleton instance for app-wide use
export const usbThermalPrinter = new DirectUSBThermalPrinter();

// Helper functions for easy integration
export const connectUSBPrinter = () => usbThermalPrinter.connectUSB();
export const printUSBReceipt = (billData: any) => usbThermalPrinter.printReceipt(billData);
export const testUSBPrint = () => usbThermalPrinter.testPrint();
export const disconnectUSBPrinter = () => usbThermalPrinter.disconnect();
export const isUSBPrinterConnected = () => usbThermalPrinter.isUSBConnected();