// Global state
let currentUser = null;
let authToken = null;
let customers = [];
let services = [];
let invoices = [];
let settings = {};

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for existing token
    authToken = localStorage.getItem('authToken');
    if (authToken) {
        showMainApp();
        loadDashboard();
    } else {
        showLoginScreen();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize date inputs
    document.getElementById('dailyReportDate').value = new Date().toISOString().split('T')[0];
    
    // Initialize year select
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // Set current month
    document.getElementById('monthSelect').value = new Date().getMonth() + 1;
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.dataset.screen;
            showScreen(screen);
        });
    });
    
    // Create invoice buttons
    document.getElementById('createInvoiceBtn').addEventListener('click', () => openInvoiceModal());
    document.getElementById('newInvoiceBtn').addEventListener('click', () => openInvoiceModal());
    
    // Customer management
    document.getElementById('addCustomerBtn').addEventListener('click', () => openCustomerModal());
    document.getElementById('customerForm').addEventListener('submit', handleCustomerSubmit);
    
    // Service management
    document.getElementById('addServiceBtn').addEventListener('click', () => openServiceModal());
    document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
    
    // Invoice form
    document.getElementById('invoiceForm').addEventListener('submit', handleInvoiceSubmit);
    document.getElementById('addInvoiceItem').addEventListener('click', addInvoiceItem);
    
    // Quick customer form
    document.getElementById('quickAddCustomer').addEventListener('click', showQuickCustomerForm);
    document.getElementById('invoiceCustomer').addEventListener('change', handleCustomerSelectChange);
    document.getElementById('saveQuickCustomer').addEventListener('click', saveQuickCustomer);
    document.getElementById('cancelQuickCustomer').addEventListener('click', hideQuickCustomerForm);
    
    // Settings
    document.getElementById('settingsForm').addEventListener('submit', handleSettingsSubmit);
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    
    // Reports
    document.getElementById('generateDailyReport').addEventListener('click', generateDailyReport);
    document.getElementById('generateMonthlyReport').addEventListener('click', generateMonthlyReport);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            
            showMainApp();
            loadDashboard();
        } else {
            showMessage('Invalid credentials', 'error');
        }
    } catch (error) {
        showMessage('Login failed', 'error');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showLoginScreen();
}

// Screen management
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('mainApp').classList.remove('active');
}

function showMainApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');
}

