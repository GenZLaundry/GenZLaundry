# GenZ Laundry Billing - Quick Guide

## 🚀 New Features: Inline Customer & Service Creation

### Adding Customers During Invoice Creation

1. **Open Invoice Creation**
   - Click "Create Invoice" from Dashboard or "New Invoice" from Invoices page

2. **Add New Customer On-the-Fly**
   - In the Customer section, click the **"+ Add New Customer"** option from dropdown
   - OR click the **"+"** button next to the customer select
   - Fill in customer details in the quick form that appears:
     - Customer Name (required)
     - Phone (optional)
     - Address (optional)
     - GST Number (optional)
   - Click **"Save Customer"** to add and auto-select the customer
   - Click **"Cancel"** to hide the form

### Adding Custom Services During Invoice Creation

1. **In the Services section**
   - Select **"+ Custom Service"** from the service dropdown
   - Enter the custom service name
   - Select the unit (kg, piece, item)
   - Enter quantity and rate
   - The custom service will be automatically saved to your services list

2. **Service Options**
   - **Existing Services**: Pre-loaded services with rates
   - **Custom Services**: Create new services on-the-fly
   - **Mixed Invoice**: Combine existing and custom services in one invoice

### Invoice Creation Workflow

```
1. Select/Add Customer (optional - can be walk-in)
   ├── Choose existing customer
   ├── Add new customer inline
   └── Leave blank for walk-in

2. Add Services
   ├── Select existing service (auto-fills rate)
   ├── Create custom service (enter name, unit, rate)
   └── Add multiple items

3. Apply Discounts (optional)
   ├── Amount discount (₹)
   └── Percentage discount (%)

4. Review Totals
   ├── Subtotal
   ├── Discount
   ├── GST (if enabled)
   └── Final Total

5. Save & Print
   ├── Creates invoice
   ├── Saves new customer/services
   └── Prints thermal receipt
```

## 📋 Invoice Management

### Viewing Invoice Details
- Click **"View"** button on any invoice in the invoices list
- Complete invoice details modal shows:
  - Invoice number, date, and time
  - Customer information (name, phone, address)
  - Itemized services with quantities and rates
  - Subtotal, discount, GST breakdown, and total
  - Print button for thermal receipt
- Modal can be closed with close button or clicking outside

### Printing Invoices
- **Direct Print**: Click "Print" button on invoice row
- **Print from View**: Open invoice view modal and click print button
- Both methods generate thermal receipt optimized for 80mm printers

### Receipt Format
- **80mm thermal paper compatible**
- Business name and address
- Invoice number and date/time
- Customer details (if provided)
- Itemized services with quantities
- Clear totals breakdown
- Thank you message

### Printer Setup
1. Connect 80mm thermal printer (USB/LAN)
2. Install printer drivers
3. Set paper size to 80mm in printer settings
4. Test print from the application

## 💡 Pro Tips

### Fast Invoice Creation
- Use **Tab** key to navigate between fields quickly
- Customer phone numbers help identify repeat customers
- Custom services are automatically saved for future use
- Discount can be applied as amount (₹) or percentage (%)

### Customer Management
- Add customers during billing for faster workflow
- GST numbers are stored for business customers
- Phone numbers help identify customers quickly
- Address is useful for delivery services

### Service Management
- Create services on-the-fly during billing
- Services are automatically saved with rates
- Mix existing and custom services in one invoice
- Units: kg (weight), piece (count), item (general)

## 🔧 Keyboard Shortcuts

- **Tab**: Navigate to next field
- **Enter**: Submit forms
- **Escape**: Close modals
- **Ctrl+P**: Print receipt (after invoice creation)

## 📱 Mobile Friendly

The interface adapts to mobile devices:
- Touch-friendly buttons
- Responsive layout
- Easy form navigation
- Optimized for tablet use at counter

## 🛠️ Troubleshooting

### Printing Issues
- Ensure thermal printer is connected and powered on
- Check paper size is set to 80mm
- Verify printer drivers are installed
- Test with a simple document first

### Customer/Service Not Saving
- Check internet connection
- Ensure all required fields are filled
- Try refreshing the page and logging in again

### Performance Tips
- System handles hundreds of invoices efficiently
- Clear browser cache if experiencing slowdowns
- Regular database backups recommended

---

**Need Help?** Check the main README.md for detailed setup instructions and troubleshooting.