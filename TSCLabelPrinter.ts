// TSC TL240 BARCODE LABEL PRINTER - TSPL COMMANDS
// Professional laundry tag printing with no A4 behavior

export interface LaundryTag {
  laundryName: string;
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  itemName: string;
  washType?: 'DRY CLEAN' | 'WASH' | 'IRON' | 'WASH+IRON';
  barcode?: string;
  qrCode?: string;
  tagIndex?: number;
  totalTags?: number;
}

export interface LabelConfig {
  width: number;  // Label width in mm (default: 50mm)
  height: number; // Label height in mm (default: 25mm)
  dpi: number;    // Printer DPI (default: 203)
  speed: number;  // Print speed (default: 4)
  density: number; // Print density (default: 8)
}

export class TSCLabelPrinter {
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private isConnected: boolean = false;
  private config: LabelConfig;

  constructor(config: Partial<LabelConfig> = {}) {
    this.config = {
      width: 50,    // 50mm width
      height: 25,   // 25mm height
      dpi: 203,     // 203 DPI
      speed: 4,     // Speed 4
      density: 8,   // Density 8
      ...config
    };
  }

  // Connect to TSC TL240 via USB
  async connectTSC(): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API not supported. Use Chrome/Edge with HTTPS.');
      }

      // Request TSC printer port
      this.port = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x1203 }, // TSC Auto ID Technology
          { usbVendorId: 0x0471 }, // TSC alternative VID
        ]
      });

      // Open port for TSC communication
      await this.port.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this.writer = this.port.writable?.getWriter() || null;
      this.isConnected = true;

      // Initialize TSC printer
      await this.initializeTSC();

      console.log('✅ TSC TL240 Label Printer Connected');
      return true;

    } catch (error) {
      console.error('❌ TSC Printer Connection Failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Initialize TSC printer with TSPL commands
  private async initializeTSC(): Promise<void> {
    if (!this.writer) return;

    const commands = [
      'SIZE 50 mm, 25 mm\r\n',     // Set label size
      'SPEED 4\r\n',               // Set print speed
      'DENSITY 8\r\n',             // Set print density
      'DIRECTION 1\r\n',           // Set print direction
      'SET RIBBON OFF\r\n',        // Thermal transfer off (direct thermal)
      'SET TEAR ON\r\n',           // Enable tear-off
      'CLS\r\n'                    // Clear buffer
    ].join('');

    await this.sendTSPLCommand(commands);
  }

  // Send TSPL command to printer
  private async sendTSPLCommand(command: string): Promise<void> {
    if (!this.writer || !this.isConnected) {
      throw new Error('TSC Printer not connected');
    }

    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(command);
    await this.writer.write(uint8Array);
  }

  // Generate TSPL commands for laundry tag
  private generateLaundryTagTSPL(tag: LaundryTag): string {
    const { width, height, dpi } = this.config;
    
    // Calculate dots from mm (203 DPI = 8 dots per mm)
    const dotsPerMm = dpi / 25.4;
    const widthDots = Math.floor(width * dotsPerMm);
    const heightDots = Math.floor(height * dotsPerMm);
    
    let tspl = '';
    
    // Set label size and clear buffer
    tspl += `SIZE ${width} mm, ${height} mm\r\n`;
    tspl += 'CLS\r\n';
    
    // Laundry name (top left, small font)
    tspl += `TEXT 8,8,"2",0,1,1,"${tag.laundryName}"\r\n`;
    
    // Bill number (top right, small font)
    tspl += `TEXT ${widthDots - 80},8,"1",0,1,1,"${tag.billNumber}"\r\n`;
    
    // Customer info (second line, left side)
    const customerText = tag.customerPhone ? 
      `${tag.customerName.substring(0, 10)} ${tag.customerPhone.slice(-4)}` : 
      tag.customerName.substring(0, 14);
    tspl += `TEXT 8,32,"1",0,1,1,"${customerText}"\r\n`;
    
    // Item name (center, larger font)
    tspl += `TEXT 8,56,"3",0,1,1,"${tag.itemName.toUpperCase().substring(0, 12)}"\r\n`;
    
    // Wash type (left side, bottom area)
    if (tag.washType) {
      tspl += `TEXT 8,${heightDots - 32},"1",0,1,1,"${tag.washType}"\r\n`;
    }
    
    // Tag counter (bottom right, prominent)
    if (tag.tagIndex && tag.totalTags) {
      tspl += `TEXT ${widthDots - 48},${heightDots - 32},"2",0,1,1,"${tag.tagIndex}/${tag.totalTags}"\r\n`;
    }
    
    // Barcode (right side, vertical center)
    if (tag.barcode) {
      // Code 128 barcode - smaller to fit
      tspl += `BARCODE ${widthDots - 120},40,"128",40,1,0,2,2,"${tag.barcode}"\r\n`;
    }
    
    // QR Code (alternative to barcode, right side)
    if (tag.qrCode && !tag.barcode) {
      tspl += `QRCODE ${widthDots - 80},40,H,3,A,0,"${tag.qrCode}"\r\n`;
    }
    
    // Border around entire label
    tspl += `BOX 4,4,${widthDots - 4},${heightDots - 4},2\r\n`;
    
    // Print command
    tspl += 'PRINT 1,1\r\n';
    
    return tspl;
  }

  // Print single laundry tag
  async printLaundryTag(tag: LaundryTag): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('TSC Printer not connected');
      }

      const tsplCommands = this.generateLaundryTagTSPL(tag);
      await this.sendTSPLCommand(tsplCommands);
      
      console.log('✅ Laundry tag printed successfully');
      return true;

    } catch (error) {
      console.error('❌ Tag print failed:', error);
      return false;
    }
  }

  // Print multiple tags for order items
  async printOrderTags(tags: LaundryTag[]): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('TSC Printer not connected');
      }

      let allSuccess = true;
      
      for (let i = 0; i < tags.length; i++) {
        const tag = { ...tags[i], tagIndex: i + 1, totalTags: tags.length };
        const success = await this.printLaundryTag(tag);
        if (!success) allSuccess = false;
        
        // Small delay between tags
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return allSuccess;

    } catch (error) {
      console.error('❌ Order tags print failed:', error);
      return false;
    }
  }

  // Test print with visible tag counter
  async testPrint(): Promise<boolean> {
    const testTag: LaundryTag = {
      laundryName: 'GenZ Laundry',
      billNumber: 'TEST-001',
      customerName: 'Test Customer',
      customerPhone: '+91 98765 43210',
      itemName: 'TEST SHIRT',
      washType: 'WASH+IRON',
      barcode: 'TEST001',
      qrCode: 'https://genzlaundry.com/track/TEST001',
      tagIndex: 1,
      totalTags: 3
    };

    console.log('🧪 Test Tag TSPL Commands:');
    console.log(this.generateLaundryTagTSPL(testTag));

    return await this.printLaundryTag(testTag);
  }

  // Debug function to print tag counter test
  async testTagCounter(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('TSC Printer not connected');
      }

      // Simple test with just tag counter
      const { width, height, dpi } = this.config;
      const dotsPerMm = dpi / 25.4;
      const widthDots = Math.floor(width * dotsPerMm);
      const heightDots = Math.floor(height * dotsPerMm);

      let tspl = '';
      tspl += `SIZE ${width} mm, ${height} mm\r\n`;
      tspl += 'CLS\r\n';
      
      // Large text for visibility test
      tspl += `TEXT 8,8,"4",0,1,1,"TAG COUNTER TEST"\r\n`;
      tspl += `TEXT 8,40,"3",0,1,1,"1/3 - TOP LEFT"\r\n`;
      tspl += `TEXT ${widthDots - 80},40,"3",0,1,1,"2/3"\r\n`;
      tspl += `TEXT ${widthDots - 80},${heightDots - 32},"4",0,1,1,"3/3"\r\n`;
      
      // Border for reference
      tspl += `BOX 4,4,${widthDots - 4},${heightDots - 4},2\r\n`;
      tspl += 'PRINT 1,1\r\n';

      await this.sendTSPLCommand(tspl);
      console.log('✅ Tag counter test printed');
      return true;

    } catch (error) {
      console.error('❌ Tag counter test failed:', error);
      return false;
    }
  }

  // Disconnect TSC printer
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
      console.log('✅ TSC Printer Disconnected');
    } catch (error) {
      console.error('❌ TSC Disconnect error:', error);
    }
  }

  // Check connection status
  isTSCConnected(): boolean {
    return this.isConnected;
  }

  // Get printer status
  async getPrinterStatus(): Promise<string> {
    if (!this.isConnected) return 'DISCONNECTED';
    
    try {
      // Send status request
      await this.sendTSPLCommand('~!T\r\n');
      return 'READY';
    } catch (error) {
      return 'ERROR';
    }
  }
}

// Singleton instance for app-wide use
export const tscLabelPrinter = new TSCLabelPrinter();

// Helper functions for easy integration
export const connectTSCPrinter = () => tscLabelPrinter.connectTSC();
export const printLaundryTag = (tag: LaundryTag) => tscLabelPrinter.printLaundryTag(tag);
export const printOrderTags = (tags: LaundryTag[]) => tscLabelPrinter.printOrderTags(tags);
export const testTSCPrint = () => tscLabelPrinter.testPrint();
export const testTagCounter = () => tscLabelPrinter.testTagCounter();
export const disconnectTSCPrinter = () => tscLabelPrinter.disconnect();
export const isTSCConnected = () => tscLabelPrinter.isTSCConnected();