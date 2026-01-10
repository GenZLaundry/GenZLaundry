// Direct thermal printer - prints directly to billing machine without dialogs

function createDirectPrintReceipt(invoice, settings) {
    const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
    const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Create receipt content for direct printing
    let receiptContent = '';
    
    // Business header
    receiptContent += centerText(settings.business_name || 'GenZ Laundry', 32) + '\n';
    receiptContent += centerText(settings.address || 'Your Address Here', 32) + '\n';
    receiptContent += centerText(`Ph: ${settings.phone || 'Your Phone'}`, 32) + '\n';
    if (settings.gstin) {
        receiptContent += centerText(`GSTIN: ${settings.gstin}`, 32) + '\n';
    }
    receiptContent += '--------------------------------\n';
    
    // Invoice info
    receiptContent += `Invoice: ${invoice.invoice_number}\n`;
    receiptContent += `Date: ${date} ${time}\n`;
    if (invoice.customer_name) {
        receiptContent += `Customer: ${invoice.customer_name}\n`;
    }
    if (invoice.customer_phone) {
        receiptContent += `Phone: ${invoice.customer_phone}\n`;
    }
    receiptContent += '--------------------------------\n';
    
    // Services header
    receiptContent += centerText('SERVICES', 32) + '\n';
    
    // Items
    invoice.items.forEach(item => {
        const serviceName = item.service_name.length > 20 ? 
            item.service_name.substring(0, 17) + '...' : 
            item.service_name;
        
        receiptContent += formatLine(serviceName, `₹${item.amount.toFixed(2)}`, 32) + '\n';
        receiptContent += `  ${item.quantity} ${item.unit} × ₹${item.rate.toFixed(2)}\n`;
    });
    
    receiptContent += '--------------------------------\n';
    
    // Totals
    receiptContent += formatLine('Subtotal:', `₹${invoice.subtotal.toFixed(2)}`, 32) + '\n';
    
    if (invoice.discount > 0) {
        receiptContent += formatLine('Discount:', `-₹${invoice.discount.toFixed(2)}`, 32) + '\n';
    }
    
    if (invoice.gst_amount > 0) {
        receiptContent += formatLine('GST (18%):', `₹${invoice.gst_amount.toFixed(2)}`, 32) + '\n';
    }
    
    receiptContent += '--------------------------------\n';
    receiptContent += formatLine('TOTAL:', `₹${invoice.total.toFixed(2)}`, 32) + '\n';
    receiptContent += '--------------------------------\n';
    
    // Footer
    receiptContent += centerText(settings.terms || 'Thank you for choosing GenZ Laundry!', 32) + '\n';
    receiptContent += centerText('Visit Again!', 32) + '\n';
    receiptContent += centerText('***', 32) + '\n';
    
    return receiptContent;
}

function centerText(text, width) {
    if (text.length >= width) return text.substring(0, width);
    const padding = Math.floor((width - text.length) / 2);
    return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding);
}

function formatLine(left, right, width) {
    const totalLength = left.length + right.length;
    if (totalLength >= width) {
        return left.substring(0, width - right.length - 1) + ' ' + right;
    }
    const spaces = width - totalLength;
    return left + ' '.repeat(spaces) + right;
}

// Direct print methods
function printDirectToThermal(invoice, settings) {
    // Method 1: Silent print using hidden iframe with minimal content
    const receiptHTML = createSilentPrintHTML(invoice, settings);
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);
    
    iframe.contentDocument.write(receiptHTML);
    iframe.contentDocument.close();
    
    // Wait for content to load then print silently
    setTimeout(() => {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.log('Direct print attempt failed, trying alternative method');
            printViaMinimalWindow(invoice, settings);
        }
        
        // Clean up
        setTimeout(() => {
            if (iframe.parentNode) {
                document.body.removeChild(iframe);
            }
        }, 2000);
    }, 100);
}