function showScreen(screenName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-screen="${screenName}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.content-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}Screen`).classList.add('active');
    
    // Load screen data
    switch(screenName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'invoices':
            loadInvoices();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'services':
            loadServices();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// API helpers
async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (response.status === 401) {
        handleLogout();
        return null;
    }
    
    return response.json();
}

// Dashboard
async function loadDashboard() {
    try {
        const data = await apiCall('/dashboard');
        if (data) {
            document.getElementById('todayInvoices').textContent = data.today_invoices;
            document.getElementById('todayRevenue').textContent = `₹${data.today_revenue.toFixed(2)}`;
            document.getElementById('monthlyRevenue').textContent = `₹${data.monthly_revenue.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Customers
async function loadCustomers() {
    try {
        customers = await apiCall('/customers');
        if (customers) {
            renderCustomersTable();
            updateCustomerSelects();
        }
    } catch (error) {
        console.error('Failed to load customers:', error);
    }
}

function renderCustomersTable() {
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.phone || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>${customer.gst_number || '-'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editCustomer(${customer.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateCustomerSelects() {
    const select = document.getElementById('invoiceCustomer');
    select.innerHTML = `
        <option value="">Select Customer or Walk-in</option>
        <option value="new">+ Add New Customer</option>
    `;
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

function openCustomerModal(customerId = null) {
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');
    const form = document.getElementById('customerForm');
    
    if (customerId) {
        const customer = customers.find(c => c.id === customerId);
        title.textContent = 'Edit Customer';
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerGst').value = customer.gst_number || '';
        form.dataset.customerId = customerId;
    } else {
        title.textContent = 'Add Customer';
        form.reset();
        delete form.dataset.customerId;
    }
    
    modal.classList.add('active');
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const customerId = form.dataset.customerId;
    
    const customerData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        gst_number: document.getElementById('customerGst').value
    };
    
    try {
        if (customerId) {
            await apiCall(`/customers/${customerId}`, {
                method: 'PUT',
                body: JSON.stringify(customerData)
            });
            showMessage('Customer updated successfully', 'success');
        } else {
            await apiCall('/customers', {
                method: 'POST',
                body: JSON.stringify(customerData)
            });
            showMessage('Customer added successfully', 'success');
        }
        
        closeModal('customerModal');
        loadCustomers();
    } catch (error) {
        showMessage('Failed to save customer', 'error');
    }
}

function editCustomer(id) {
    openCustomerModal(id);
}

async function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            await apiCall(`/customers/${id}`, { method: 'DELETE' });
            showMessage('Customer deleted successfully', 'success');
            loadCustomers();
        } catch (error) {
            showMessage('Failed to delete customer', 'error');
        }
    }
}

// Services
async function loadServices() {
    try {
        services = await apiCall('/services');
        if (services) {
            renderServicesTable();
            updateServiceSelects();
        }
    } catch (error) {
        console.error('Failed to load services:', error);
    }
}

function renderServicesTable() {
    const tbody = document.querySelector('#servicesTable tbody');
    tbody.innerHTML = '';
    
    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${service.name}</td>
            <td>₹${service.rate}</td>
            <td>${service.unit}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editService(${service.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateServiceSelects() {
    document.querySelectorAll('.service-select').forEach(select => {
        select.innerHTML = `
            <option value="">Select Service</option>
            <option value="custom">+ Custom Service</option>
        `;
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = `${service.name} (₹${service.rate}/${service.unit})`;
            option.dataset.rate = service.rate;
            option.dataset.unit = service.unit;
            select.appendChild(option);
        });
    });
}

function openServiceModal(serviceId = null) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const form = document.getElementById('serviceForm');
    
    if (serviceId) {
        const service = services.find(s => s.id === serviceId);
        title.textContent = 'Edit Service';
        document.getElementById('serviceName').value = service.name;
        document.getElementById('serviceRate').value = service.rate;
        document.getElementById('serviceUnit').value = service.unit;
        form.dataset.serviceId = serviceId;
    } else {
        title.textContent = 'Add Service';
        form.reset();
        delete form.dataset.serviceId;
    }
    
    modal.classList.add('active');
}

async function handleServiceSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const serviceId = form.dataset.serviceId;
    
    const serviceData = {
        name: document.getElementById('serviceName').value,
        rate: parseFloat(document.getElementById('serviceRate').value),
        unit: document.getElementById('serviceUnit').value
    };
    
    try {
        if (serviceId) {
            await apiCall(`/services/${serviceId}`, {
                method: 'PUT',
                body: JSON.stringify(serviceData)
            });
            showMessage('Service updated successfully', 'success');
        } else {
            await apiCall('/services', {
                method: 'POST',
                body: JSON.stringify(serviceData)
            });
            showMessage('Service added successfully', 'success');
        }
        
        closeModal('serviceModal');
        loadServices();
    } catch (error) {
        showMessage('Failed to save service', 'error');
    }
}

function editService(id) {
    openServiceModal(id);
}

async function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        try {
            await apiCall(`/services/${id}`, { method: 'DELETE' });
            showMessage('Service deleted successfully', 'success');
            loadServices();
        } catch (error) {
            showMessage('Failed to delete service', 'error');
        }
    }
}

// Quick customer functions
function handleCustomerSelectChange() {
    const select = document.getElementById('invoiceCustomer');
    if (select.value === 'new') {
        showQuickCustomerForm();
        select.value = ''; // Reset select
    }
}

function showQuickCustomerForm() {
    const form = document.getElementById('quickCustomerForm');
    form.classList.remove('hidden');
    document.getElementById('quickCustomerName').focus();
}

function hideQuickCustomerForm() {
    const form = document.getElementById('quickCustomerForm');
    form.classList.add('hidden');
    // Clear form
    document.getElementById('quickCustomerName').value = '';
    document.getElementById('quickCustomerPhone').value = '';
    document.getElementById('quickCustomerAddress').value = '';
    document.getElementById('quickCustomerGst').value = '';
}

async function saveQuickCustomer() {
    const name = document.getElementById('quickCustomerName').value.trim();
    if (!name) {
        showMessage('Customer name is required', 'error');
        return;
    }
    
    const customerData = {
        name: name,
        phone: document.getElementById('quickCustomerPhone').value.trim(),
        address: document.getElementById('quickCustomerAddress').value.trim(),
        gst_number: document.getElementById('quickCustomerGst').value.trim()
    };
    
    try {
        const result = await apiCall('/customers', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
        
        if (result) {
            // Add to local customers array
            customers.push(result);
            
            // Update customer select
            updateCustomerSelects();
            
            // Select the new customer
            document.getElementById('invoiceCustomer').value = result.id;
            
            // Hide form
            hideQuickCustomerForm();
            
            showMessage('Customer added successfully', 'success');
        }
    } catch (error) {
        showMessage('Failed to add customer', 'error');
    }
}
async function loadInvoices() {
    try {
        invoices = await apiCall('/invoices');
        if (invoices) {
            renderInvoicesTable();
        }
    } catch (error) {
        console.error('Failed to load invoices:', error);
    }
}

function renderInvoicesTable() {
    const tbody = document.querySelector('#invoicesTable tbody');
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        const date = new Date(invoice.created_at).toLocaleDateString();
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.customer_name || 'Walk-in'}</td>
            <td>${date}</td>
            <td>₹${invoice.total.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="viewInvoice(${invoice.id})">View</button>
                <button class="btn btn-sm btn-primary" onclick="printInvoice(${invoice.id})">Print</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function openInvoiceModal() {
    // Load required data
    if (customers.length === 0) await loadCustomers();
    if (services.length === 0) await loadServices();
    if (Object.keys(settings).length === 0) await loadSettings();
    
    const modal = document.getElementById('invoiceModal');
    const form = document.getElementById('invoiceForm');
    
    form.reset();
    
    // Hide quick customer form
    hideQuickCustomerForm();
    
    // Reset invoice items
    const itemsContainer = document.getElementById('invoiceItems');
    itemsContainer.innerHTML = '';
    addInvoiceItem();
    
    // Reset totals
    updateInvoiceTotals();
    
    modal.classList.add('active');
}

function addInvoiceItem() {
    const container = document.getElementById('invoiceItems');
    const item = document.createElement('div');
    item.className = 'invoice-item';
    
    item.innerHTML = `
        <div class="service-input-group">
            <select class="service-select">
                <option value="">Select Service</option>
                <option value="custom">+ Custom Service</option>
            </select>
            <input type="text" class="custom-service-name hidden" placeholder="Service Name">
            <select class="custom-service-unit hidden">
                <option value="kg">kg</option>
                <option value="piece">piece</option>
                <option value="item">item</option>
            </select>
        </div>
        <input type="number" class="quantity-input" placeholder="Qty" step="0.01" required>
        <input type="number" class="rate-input" placeholder="Rate" step="0.01" required>
        <span class="amount-display">₹0.00</span>
        <button type="button" class="btn btn-danger btn-sm remove-item">×</button>
    `;
    
    container.appendChild(item);
    
    // Update service options
    const select = item.querySelector('.service-select');
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} (₹${service.rate}/${service.unit})`;
        option.dataset.rate = service.rate;
        option.dataset.unit = service.unit;
        select.appendChild(option);
    });
    
    // Add event listeners
    select.addEventListener('change', function() {
        const rateInput = item.querySelector('.rate-input');
        const customNameInput = item.querySelector('.custom-service-name');
        const customUnitSelect = item.querySelector('.custom-service-unit');
        
        if (this.value === 'custom') {
            // Show custom service inputs
            customNameInput.classList.remove('hidden');
            customUnitSelect.classList.remove('hidden');
            rateInput.value = '';
        } else {
            // Hide custom service inputs
            customNameInput.classList.add('hidden');
            customUnitSelect.classList.add('hidden');
            
            if (this.selectedOptions[0] && this.selectedOptions[0].dataset.rate) {
                rateInput.value = this.selectedOptions[0].dataset.rate;
            }
        }
        updateItemAmount(item);
    });
    
    item.querySelector('.quantity-input').addEventListener('input', () => updateItemAmount(item));
    item.querySelector('.rate-input').addEventListener('input', () => updateItemAmount(item));
    item.querySelector('.custom-service-name').addEventListener('input', () => updateItemAmount(item));
    
    item.querySelector('.remove-item').addEventListener('click', function() {
        if (container.children.length > 1) {
            item.remove();
            updateInvoiceTotals();
        }
    });
}

function updateItemAmount(item) {
    const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
    const rate = parseFloat(item.querySelector('.rate-input').value) || 0;
    const amount = quantity * rate;
    
    item.querySelector('.amount-display').textContent = `₹${amount.toFixed(2)}`;
    updateInvoiceTotals();
}

function updateInvoiceTotals() {
    const items = document.querySelectorAll('.invoice-item');
    let subtotal = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
        const rate = parseFloat(item.querySelector('.rate-input').value) || 0;
        subtotal += quantity * rate;
    });
    
    const discount = parseFloat(document.getElementById('discountAmount').value) || 0;
    const discountType = document.getElementById('discountType').value;
    
    let discountAmount = discountType === 'percentage' ? (subtotal * discount / 100) : discount;
    let gstAmount = settings.gst_enabled ? ((subtotal - discountAmount) * 0.18) : 0;
    let total = subtotal - discountAmount + gstAmount;
    
    document.getElementById('subtotalDisplay').value = `₹${subtotal.toFixed(2)}`;
    document.getElementById('gstDisplay').value = `₹${gstAmount.toFixed(2)}`;
    document.getElementById('totalDisplay').value = `₹${total.toFixed(2)}`;
}

