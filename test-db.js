const sqlite3 = require('sqlite3').verbose();

// Test database connection and setup
const db = new sqlite3.Database('laundry.db');

console.log('Testing GenZ Laundry Database...\n');

// Test admin table
db.get('SELECT * FROM admin LIMIT 1', (err, admin) => {
    if (err) {
        console.error('❌ Admin table error:', err.message);
    } else {
        console.log('✅ Admin table OK - Email:', admin.email);
    }
});

// Test customers table
db.all('SELECT COUNT(*) as count FROM customers', (err, result) => {
    if (err) {
        console.error('❌ Customers table error:', err.message);
    } else {
        console.log('✅ Customers table OK - Count:', result[0].count);
    }
});

// Test services table
db.all('SELECT COUNT(*) as count FROM services', (err, result) => {
    if (err) {
        console.error('❌ Services table error:', err.message);
    } else {
        console.log('✅ Services table OK - Count:', result[0].count);
    }
});

// Test settings table
db.get('SELECT * FROM settings WHERE id = 1', (err, settings) => {
    if (err) {
        console.error('❌ Settings table error:', err.message);
    } else {
        console.log('✅ Settings table OK - Business:', settings.business_name);
    }
});

// Test invoices table
db.all('SELECT COUNT(*) as count FROM invoices', (err, result) => {
    if (err) {
        console.error('❌ Invoices table error:', err.message);
    } else {
        console.log('✅ Invoices table OK - Count:', result[0].count);
    }
});

// List default services
db.all('SELECT name, rate, unit FROM services', (err, services) => {
    if (err) {
        console.error('❌ Error loading services:', err.message);
    } else {
        console.log('\n📋 Default Services:');
        services.forEach(service => {
            console.log(`   • ${service.name}: ₹${service.rate}/${service.unit}`);
        });
    }
    
    console.log('\n🚀 Database test completed!');
    console.log('💡 Start the server with: npm start');
    console.log('🌐 Access at: http://localhost:3000');
    console.log('🔑 Login: admin@genzlaundry.com / admin123');
    
    db.close();
});