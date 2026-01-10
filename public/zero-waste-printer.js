// Zero-waste thermal printer - eliminates all extra space

function createMinimalReceipt(invoice, settings) {
    const date = new Date(invoice.created_at).toLocaleDateString('en-IN');
    const time = new Date(invoice.created_at).toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Ultra-compact HTML with inline styles
    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
@page{size:80mm auto;margin:0}*{margin:0;padding:0}body{width:80mm;font:10px/1.1 'Courier New',monospace;color:#000;padding:1mm}
.c{text-align:center}.b{font-weight:bold}.l{border-bottom:1px dashed #000;margin:1px 0;height:1px}
.r{display:flex;justify-content:space-between;margin:0}.t{font-weight:bold}
</style></head><body>`;
    
    // Business info
    html += `<div class="c b" style="font-size:12px">${settings.business_name || 'GenZ Laundry'}</div>`;
    html += `<div class="c" style="font-size:9px">${settings.address || 'Your Address Here'}</div>`;
    html += `<div class="c" style="font-size:9px">Ph: ${settings.phone || 'Your Phone'}</div>`;
    if (settings.gstin) {
        html += `<div class="c" style="font-size:9px">GSTIN: ${settings.gstin}</div>`;
    }
    html += `<div class="l"></div>`;
    
    // Invoice info
    html += `<div style="font-size:9px">Invoice: ${invoice.invoice_number}</div>`;
    html += `<div style="font-size:9px">Date: ${date} ${time}</div>`;
    if (invoice.customer_name) {
        html += `<div style="font-size:9px">Customer: ${invoice.customer_name}</div>`;
    }
    if (invoice.customer_phone) {
        html += `<div style="font-size:9px">Phone: ${invoice.customer_phone}</div>`;
    }
    html += `<div class="l"></div>`;
    
    // Services header
    html += `<div class="c b">SERVICES</div>`;
    
    // Items
    invoice.items.forEach(item => {
        const serviceName = item.service_name.length > 20 ? 
            item.service_name.substring(0, 17) + '...' : 
            item.service_name;
        html += `<div class="r" style="font-size:9px"><span>${serviceName}</span><span>₹${item.amount.toFixed(2)}</span></div>`;
        html += `<div style="font-size:8px;margin-left:3px;color:#333">${item.quantity} ${item.unit} × ₹${item.rate.toFixed(2)}</div>`;
    });
    
    html += `<div class="l"></div>`;
    
    // Totals
    html += `<div class="r"><span>Subtotal:</span><span>₹${invoice.subtotal.toFixed(2)}</span></div>`;
    
    if (invoice.discount > 0) {
        html += `<div class="r"><span>Discount:</span><span>-₹${invoice.discount.toFixed(2)}</span></div>`;
    }
    
    if (invoice.gst_amount > 0) {
        html += `<div class="r"><span>GST (18%):</span><span>₹${invoice.gst_amount.toFixed(2)}</span></div>`;
    }
    
    html += `<div class="l"></div>`;
    html += `<div class="r t"><span>TOTAL:</span><span>₹${invoice.total.toFixed(2)}</span></div>`;
    html += `<div class="l"></div>`;
    
    // Footer
    html += `<div class="c" style="font-size:9px">${settings.terms || 'Thank you for choosing GenZ Laundry!'}</div>`;
    html += `<div class="c" style="font-size:9px">Visit Again!</div>`;
    html += `<div class="c">***</div>`;
    
    // Auto-print script
    html += `<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}</script>`;
    html += `</body></html>`;
    
    return html;
}

function printZeroWaste(invoice, settings) {
    const html = createMinimalReceipt(invoice, settings);
    
    // Create blob URL for minimal document
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window with minimal size
    const printWindow = window.open(url, '_blank', 'width=300,height=200,scrollbars=no,resizable=no,menubar=no,toolbar=no,status=no');
    
    if (!printWindow) {
        // Fallback: direct window method
        const fallbackWindow = window.open('', '_blank', 'width=300,height=200');
        fallbackWindow.document.write(html);
        fallbackWindow.document.close();
    }
    
    // Clean up blob URL after use
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 5000);
}

// Alternative method using iframe
function printViaIframe(invoice, settings) {
    const html = createMinimalReceipt(invoice, settings);
    
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '80mm';
    iframe.style.height = 'auto';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    // Write content and print
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    
    iframe.onload = () => {
        setTimeout(() => {
            iframe.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 100);
    };
}

// Export methods
window.zeroWastePrinter = {
    print: printZeroWaste,
    printViaIframe: printViaIframe,
    createReceipt: createMinimalReceipt
};