function createSilentPrintHTML(invoice, settings) {
    const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
    const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Receipt</title>
<style>
@page{size:80mm auto;margin:0}
@media print{*{visibility:hidden}body{visibility:visible;margin:0;padding:0;width:80mm;height:auto}}
body{width:80mm;margin:0;padding:2mm;font:9px/1.1 'Courier New',monospace;color:#000;background:#fff}
.c{text-align:center}.b{font-weight:bold}.l{border-bottom:1px dashed #000;margin:1px 0;height:1px}
.r{display:flex;justify-content:space-between;margin:0}.t{font-weight:bold}
</style></head><body>
<div class="c b" style="font-size:11px">${settings.business_name || 'GenZ Laundry'}</div>
<div class="c" style="font-size:8px">${settings.address || 'Your Address Here'}</div>
<div class="c" style="font-size:8px">Ph: ${settings.phone || 'Your Phone'}</div>
${settings.gstin ? `<div class="c" style="font-size:8px">GSTIN: ${settings.gstin}</div>` : ''}
<div class="l"></div>
<div style="font-size:8px">Invoice: ${invoice.invoice_number}</div>
<div style="font-size:8px">Date: ${date} ${time}</div>
${invoice.customer_name ? `<div style="font-size:8px">Customer: ${invoice.customer_name}</div>` : ''}
${invoice.customer_phone ? `<div style="font-size:8px">Phone: ${invoice.customer_phone}</div>` : ''}
<div class="l"></div>
<div class="c b">SERVICES</div>
${invoice.items.map(item => {
    const serviceName = item.service_name.length > 20 ? 
        item.service_name.substring(0, 17) + '...' : 
        item.service_name;
    return `<div class="r" style="font-size:8px"><span>${serviceName}</span><span>₹${item.amount.toFixed(2)}</span></div>
<div style="font-size:7px;margin-left:2px;color:#333">${item.quantity} ${item.unit} × ₹${item.rate.toFixed(2)}</div>`;
}).join('')}
<div class="l"></div>
<div class="r"><span>Subtotal:</span><span>₹${invoice.subtotal.toFixed(2)}</span></div>
${invoice.discount > 0 ? `<div class="r"><span>Discount:</span><span>-₹${invoice.discount.toFixed(2)}</span></div>` : ''}
${invoice.gst_amount > 0 ? `<div class="r"><span>GST (18%):</span><span>₹${invoice.gst_amount.toFixed(2)}</span></div>` : ''}
<div class="l"></div>
<div class="r t"><span>TOTAL:</span><span>₹${invoice.total.toFixed(2)}</span></div>
<div class="l"></div>
<div class="c" style="font-size:8px">${settings.terms || 'Thank you for choosing GenZ Laundry!'}</div>
<div class="c" style="font-size:8px">Visit Again!</div>
<div class="c">***</div>
<script>
setTimeout(function(){
    try{
        window.print();
    }catch(e){
        console.log('Print failed');
    }
}, 50);
</script>
</body></html>`;
}

function printViaMinimalWindow(invoice, settings) {
    // Fallback: Minimal window that auto-prints and closes quickly
    const receiptHTML = createSilentPrintHTML(invoice, settings);
    
    const printWindow = window.open('', '_blank', 
        'width=300,height=200,scrollbars=no,resizable=no,menubar=no,toolbar=no,status=no,location=no');
    
    if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        
        // Auto-close after printing
        setTimeout(() => {
            try {
                printWindow.close();
            } catch (e) {
                // Window might already be closed
            }
        }, 2000);
    }
}

// ESC/POS command generation for direct printer communication
function generateESCPOSCommands(invoice, settings) {
    const ESC = '\x1B';
    const GS = '\x1D';
    
    let commands = '';
    
    // Initialize printer
    commands += ESC + '@'; // Initialize
    commands += ESC + 'a' + '\x01'; // Center alignment
    
    // Business name (bold, larger)
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += GS + '!' + '\x11'; // Double height and width
    commands += (settings.business_name || 'GenZ Laundry') + '\n';
    commands += GS + '!' + '\x00'; // Normal size
    commands += ESC + 'E' + '\x00'; // Bold off
    
    // Business info
    commands += (settings.address || 'Your Address Here') + '\n';
    commands += 'Ph: ' + (settings.phone || 'Your Phone') + '\n';
    if (settings.gstin) {
        commands += 'GSTIN: ' + settings.gstin + '\n';
    }
    
    // Separator line
    commands += '--------------------------------\n';
    
    // Left alignment for details
    commands += ESC + 'a' + '\x00';
    
    // Invoice info
    const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
    const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    commands += 'Invoice: ' + invoice.invoice_number + '\n';
    commands += 'Date: ' + date + ' ' + time + '\n';
    
    if (invoice.customer_name) {
        commands += 'Customer: ' + invoice.customer_name + '\n';
    }
    if (invoice.customer_phone) {
        commands += 'Phone: ' + invoice.customer_phone + '\n';
    }
    
    commands += '--------------------------------\n';
    
    // Services header (centered)
    commands += ESC + 'a' + '\x01';
    commands += ESC + 'E' + '\x01'; // Bold
    commands += 'SERVICES\n';
    commands += ESC + 'E' + '\x00'; // Bold off
    commands += ESC + 'a' + '\x00'; // Left align
    
    // Items
    invoice.items.forEach(item => {
        const serviceName = item.service_name.length > 20 ? 
            item.service_name.substring(0, 17) + '...' : 
            item.service_name;
        
        commands += formatLine(serviceName, '₹' + item.amount.toFixed(2), 32) + '\n';
        commands += '  ' + item.quantity + ' ' + item.unit + ' × ₹' + item.rate.toFixed(2) + '\n';
    });
    
    commands += '--------------------------------\n';
    
    // Totals
    commands += formatLine('Subtotal:', '₹' + invoice.subtotal.toFixed(2), 32) + '\n';
    
    if (invoice.discount > 0) {
        commands += formatLine('Discount:', '-₹' + invoice.discount.toFixed(2), 32) + '\n';
    }
    
    if (invoice.gst_amount > 0) {
        commands += formatLine('GST (18%):', '₹' + invoice.gst_amount.toFixed(2), 32) + '\n';
    }
    
    commands += '--------------------------------\n';
    
    // Total (bold)
    commands += ESC + 'E' + '\x01'; // Bold on
    commands += formatLine('TOTAL:', '₹' + invoice.total.toFixed(2), 32) + '\n';
    commands += ESC + 'E' + '\x00'; // Bold off
    
    commands += '--------------------------------\n';
    
    // Footer (centered)
    commands += ESC + 'a' + '\x01';
    commands += (settings.terms || 'Thank you for choosing GenZ Laundry!') + '\n';
    commands += 'Visit Again!\n';
    commands += '***\n';
    
    // Cut paper (if supported)
    commands += GS + 'V' + '\x42' + '\x00'; // Partial cut
    
    return commands;
}

// Export functions
window.directThermalPrinter = {
    print: printDirectToThermal,
    printMinimal: printViaMinimalWindow,
    generateESCPOS: generateESCPOSCommands,
    createReceipt: createDirectPrintReceipt
};