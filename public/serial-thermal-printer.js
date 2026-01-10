// Serial thermal printer - Direct communication with thermal printer via Web Serial API

class SerialThermalPrinter {
    constructor() {
        this.port = null;
        this.writer = null;
        this.isConnected = false;
    }

    // Check if Web Serial API is supported
    isSupported() {
        return 'serial' in navigator;
    }

    // Connect to thermal printer
    async connect() {
        if (!this.isSupported()) {
            throw new Error('Web Serial API not supported in this browser');
        }

        try {
            // Request port access
            this.port = await navigator.serial.requestPort();
            
            // Open the port
            await this.port.open({ 
                baudRate: 9600,  // Common baud rate for thermal printers
                dataBits: 8,
                stopBits: 1,
                parity: 'none'
            });

            this.writer = this.port.writable.getWriter();
            this.isConnected = true;
            
            console.log('Thermal printer connected successfully');
            return true;
        } catch (error) {
            console.error('Failed to connect to thermal printer:', error);
            throw error;
        }
    }

    // Disconnect from printer
    async disconnect() {
        if (this.writer) {
            await this.writer.close();
            this.writer = null;
        }
        
        if (this.port) {
            await this.port.close();
            this.port = null;
        }
        
        this.isConnected = false;
        console.log('Thermal printer disconnected');
    }

    // Send ESC/POS commands to printer
    async sendCommands(commands) {
        if (!this.isConnected || !this.writer) {
            throw new Error('Printer not connected');
        }

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(commands);
            await this.writer.write(data);
            console.log('Commands sent to thermal printer');
        } catch (error) {
            console.error('Failed to send commands to printer:', error);
            throw error;
        }
    }

    // Generate ESC/POS commands for receipt
    generateReceiptCommands(invoice, settings) {
        const ESC = '\x1B';
        const GS = '\x1D';
        const LF = '\x0A';
        
        let commands = '';
        
        // Initialize printer
        commands += ESC + '@'; // Initialize printer
        commands += ESC + 't' + '\x00'; // Select character code table (PC437)
        
        // Set line spacing
        commands += ESC + '3' + '\x18'; // Set line spacing to 24 dots
        
        // Business header (centered, bold, double size)
        commands += ESC + 'a' + '\x01'; // Center alignment
        commands += ESC + 'E' + '\x01'; // Bold on
        commands += GS + '!' + '\x11'; // Double height and width
        commands += (settings.business_name || 'GenZ Laundry') + LF;
        commands += GS + '!' + '\x00'; // Normal size
        commands += ESC + 'E' + '\x00'; // Bold off
        
        // Business info
        commands += (settings.address || 'Your Address Here') + LF;
        commands += 'Ph: ' + (settings.phone || 'Your Phone') + LF;
        if (settings.gstin) {
            commands += 'GSTIN: ' + settings.gstin + LF;
        }
        
        // Separator line
        commands += this.createLine(32, '-') + LF;
        
        // Invoice info (left aligned)
        commands += ESC + 'a' + '\x00'; // Left alignment
        
        const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
        const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        commands += 'Invoice: ' + invoice.invoice_number + LF;
        commands += 'Date: ' + date + ' ' + time + LF;
        
        if (invoice.customer_name) {
            commands += 'Customer: ' + invoice.customer_name + LF;
        }
        if (invoice.customer_phone) {
            commands += 'Phone: ' + invoice.customer_phone + LF;
        }
        
        commands += this.createLine(32, '-') + LF;
        
        // Services header (centered, bold)
        commands += ESC + 'a' + '\x01'; // Center alignment
        commands += ESC + 'E' + '\x01'; // Bold on
        commands += 'SERVICES' + LF;
        commands += ESC + 'E' + '\x00'; // Bold off
        commands += ESC + 'a' + '\x00'; // Left alignment
        
        // Items
        invoice.items.forEach(item => {
            const serviceName = item.service_name.length > 20 ? 
                item.service_name.substring(0, 17) + '...' : 
                item.service_name;
            
            commands += this.formatLine(serviceName, '₹' + item.amount.toFixed(2), 32) + LF;
            commands += '  ' + item.quantity + ' ' + item.unit + ' x ₹' + item.rate.toFixed(2) + LF;
        });
        
        commands += this.createLine(32, '-') + LF;
        
        // Totals
        commands += this.formatLine('Subtotal:', '₹' + invoice.subtotal.toFixed(2), 32) + LF;
        
        if (invoice.discount > 0) {
            commands += this.formatLine('Discount:', '-₹' + invoice.discount.toFixed(2), 32) + LF;
        }
        
        if (invoice.gst_amount > 0) {
            commands += this.formatLine('GST (18%):', '₹' + invoice.gst_amount.toFixed(2), 32) + LF;
        }
        
        commands += this.createLine(32, '-') + LF;
        
        // Total (bold)
        commands += ESC + 'E' + '\x01'; // Bold on
        commands += this.formatLine('TOTAL:', '₹' + invoice.total.toFixed(2), 32) + LF;
        commands += ESC + 'E' + '\x00'; // Bold off
        
        commands += this.createLine(32, '-') + LF;
        
        // Footer (centered)
        commands += ESC + 'a' + '\x01'; // Center alignment
        commands += (settings.terms || 'Thank you for choosing GenZ Laundry!') + LF;
        commands += 'Visit Again!' + LF;
        commands += '***' + LF;
        
        // Feed and cut
        commands += LF + LF + LF; // Feed 3 lines
        commands += GS + 'V' + '\x42' + '\x00'; // Partial cut
        
        return commands;
    }

    // Helper function to create a line of characters
    createLine(width, char = '-') {
        return char.repeat(width);
    }

    // Helper function to format a line with left and right text
    formatLine(left, right, width) {
        const totalLength = left.length + right.length;
        if (totalLength >= width) {
            return left.substring(0, width - right.length - 1) + ' ' + right;
        }
        const spaces = width - totalLength;
        return left + ' '.repeat(spaces) + right;
    }

    // Print receipt directly to thermal printer
    async printReceipt(invoice, settings) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }
            
            const commands = this.generateReceiptCommands(invoice, settings);
            await this.sendCommands(commands);
            
            console.log('Receipt printed successfully to thermal printer');
            return true;
        } catch (error) {
            console.error('Failed to print receipt:', error);
            throw error;
        }
    }
}

// Create global instance
window.serialThermalPrinter = new SerialThermalPrinter();

// Enhanced direct printing function
async function printDirectlyToThermalPrinter(invoice, settings) {
    try {
        // Try Web Serial API first (Chrome/Edge)
        if (window.serialThermalPrinter.isSupported()) {
            try {
                await window.serialThermalPrinter.printReceipt(invoice, settings);
                return;
            } catch (error) {
                console.log('Serial printing failed, falling back to browser print');
            }
        }
        
        // Fallback to direct browser printing
        if (window.directThermalPrinter) {
            window.directThermalPrinter.print(invoice, settings);
        } else {
            throw new Error('No direct printing methods available');
        }
        
    } catch (error) {
        console.error('Direct printing failed:', error);
        throw error;
    }
}

// Export enhanced printing function
window.enhancedThermalPrint = printDirectlyToThermalPrinter;