// Add event listeners for discount changes
document.getElementById('discountAmount').addEventListener('input', updateInvoiceTotals);
document.getElementById('discountType').addEventListener('change', updateInvoiceTotals);

async function handleInvoiceSubmit(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('invoiceCustomer').value;
    const items = [];
    
    // Process each invoice item
    for (const itemElement of document.querySelectorAll('.invoice-item')) {
        const serviceSelect = itemElement.querySelector('.service-select');
        const customNameInput = itemElement.querySelector('.custom-service-name');
        const customUnitSelect = itemElement.querySelector('.custom-service-unit');
        const quantity = parseFloat(itemElement.querySelector('.quantity-input').value);
        const rate = parseFloat(itemElement.querySelector('.rate-input').value);
        
        if (!quantity || !rate) continue;
        
        let serviceId = serviceSelect.value;
        let serviceName = '';
        let serviceUnit = 'kg';
        
        if (serviceSelect.value === 'custom') {
            // Handle custom service
            serviceName = customNameInput.value.trim();
            serviceUnit = customUnitSelect.value;
            
            if (!serviceName) {
                showMessage('Please enter service name for custom services', 'error');
                return;
            }
            
            // Create the service first
            try {
                const newService = await apiCall('/services', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: serviceName,
                        rate: rate,
                        unit: serviceUnit
                    })
                });
                
                if (newService) {
                    serviceId = newService.id;
                    // Add to local services array
                    services.push(newService);
                }
            } catch (error) {
                showMessage('Failed to create custom service', 'error');
                return;
            }
        } else if (serviceSelect.value) {
            // Use existing service
            const service = services.find(s => s.id == serviceSelect.value);
            if (service) {
                serviceName = service.name;
                serviceUnit = service.unit;
            }
        } else {
            showMessage('Please select or enter a service', 'error');
            return;
        }
        
        items.push({ 
            service_id: serviceId, 
            quantity, 
            rate,
            service_name: serviceName,
            unit: serviceUnit
        });
    }
    
    if (items.length === 0) {
        showMessage('Please add at least one service', 'error');
        return;
    }
    
    const invoiceData = {
        customer_id: customerId || null,
        items,
        discount: parseFloat(document.getElementById('discountAmount').value) || 0,
        discount_type: document.getElementById('discountType').value,
        gst_enabled: settings.gst_enabled
    };
    
    try {
        const result = await apiCall('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData)
        });
        
        if (result) {
            showMessage('Invoice created successfully', 'success');
            closeModal('invoiceModal');
            
            // Print invoice
            await printInvoice(result.id);
            
            // Refresh data
            loadInvoices();
            loadDashboard();
            
            // Update service selects in case new services were added
            updateServiceSelects();
        }
    } catch (error) {
        showMessage('Failed to create invoice', 'error');
    }
}

