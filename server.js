const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'genz-laundry-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, 'logo-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Database initialization
const db = new sqlite3.Database('laundry.db');

// Initialize database tables
db.serialize(() => {
  // Admin table
  db.run(`CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT DEFAULT 'GenZ Laundry',
    address TEXT DEFAULT 'Your Address Here',
    phone TEXT DEFAULT 'Your Phone',
    gstin TEXT,
    logo_path TEXT,
    gst_enabled INTEGER DEFAULT 0,
    terms TEXT DEFAULT 'Thank you for choosing GenZ Laundry!'
  )`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    gst_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Services table
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rate REAL NOT NULL,
    unit TEXT DEFAULT 'kg',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Invoices table
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE,
    customer_id INTEGER,
    subtotal REAL,
    discount REAL DEFAULT 0,
    discount_type TEXT DEFAULT 'amount',
    gst_amount REAL DEFAULT 0,
    total REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers (id)
  )`);

  // Invoice items table
  db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    service_id INTEGER,
    quantity REAL,
    rate REAL,
    amount REAL,
    FOREIGN KEY (invoice_id) REFERENCES invoices (id),
    FOREIGN KEY (service_id) REFERENCES services (id)
  )`);

  // Insert default admin and settings
  db.run(`INSERT OR IGNORE INTO admin (email, password) VALUES (?, ?)`, 
    ['admin@genzlaundry.com', bcrypt.hashSync('admin123', 10)]);
  
  db.run(`INSERT OR IGNORE INTO settings (id) VALUES (1)`);
  
  // Insert default services
  const defaultServices = [
    ['Washing', 50, 'kg'],
    ['Dry Cleaning', 80, 'piece'],
    ['Ironing', 30, 'kg'],
    ['Premium Wash', 70, 'kg'],
    ['Express Service', 100, 'kg']
  ];
  
  defaultServices.forEach(service => {
    db.run(`INSERT OR IGNORE INTO services (name, rate, unit) VALUES (?, ?, ?)`, service);
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM admin WHERE email = ?', [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  });
});

// Dashboard stats
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  db.all(`
    SELECT 
      COUNT(*) as today_invoices,
      COALESCE(SUM(total), 0) as today_revenue
    FROM invoices 
    WHERE DATE(created_at) = ?
  `, [today], (err, todayStats) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(`
      SELECT COALESCE(SUM(total), 0) as monthly_revenue
      FROM invoices 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `, (err, monthlyStats) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        today_invoices: todayStats[0].today_invoices,
        today_revenue: todayStats[0].today_revenue,
        monthly_revenue: monthlyStats[0].monthly_revenue
      });
    });
  });
});

// Customer routes
app.get('/api/customers', authenticateToken, (req, res) => {
  db.all('SELECT * FROM customers ORDER BY name', (err, customers) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(customers);
  });
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const { name, phone, address, gst_number } = req.body;
  
  db.run('INSERT INTO customers (name, phone, address, gst_number) VALUES (?, ?, ?, ?)',
    [name, phone, address, gst_number], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, phone, address, gst_number });
    });
});

app.put('/api/customers/:id', authenticateToken, (req, res) => {
  const { name, phone, address, gst_number } = req.body;
  
  db.run('UPDATE customers SET name = ?, phone = ?, address = ?, gst_number = ? WHERE id = ?',
    [name, phone, address, gst_number, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/customers/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM customers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Service routes
app.get('/api/services', authenticateToken, (req, res) => {
  db.all('SELECT * FROM services ORDER BY name', (err, services) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(services);
  });
});

app.post('/api/services', authenticateToken, (req, res) => {
  const { name, rate, unit } = req.body;
  
  db.run('INSERT INTO services (name, rate, unit) VALUES (?, ?, ?)',
    [name, rate, unit], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, rate, unit });
    });
});

app.put('/api/services/:id', authenticateToken, (req, res) => {
  const { name, rate, unit } = req.body;
  
  db.run('UPDATE services SET name = ?, rate = ?, unit = ? WHERE id = ?',
    [name, rate, unit, req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.delete('/api/services/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM services WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Invoice routes
app.get('/api/invoices', authenticateToken, (req, res) => {
  db.all(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    ORDER BY i.created_at DESC
    LIMIT 100
  `, (err, invoices) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(invoices);
  });
});

app.post('/api/invoices', authenticateToken, (req, res) => {
  const { customer_id, items, discount, discount_type, gst_enabled } = req.body;
  
  // Generate invoice number
  const invoiceNumber = 'INV' + Date.now();
  
  // Calculate totals
  let subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  let discountAmount = discount_type === 'percentage' ? (subtotal * discount / 100) : discount;
  let gstAmount = gst_enabled ? ((subtotal - discountAmount) * 0.18) : 0;
  let total = subtotal - discountAmount + gstAmount;
  
  db.run(`INSERT INTO invoices (invoice_number, customer_id, subtotal, discount, discount_type, gst_amount, total)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [invoiceNumber, customer_id, subtotal, discountAmount, discount_type, gstAmount, total],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const invoiceId = this.lastID;
      
      // Insert invoice items
      const stmt = db.prepare('INSERT INTO invoice_items (invoice_id, service_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)');
      
      items.forEach(item => {
        stmt.run([invoiceId, item.service_id, item.quantity, item.rate, item.quantity * item.rate]);
      });
      
      stmt.finalize();
      
      res.json({ 
        id: invoiceId, 
        invoice_number: invoiceNumber,
        subtotal,
        discount: discountAmount,
        gst_amount: gstAmount,
        total
      });
    });
});

app.get('/api/invoices/:id', authenticateToken, (req, res) => {
  db.get(`
    SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE i.id = ?
  `, [req.params.id], (err, invoice) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(`
      SELECT ii.*, s.name as service_name, s.unit
      FROM invoice_items ii
      JOIN services s ON ii.service_id = s.id
      WHERE ii.invoice_id = ?
    `, [req.params.id], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({ ...invoice, items });
    });
  });
});

// Settings routes
app.get('/api/settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM settings WHERE id = 1', (err, settings) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(settings);
  });
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const { business_name, address, phone, gstin, gst_enabled, terms } = req.body;
  
  db.run(`UPDATE settings SET business_name = ?, address = ?, phone = ?, gstin = ?, gst_enabled = ?, terms = ? WHERE id = 1`,
    [business_name, address, phone, gstin, gst_enabled, terms], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
});

app.post('/api/upload-logo', authenticateToken, upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  db.run('UPDATE settings SET logo_path = ? WHERE id = 1', [req.file.filename], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logo_path: req.file.filename });
  });
});

// Reports
app.get('/api/reports/daily', authenticateToken, (req, res) => {
  const { date } = req.query;
  
  db.all(`
    SELECT i.*, c.name as customer_name
    FROM invoices i
    LEFT JOIN customers c ON i.customer_id = c.id
    WHERE DATE(i.created_at) = ?
    ORDER BY i.created_at DESC
  `, [date], (err, invoices) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(invoices);
  });
});

app.get('/api/reports/monthly', authenticateToken, (req, res) => {
  const { month, year } = req.query;
  
  db.all(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as invoice_count,
      SUM(total) as total_revenue
    FROM invoices
    WHERE strftime('%Y', created_at) = ? AND strftime('%m', created_at) = ?
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `, [year, month.padStart(2, '0')], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GenZ Laundry Billing Server running on http://localhost:${PORT}`);
  console.log('Default login: admin@genzlaundry.com / admin123');
});