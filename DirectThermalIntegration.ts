// DIRECT THERMAL PRINTING INTEGRATION
// Connects your Render.com POS to local thermal print server

export class DirectThermalPrinter {
  private serverUrl: string;
  private connected: boolean = false;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  // Check if thermal print server is available
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      const result = await response.json();
      this.connected = result.success && result.printerConnected;
      return this.connected;
    } catch (error) {
      this.connected = false;
      return false;
    }
  }

  // Print thermal receipt directly
  async printReceipt(receiptData: {
    businessName: string;
    address: string;
    phone: string;
    customerName: string;
    billNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      amount: number;
    }>;
    subtotal: number;
    discount?: number;
    deliveryCharge?: number;
    grandTotal: number;
  }): Promise<{ success: boolean; message: string }> {
    
    if (!this.connected) {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return {
          success: false,
          message: 'Thermal print server not available. Please start the thermal print server.'
        };
      }
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/print/receipt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        message: `Print failed: ${(error as Error).message}`
      };
    }
  }

  // Print laundry tags directly
  async printTags(tagsData: Array<{
    laundryName: string;
    billNumber: string;
    customerName: string;
    itemName: string;
    washType?: string;
    qrCode?: string;
    tagIndex: number;
    totalTags: number;
  }>): Promise<{ success: boolean; message: string }> {

    if (!this.connected) {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return {
          success: false,
          message: 'Thermal print server not available.'
        };
      }
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/print/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tags: tagsData })
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        message: `Tag printing failed: ${(error as Error).message}`
      };
    }
  }

  // Test print
  async testPrint(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/print/test`, {
        method: 'POST'
      });

      const result = await response.json();
      return result;

    } catch (error) {
      return {
        success: false,
        message: `Test print failed: ${(error as Error).message}`
      };
    }
  }

  // Get server status
  async getStatus(): Promise<{
    serverRunning: boolean;
    printerConnected: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/status`);
      const result = await response.json();
      
      return {
        serverRunning: true,
        printerConnected: result.printerConnected,
        message: result.printerConnected ? 'Thermal printer ready' : 'Printer not connected'
      };

    } catch (error) {
      return {
        serverRunning: false,
        printerConnected: false,
        message: 'Thermal print server not running'
      };
    }
  }

  // Initialize printer
  async initializePrinter(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.serverUrl}/api/printer/init`, {
        method: 'POST'
      });

      const result = await response.json();
      this.connected = result.success;
      return result;

    } catch (error) {
      return {
        success: false,
        message: `Printer initialization failed: ${(error as Error).message}`
      };
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.connected;
  }
}

// Singleton instance for app-wide use
export const directThermalPrinter = new DirectThermalPrinter();

// Helper functions for easy integration
export const printDirectReceipt = (receiptData: any) => directThermalPrinter.printReceipt(receiptData);
export const printDirectTags = (tagsData: any[]) => directThermalPrinter.printTags(tagsData);
export const testDirectPrint = () => directThermalPrinter.testPrint();
export const checkThermalConnection = () => directThermalPrinter.checkConnection();
export const getThermalStatus = () => directThermalPrinter.getStatus();
export const initThermalPrinter = () => directThermalPrinter.initializePrinter();