const sqlite3 = require('sqlite3').verbose();

// Create a test invoice for testing the view functionality
const db = new sqlite3.Database('laundry.db');

console.log('Creating test invoice...\n');

// First, let's add a test customer
db.run(`INSERT OR IGNORE INTO customers (id, name, phone, address) VALUES (999, 'Test Customer', '9876543210', 'Test Address, Test City')`, function(err) {
    if (err) {
        console.error('Error creating test customer:', err.message);
        return;
    }
    
    // Generate test invoice
    const invoiceNumber = 'TEST' + Date.now();
    const subtotal = 150;
    const discount = 10;
    const gstAmount = 25.2; // 18% on (150-10)
    const total = subtotal - discount + gstAmount;
    
    db.run(`INSERT INTO invoices (invoice_number, customer_id, subtotal, discount, discount_type, gst_amount, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNumber, 999, subtotal, discount, 'amount', gstAmount, total],
        function(err) {
            if (err) {
                console.error('Error creating test invoice:', err.message);
                return;
            }
            
            const invoiceId = this.lastID;
            console.log(`✅ Test invoice created: ${invoiceNumber} (ID: ${invoiceId})`);
            
            // Add test invoice items
            const items = [
                [1, 2, 50, 100], // Washing: 2kg × ₹50 = ₹100
                [2, 1, 50, 50]   // Dry Cleaning: 1 piece × ₹50 = ₹50
            ];
            
            const stmt = db.prepare('INSERT INTO invoice_items (invoice_id, service_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)');
            
            items.forEach(item => {
                stmt.run([invoiceId, ...item]);
            });
            
            stmt.finalize();
            
            console.log('✅ Test invoice items added');
            console.log('\n📋 Test Invoice Details:');
            console.log(`   • Invoice #: ${invoiceNumber}`);
            console.log(`   • Customer: Test Customer`);
            console.log(`   • Items: 2 services`);
            console.log(`   • Subtotal: ₹${subtotal}`);
            console.log(`   • Discount: ₹${discount}`);
            console.log(`   • GST: ₹${gstAmount}`);
            console.log(`   • Total: ₹${total.toFixed(2)}`);
            
            console.log('\n🎯 Test the View button:');
            console.log('   1. Start the server: npm start');
            console.log('   2. Go to Invoices page');
            console.log('   3. Click "View" on the test invoice');
            console.log('   4. Verify all details are displayed correctly');
            
            db.close();
        });
});