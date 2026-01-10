// DUAL PRINTER MANAGER - THERMAL RECEIPTS + TSC LABELS
// Professional laundry POS system with proper printer separation

import { BillData } from './ThermalPrintManager';
import { LaundryTag } from './TSCLabelPrinter';
import { usbThermalPrinter } from './DirectUSBPrinter';
import { tscLabelPrinter } from './TSCLabelPrinter';
import { PRINTER_SPECS } from './PrinterConfig';

export interface LaundryOrder {
  // Business info
  businessName: string;
  address: string;
  phone: string;
  
  // Order info
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  
  // Items
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    rate: number;
    amount: number;
    washType?: 'DRY CLEAN' | 'WASH' | 'IRON' | 'WASH+IRON';
  }>;
  
  // Totals
  subtotal: number;
  discount?: number;
  gst?: number;
  grandTotal: number;
  
  // Options
  thankYouMessage?: string;
  printTags?: boolean;
  generateBarcodes?: boolean;
}

export class DualPrinterManager {
  private thermalConnected: boolean = false;
  private tscConnected: boolean = false;

  constructor() {
    this.updateConnectionStatus();
  }

  // Update connection status for both printers
  updateConnectionStatus(): void {
    this.thermalConnected = usbThermalPrinter.isUSBConnected();
    this.tscConnected = tscLabelPrinter.isTSCConnected();
  }

  // Get printer status summary
  getPrinterStatus(): {
    thermal: { connected: boolean; name: string; status: string };
    tsc: { connected: boolean; name: string; status: string };
  } {
    this.updateConnectionStatus();
    
    return {
      thermal: {
        connected: this.thermalConnected,
        name: `${PRINTER_SPECS.thermal.model} (${PRINTER_SPECS.thermal.paperWidth}mm Thermal Receipt)`,
        status: this.thermalConnected ? 'READY' : 'DISCONNECTED'
      },
      tsc: {
        connected: this.tscConnected,
        name: `${PRINTER_SPECS.tsc.model} (${PRINTER_SPECS.tsc.dpi} DPI Barcode/Label)`,
        status: this.tscConnected ? 'READY' : 'DISCONNECTED'
      }
    };
  }

  // Connect both printers
  async connectAllPrinters(): Promise<{ thermal: boolean; tsc: boolean }> {
    const results = {
      thermal: false,
      tsc: false
    };

    try {
      // Connect thermal printer
      results.thermal = await usbThermalPrinter.connectUSB();
    } catch (error) {
      console.error('Thermal printer connection failed:', error);
    }

    try {
      // Connect TSC label printer
      results.tsc = await tscLabelPrinter.connectTSC();
    } catch (error) {
      console.error('TSC printer connection failed:', error);
    }

    this.updateConnectionStatus();
    return results;
  }

  // Process complete laundry order (bill + tags separately)
  async processLaundryOrder(order: LaundryOrder): Promise<{
    billPrinted: boolean;
    tagsPrinted: boolean;
    errors: string[];
  }> {
    const result = {
      billPrinted: false,
      tagsPrinted: false,
      errors: [] as string[]
    };

    // 1. Print thermal receipt (customer bill only)
    try {
      const billData: BillData = {
        businessName: order.businessName,
        address: order.address,
        phone: order.phone,
        billNumber: order.billNumber,
        customerName: order.customerName,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        subtotal: order.subtotal,
        discount: order.discount || 0,
        gst: order.gst || 0,
        grandTotal: order.grandTotal,
        thankYouMessage: order.thankYouMessage
      };

      if (this.thermalConnected) {
        result.billPrinted = await usbThermalPrinter.printReceipt(billData);
        if (!result.billPrinted) {
          result.errors.push('Thermal receipt printing failed');
        }
      } else {
        result.errors.push('Thermal printer not connected');
      }

    } catch (error) {
      result.errors.push(`Bill printing error: ${(error as Error).message}`);
    }

    // 2. Print laundry tags separately (if requested)
    if (order.printTags) {
      try {
        const tags: LaundryTag[] = [];
        
        // Generate tags for each item (considering quantity)
        order.items.forEach(item => {
          for (let i = 0; i < item.quantity; i++) {
            const barcode = order.generateBarcodes ? 
              `${order.billNumber}-${item.id}-${i + 1}` : undefined;
            
            const qrCode = order.generateBarcodes ? 
              `https://genzlaundry.com/track/${order.billNumber}/${item.id}/${i + 1}` : undefined;

            tags.push({
              laundryName: order.businessName,
              billNumber: order.billNumber,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              itemName: item.name,
              washType: item.washType,
              barcode: barcode,
              qrCode: qrCode
            });
          }
        });

        if (this.tscConnected && tags.length > 0) {
          result.tagsPrinted = await tscLabelPrinter.printOrderTags(tags);
          if (!result.tagsPrinted) {
            result.errors.push('Label printing failed');
          }
        } else if (!this.tscConnected) {
          result.errors.push('TSC label printer not connected');
        }

      } catch (error) {
        result.errors.push(`Tag printing error: ${(error as Error).message}`);
      }
    }

    return result;
  }