async function viewInvoice(id) {
    try {
        const invoice = await apiCall(`/invoices/${id}`);
        if (invoice) {
            showInvoiceViewModal(invoice);
        }
    } catch (error) {
        showMessage('Failed to load invoice', 'error');
    }
}

function showInvoiceViewModal(invoice) {
    // Populate invoice information
    document.getElementById('viewInvoiceNumber').textContent = invoice.invoice_number || 'N/A';
    
    const date = new Date(invoice.created_at);
    document.getElementById('viewInvoiceDate').textContent = date.toLocaleDateString('en-IN');
    document.getElementById('viewInvoiceTime').textContent = date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Populate customer information
    document.getElementById('viewCustomerName').textContent = invoice.customer_name || 'Walk-in Customer';
    document.getElementById('viewCustomerPhone').textContent = invoice.customer_phone || '-';
    document.getElementById('viewCustomerAddress').textContent = invoice.customer_address || '-';
    
    // Populate invoice items
    const itemsTableBody = document.getElementById('viewInvoiceItems');
    itemsTableBody.innerHTML = '';
    
    if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.service_name || 'Service'}</td>
                <td>${item.quantity || 0} ${item.unit || 'unit'}</td>
                <td>₹${(item.rate || 0).toFixed(2)}</td>
                <td>₹${(item.amount || 0).toFixed(2)}</td>
            `;
            itemsTableBody.appendChild(row);
        });
    } else {
        // Show message if no items
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" style="text-align: center; color: #666;">No items found</td>`;
        itemsTableBody.appendChild(row);
    }
    
    // Populate totals
    document.getElementById('viewSubtotal').textContent = `₹${(invoice.subtotal || 0).toFixed(2)}`;
    document.getElementById('viewTotal').textContent = `₹${(invoice.total || 0).toFixed(2)}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('viewDiscountRow');
    if (invoice.discount && invoice.discount > 0) {
        document.getElementById('viewDiscount').textContent = `-₹${invoice.discount.toFixed(2)}`;
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }
    
    // Show/hide GST row
    const gstRow = document.getElementById('viewGstRow');
    if (invoice.gst_amount && invoice.gst_amount > 0) {
        document.getElementById('viewGst').textContent = `₹${invoice.gst_amount.toFixed(2)}`;
        gstRow.style.display = 'flex';
    } else {
        gstRow.style.display = 'none';
    }
    
    // Set up print button
    const printBtn = document.getElementById('printFromView');
    printBtn.onclick = () => {
        printInvoice(invoice.id);
        closeModal('invoiceViewModal'); // Close view modal after printing
    };
    
    // Show modal
    document.getElementById('invoiceViewModal').classList.add('active');
}

async function printInvoice(id) {
    try {
        const invoice = await apiCall(`/invoices/${id}`);
        if (invoice && settings) {
            generateThermalReceipt(invoice);
        }
    } catch (error) {
        showMessage('Failed to print invoice', 'error');
    }
}

async function generateThermalReceipt(invoice) {
    try {
        // Use enhanced direct printing for immediate printing to billing machine
        if (window.enhancedThermalPrint) {
            await window.enhancedThermalPrint(invoice, settings);
            showMessage('Receipt sent to thermal printer', 'success');
        } else if (window.directThermalPrinter) {
            // Fallback to direct thermal printer
            window.directThermalPrinter.print(invoice, settings);
            showMessage('Receipt printed', 'success');
        } else if (window.zeroWastePrinter) {
            // Fallback to zero-waste printer
            window.zeroWastePrinter.print(invoice, settings);
        } else {
            // Final fallback
            console.error('No thermal printer modules loaded');
            showMessage('Print module not available', 'error');
        }
    } catch (error) {
        console.error('Printing failed:', error);
        showMessage('Printing failed: ' + error.message, 'error');
        
        // Try fallback method
        if (window.directThermalPrinter) {
            window.directThermalPrinter.print(invoice, settings);
        }
    }
}

// Settings
async function loadSettings() {
    try {
        settings = await apiCall('/settings');
        if (settings) {
            document.getElementById('businessName').value = settings.business_name || '';
            document.getElementById('businessAddress').value = settings.address || '';
            document.getElementById('businessPhone').value = settings.phone || '';
            document.getElementById('gstin').value = settings.gstin || '';
            document.getElementById('gstEnabled').checked = settings.gst_enabled;
            document.getElementById('terms').value = settings.terms || '';
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const settingsData = {
        business_name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        gstin: document.getElementById('gstin').value,
        gst_enabled: document.getElementById('gstEnabled').checked ? 1 : 0,
        terms: document.getElementById('terms').value
    };
    
    try {
        await apiCall('/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData)
        });
        
        settings = { ...settings, ...settingsData };
        showMessage('Settings saved successfully', 'success');
    } catch (error) {
        showMessage('Failed to save settings', 'error');
    }
}

async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('logo', file);
    
    try {
        const response = await fetch(`${API_BASE}/upload-logo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        const result = await response.json();
        if (response.ok) {
            showMessage('Logo uploaded successfully', 'success');
        } else {
            showMessage('Failed to upload logo', 'error');
        }
    } catch (error) {
        showMessage('Failed to upload logo', 'error');
    }
}

