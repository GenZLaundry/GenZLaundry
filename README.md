# GenZ Laundry Billing System

A complete thermal printer-ready billing system designed specifically for laundry businesses. This system provides fast, efficient invoice creation with direct thermal printer support for 80mm receipt printers.

## Features

### 🔐 Authentication
- Secure admin login system
- JWT-based authentication
- Default credentials: `admin@genzlaundry.com` / `admin123`

### 📊 Dashboard
- Today's invoice count and revenue
- Monthly revenue tracking
- Quick access to create new invoices

### 👥 Customer Management
- Add, edit, and delete customers
- Store customer details (name, phone, address, GST number)
- Quick customer selection during billing

### 🛠️ Service Management
- Manage laundry services (Washing, Dry Cleaning, Ironing, etc.)
- Flexible pricing per kg or per piece
- Easy service rate updates

### 🧾 Invoice Creation
- **Fast, keyboard-friendly invoice creation**
- **Inline customer creation** - Add customers during billing
- **Custom service creation** - Add services on-the-fly
- Auto-calculated amounts and totals
- Discount support (amount or percentage)
- Optional GST calculation (18%)
- Auto-generated invoice numbers
- Walk-in customer support

### 🖨️ Thermal Printer Support
- **80mm thermal receipt format** optimized for ESC/POS printers
- **Auto-sizing receipts** - No extra A4 paper waste
- **Content-based height** - Receipt length matches actual content
- Clean, professional receipt layout
- Direct browser printing support
- Works with USB and LAN thermal printers
- **Dynamic CSS injection** for perfect print formatting

### 📈 Reports
- Daily sales reports
- Monthly revenue analysis
- Customer-wise billing history
- Export functionality

### ⚙️ Settings
- Business information management
- Logo upload support
- GST configuration
- Terms and conditions customization

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone/Download the project**
   ```bash
   # If you have the files, navigate to the project directory
   cd genz-laundry-billing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:3000`
   - Login with: `admin@genzlaundry.com` / `admin123`

### Development Mode
```bash
npm run dev
```

## Thermal Printer Setup

### Supported Printers
- Any 80mm thermal receipt printer
- ESC/POS compatible printers
- USB connected printers
- Network/LAN connected printers

### Printer Configuration
1. Install your thermal printer drivers
2. Set the printer as default (optional)
3. Configure paper size to 80mm in printer settings
4. Test print from the application

### Print Settings
- Paper width: 80mm
- Font: Monospace (Courier New)
- Font size: 12px
- Black and white only
- Auto-cut enabled (if supported)

## Database Schema

The system uses SQLite database with the following tables:

- **admin** - Admin user credentials
- **settings** - Business configuration
- **customers** - Customer information
- **services** - Laundry services and pricing
- **invoices** - Invoice headers
- **invoice_items** - Invoice line items

## API Endpoints

### Authentication
- `POST /api/login` - Admin login

### Dashboard
- `GET /api/dashboard` - Dashboard statistics

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get invoice details

### Settings
- `GET /api/settings` - Get business settings
- `PUT /api/settings` - Update settings
- `POST /api/upload-logo` - Upload business logo

### Reports
- `GET /api/reports/daily?date=YYYY-MM-DD` - Daily report
- `GET /api/reports/monthly?month=MM&year=YYYY` - Monthly report

## Usage Guide

### Creating an Invoice

1. Click "Create Invoice" from dashboard or invoices page
2. **Customer Selection:**
   - Select existing customer from dropdown
   - Choose "+ Add New Customer" to create customer inline
   - Leave blank for walk-in customers
3. **Add Services:**
   - Select existing service from dropdown (auto-fills rate)
   - Choose "+ Custom Service" to create new service on-the-fly
   - Enter quantity and rate
   - Amount calculates automatically
   - Add multiple service items
4. Apply discount if needed (amount or percentage)
5. Review totals (subtotal, GST, final total)
6. Click "Save & Print" to create and print invoice

**New Features:**
- **Inline Customer Creation**: Add customers without leaving the invoice screen
- **Custom Services**: Create new services during billing that are automatically saved
- **Mixed Invoices**: Combine existing and custom services in one invoice

### Thermal Receipt Format

The thermal receipt includes:
- Business name and address
- Invoice number and date
- Customer details (if available)
- Itemized services with quantities and rates
- Subtotal, discount, GST breakdown
- Final total amount
- Thank you message

### Managing Settings

1. Go to Settings page
2. Update business information:
   - Business name and address
   - Phone number
   - GSTIN (for GST invoices)
   - Upload logo
   - Enable/disable GST
   - Customize terms and conditions

## Troubleshooting

### Printing Issues
- **Extra paper waste**: Fixed with auto-sizing CSS - receipts now use only needed space
- Ensure thermal printer is properly connected
- Check printer drivers are installed
- Verify paper size is set to 80mm width × Auto height
- Set margins to 0mm in printer settings
- Test with the included `test-thermal-print.html` file

### Database Issues
- Database file `laundry.db` is created automatically
- Backup the database file regularly
- If corrupted, delete the file and restart (will reset all data)

### Performance
- System handles hundreds of invoices efficiently
- For large datasets, consider periodic data archival
- Regular database maintenance recommended

## Security Notes

- Change default admin password after first login
- Keep the system behind a firewall for network access
- Regular backups of the database file
- HTTPS recommended for production use

## Support

For technical support or feature requests:
- Check the troubleshooting section
- Review the API documentation
- Ensure all dependencies are properly installed

## License

This software is provided as-is for laundry business use. Modify as needed for your specific requirements.

---

**GenZ Laundry Billing System** - Thermal printer ready, business focused, easy to use.