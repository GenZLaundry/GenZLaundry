// Dedicated thermal printer module for zero-waste printing

function createThermalReceipt(invoice, settings) {
    const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
    const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Create ultra-minimal HTML for thermal printing
    const receiptHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Receipt</title>
<style>
@page{size:80mm auto;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{width:80mm;font-family:'Courier New',monospace;font-size:10px;line-height:1.1;color:#000;background:#fff;padding:2mm}
.c{text-align:center}.b{font-weight:bold}
.l{border-bottom:1px dashed #000;margin:2px 0;height:1px}
.r{display:flex;justify-content:space-between;margin:1px 0}
.t{font-weight:bold}
.bn{font-size:12px;font-weight:bold;text-align:center;margin:2px 0}
.bi{font-size:9px;text-align:center;margin:1px 0}
.ii{font-size:9px;margin:1px 0}
.si{font-size:9px;margin:1px 0}
.sd{font-size:8px;margin-left:3px;color:#333}
.fm{font-size:9px;text-align:center;margin:2px 0}
</style></head><body>
<div class="bn">${settings.business_name || 'GenZ Laundry'}</div>
<div class="bi">${settings.address || 'Your Address Here'}</div>
<div class="bi">Ph: ${settings.phone || 'Your Phone'}</div>
${settings.gstin ? `<div class="bi">GSTIN: ${settings.gstin}</div>` : ''}
<div class="l"></div>
<div class="ii">Invoice: ${invoice.invoice_number}</div>
<div class="ii">Date: ${date} ${time}</div>
${invoice.customer_name ? `<div class="ii">Customer: ${invoice.customer_name}</div>` : ''}
${invoice.customer_phone ? `<div class="ii">Phone: ${invoice.customer_phone}</div>` : ''}
<div class="l"></div>
<div class="b c">SERVICES</div>
${invoice.items.map(item => {
    const serviceName = item.service_name.length > 20 ? 
        item.service_name.substring(0, 17) + '...' : 
        item.service_name;
    return `<div class="si">
<div class="r"><span>${serviceName}</span><span>₹${item.amount.toFixed(2)}</span></div>
<div class="sd">${item.quantity} ${item.unit} × ₹${item.rate.toFixed(2)}</div>
</div>`;
}).join('')}
<div class="l"></div>
<div class="r"><span>Subtotal:</span><span>₹${invoice.subtotal.toFixed(2)}</span></div>
${invoice.discount > 0 ? `<div class="r"><span>Discount:</span><span>-₹${invoice.discount.toFixed(2)}</span></div>` : ''}
${invoice.gst_amount > 0 ? `<div class="r"><span>GST (18%):</span><span>₹${invoice.gst_amount.toFixed(2)}</span></div>` : ''}
<div class="l"></div>
<div class="r t"><span>TOTAL:</span><span>₹${invoice.total.toFixed(2)}</span></div>
<div class="l"></div>
<div class="fm">${settings.terms || 'Thank you for choosing GenZ Laundry!'}</div>
<div class="fm">Visit Again!</div>
<div class="c">***</div>
<script>window.onload=function(){window.print();setTimeout(function(){window.close()},1000)};</script>
</body></html>`;
    
    return receiptHTML;
}

function printThermalReceipt(invoice, settings) {
    const receiptHTML = createThermalReceipt(invoice, settings);
    
    // Method 1: New window (most compatible)
    const printWindow = window.open('', '_blank', 'width=300,height=400,scrollbars=no,resizable=no');
    if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        return;
    }
    
    // Method 2: Data URL (fallback)
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(receiptHTML);
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-1000px';
    printFrame.style.left = '-1000px';
    printFrame.style.width = '80mm';
    printFrame.style.height = 'auto';
    printFrame.src = dataUrl;
    
    document.body.appendChild(printFrame);
    
    printFrame.onload = function() {
        setTimeout(() => {
            printFrame.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(printFrame);
            }, 1000);
        }, 100);
    };
}

// Export for use in main app
window.thermalPrinter = {
    print: printThermalReceipt,
    create: createThermalReceipt
};