// Reports
async function generateDailyReport() {
    const date = document.getElementById('dailyReportDate').value;
    if (!date) {
        showMessage('Please select a date', 'error');
        return;
    }
    
    try {
        const data = await apiCall(`/reports/daily?date=${date}`);
        if (data) {
            renderDailyReport(data, date);
        }
    } catch (error) {
        showMessage('Failed to generate report', 'error');
    }
}

function renderDailyReport(data, date) {
    const container = document.getElementById('dailyReportResult');
    
    if (data.length === 0) {
        container.innerHTML = '<p>No invoices found for this date.</p>';
        return;
    }
    
    const total = data.reduce((sum, invoice) => sum + invoice.total, 0);
    
    let html = `
        <h4>Daily Report - ${new Date(date).toLocaleDateString()}</h4>
        <p><strong>Total Invoices:</strong> ${data.length}</p>
        <p><strong>Total Revenue:</strong> ₹${total.toFixed(2)}</p>
        <table>
            <thead>
                <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(invoice => {
        const time = new Date(invoice.created_at).toLocaleTimeString();
        html += `
            <tr>
                <td>${invoice.invoice_number}</td>
                <td>${invoice.customer_name || 'Walk-in'}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td>${time}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function generateMonthlyReport() {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;
    
    try {
        const data = await apiCall(`/reports/monthly?month=${month}&year=${year}`);
        if (data) {
            renderMonthlyReport(data, month, year);
        }
    } catch (error) {
        showMessage('Failed to generate report', 'error');
    }
}

function renderMonthlyReport(data, month, year) {
    const container = document.getElementById('monthlyReportResult');
    
    if (data.length === 0) {
        container.innerHTML = '<p>No data found for this month.</p>';
        return;
    }
    
    const totalRevenue = data.reduce((sum, day) => sum + day.total_revenue, 0);
    const totalInvoices = data.reduce((sum, day) => sum + day.invoice_count, 0);
    
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <h4>Monthly Report - ${monthNames[parseInt(month)]} ${year}</h4>
        <p><strong>Total Invoices:</strong> ${totalInvoices}</p>
        <p><strong>Total Revenue:</strong> ₹${totalRevenue.toFixed(2)}</p>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Invoices</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach(day => {
        const date = new Date(day.date).toLocaleDateString();
        html += `
            <tr>
                <td>${date}</td>
                <td>${day.invoice_count}</td>
                <td>₹${day.total_revenue.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Utility functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the content area
    const content = document.querySelector('.content');
    content.insertBefore(messageDiv, content.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}