  // Print bill only (thermal receipt)
  async printBillOnly(order: LaundryOrder): Promise<boolean> {
    try {
      const billData: BillData = {
        businessName: order.businessName,
        address: order.address,
        phone: order.phone,
        billNumber: order.billNumber,
        customerName: order.customerName,
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        })),
        subtotal: order.subtotal,
        discount: order.discount || 0,
        gst: order.gst || 0,
        grandTotal: order.grandTotal,
        thankYouMessage: order.thankYouMessage
      };

      if (this.thermalConnected) {
        return await usbThermalPrinter.printReceipt(billData);
      } else {
        throw new Error('Thermal printer not connected');
      }
    } catch (error) {
      console.error('Bill printing error:', error);
      return false;
    }
  }

  // Print tags only (TSC labels)
  async printTagsOnly(order: LaundryOrder): Promise<boolean> {
    try {
      const tags: LaundryTag[] = [];
      
      // Generate tags for each item
      order.items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          const barcode = order.generateBarcodes ? 
            `${order.billNumber}-${item.id}-${i + 1}` : undefined;
          
          const qrCode = order.generateBarcodes ? 
            `https://genzlaundry.com/track/${order.billNumber}/${item.id}/${i + 1}` : undefined;

          tags.push({
            laundryName: order.businessName,
            billNumber: order.billNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            itemName: item.name,
            washType: item.washType,
            barcode: barcode,
            qrCode: qrCode
          });
        }
      });

      if (this.tscConnected && tags.length > 0) {
        return await tscLabelPrinter.printOrderTags(tags);
      } else {
        throw new Error('TSC label printer not connected');
      }
    } catch (error) {
      console.error('Tag printing error:', error);
      return false;
    }
  }

  // Test both printers
  async testAllPrinters(): Promise<{ thermal: boolean; tsc: boolean }> {
    const results = {
      thermal: false,
      tsc: false
    };

    // Test thermal printer
    if (this.thermalConnected) {
      try {
        results.thermal = await usbThermalPrinter.testPrint();
      } catch (error) {
        console.error('Thermal test failed:', error);
      }
    }

    // Test TSC printer
    if (this.tscConnected) {
      try {
        results.tsc = await tscLabelPrinter.testPrint();
      } catch (error) {
        console.error('TSC test failed:', error);
      }
    }

    return results;
  }

  // Disconnect all printers
  async disconnectAllPrinters(): Promise<void> {
    try {
      await usbThermalPrinter.disconnect();
    } catch (error) {
      console.error('Thermal disconnect error:', error);
    }

    try {
      await tscLabelPrinter.disconnect();
    } catch (error) {
      console.error('TSC disconnect error:', error);
    }

    this.updateConnectionStatus();
  }

  // Generate sample laundry order for testing
  generateSampleOrder(): LaundryOrder {
    return {
      businessName: 'GenZ Laundry',
      address: '123 Laundry Street, Delhi - 110001',
      phone: '+91 98765 43210',
      billNumber: `GenZ-${Date.now().toString().slice(-6)}`,
      customerName: 'Sample Customer',
      customerPhone: '+91 98765 43210',
      items: [
        {
          id: 'shirt-001',
          name: 'Shirt (Cotton)',
          quantity: 3,
          rate: 50,
          amount: 150,
          washType: 'WASH+IRON'
        },
        {
          id: 'pant-001',
          name: 'Pant (Formal)',
          quantity: 2,
          rate: 75,
          amount: 150,
          washType: 'DRY CLEAN'
        },
        {
          id: 'saree-001',
          name: 'Saree (Silk)',
          quantity: 1,
          rate: 200,
          amount: 200,
          washType: 'DRY CLEAN'
        }
      ],
      subtotal: 500,
      discount: 25,
      gst: 0,
      grandTotal: 475,
      thankYouMessage: 'Your clothes, cared for with Gen-Z speed. THANK YOU!',
      printTags: true,
      generateBarcodes: true
    };
  }
}

// Singleton instance for app-wide use
export const dualPrinterManager = new DualPrinterManager();

// Helper functions
export const connectAllPrinters = () => dualPrinterManager.connectAllPrinters();
export const processLaundryOrder = (order: LaundryOrder) => dualPrinterManager.processLaundryOrder(order);
export const printBillOnly = (order: LaundryOrder) => dualPrinterManager.printBillOnly(order);
export const printTagsOnly = (order: LaundryOrder) => dualPrinterManager.printTagsOnly(order);
export const testAllPrinters = () => dualPrinterManager.testAllPrinters();
export const getPrinterStatus = () => dualPrinterManager.getPrinterStatus();
export const disconnectAllPrinters = () => dualPrinterManager.disconnectAllPrinters();