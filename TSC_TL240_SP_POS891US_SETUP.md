# 🖨️ **TSC TL240 + SP POS891US SETUP GUIDE**
## Complete Bill & Tag Printing Software for Laundry Business

---

## 🎯 **YOUR PRINTER SETUP**

### **📋 Receipt Printer: SP POS891US**
- **Type**: 80mm Thermal Receipt Printer
- **Purpose**: Customer bills and receipts
- **Paper**: 80mm thermal paper rolls
- **Connection**: USB Serial
- **Features**: Auto-cut, fast printing, ESC/POS compatible

### **🏷️ Label Printer: TSC TL240**  
- **Type**: 203 DPI Barcode Label Printer
- **Purpose**: Laundry tags with barcodes
- **Labels**: 50mm × 30mm thermal labels
- **Connection**: USB Serial
- **Features**: TSPL commands, barcode generation, durable tags

---

## 🚀 **QUICK START SETUP**

### **Step 1: Install Software**
```bash
# Clone or download the laundry POS software
git clone <your-repo>
cd laundry-pos-system

# Install dependencies
npm install

# Start the application
npm start
```

### **Step 2: Connect Printers**
1. **Connect SP POS891US** via USB to your computer
2. **Connect TSC TL240** via USB to your computer  
3. **Power on both printers**
4. **Load paper/labels** in respective printers

### **Step 3: Browser Setup**
1. **Use Chrome or Edge** (Web Serial API required)
2. **Access via HTTPS** or localhost
3. **Allow serial port permissions** when prompted

### **Step 4: Test Connection**
1. Open the laundry POS interface
2. Click **"Connect Printers"**
3. Select **SP POS891US** when prompted
4. Select **TSC TL240** when prompted
5. Click **"Test Printers"** to verify

---

## 🖨️ **PRINTING WORKFLOW**

### **Professional Laundry Operation:**

```
Customer Order → Bill Printing → Tag Printing → Item Tracking
      ↓              ↓              ↓              ↓
   POS Entry    SP POS891US    TSC TL240    Barcode Scan
```

### **1. Bill Printing (SP POS891US)**
- **Customer receipt** with payment details
- **80mm thermal paper** - compact and professional
- **Auto-cut feature** - clean tear every time
- **ESC/POS commands** - industry standard

### **2. Tag Printing (TSC TL240)**
- **Individual laundry tags** for each item
- **50×30mm labels** - perfect size for clothes
- **Barcode generation** - unique tracking codes
- **Tag counter** - shows 1/5, 2/5, etc.

---

## 🔧 **PRINTER SPECIFICATIONS**

### **SP POS891US Configuration:**
```javascript
{
  model: 'SP POS891US',
  paperWidth: 80,        // 80mm thermal paper
  maxCharsPerLine: 42,   // Characters per line
  baudRate: 9600,        // Serial communication
  cutType: 'partial',    // Clean tear-off
  encoding: 'utf-8'      // Text encoding
}
```

### **TSC TL240 Configuration:**
```javascript
{
  model: 'TSC TL240',
  dpi: 203,              // 203 DPI resolution
  maxWidth: 108,         // 108mm max label width
  labelSize: '50×30mm',  // Optimal for laundry tags
  density: 10,           // Print darkness
  speed: 4               // Print speed
}
```

---

## 📋 **SAMPLE RECEIPT (SP POS891US)**

```
================================
         GENZ LAUNDRY
    Sabji Mandi Circle, Ratanada 
         Jodhpur-342022
       Ph: +91 9256930727
================================
CUST: Rajesh Kumar
ORDER: GenZ-240110-1234
DATE: 10 Jan 2026, 2:30 pm
================================
ITEM            QTY   PRICE
--------------------------------
Shirt (Cotton)    3     ₹150
Pant (Formal)     2     ₹160
Saree (Silk)      1     ₹200
--------------------------------
Subtotal:              ₹510
Discount:               ₹10
================================
TOTAL:                 ₹500
================================
Your clothes, cared for with
         Gen-Z speed.
        THANK YOU!
[Auto-cut - no waste paper]
```

---

## 🏷️ **SAMPLE LAUNDRY TAG (TSC TL240)**

```
┌─────────────────────────────────────────┐
│ GENZ LAUNDRY           GenZ-240110-1234 │
│ Rajesh Kumar                            │
│                                         │
│        SHIRT (COTTON)                   │
│                                         │
│ WASH+IRON                          1/6  │
│ [BARCODE: GenZ-240110-1234-001]         │
└─────────────────────────────────────────┘
```

---

## 🎯 **DAILY OPERATION WORKFLOW**

### **Morning Setup:**
1. **Power on both printers**
2. **Check paper/label supplies**
3. **Open POS software**
4. **Connect printers** (one-time per session)
5. **Test print** to verify operation

### **Order Processing:**
1. **Enter customer details** in POS
2. **Add laundry items** with quantities
3. **Apply discounts** if needed
4. **Print bill** → SP POS891US prints receipt
5. **Print tags** → TSC TL240 prints individual tags
6. **Attach tags** to respective clothes
7. **Give receipt** to customer

### **End of Day:**
1. **Print daily summary** (optional)
2. **Power off printers**
3. **Store unused labels** properly

---

## 🔧 **TROUBLESHOOTING**

### **Connection Issues:**
```
❌ Printer not detected
✅ Check USB cable connection
✅ Verify printer is powered on
✅ Use Chrome/Edge browser
✅ Allow serial port permissions
```

### **Print Quality Issues:**
```
❌ Faded printing
✅ Increase density setting (TSC TL240)
✅ Check thermal paper quality
✅ Clean print head if needed
```

### **Paper/Label Issues:**
```
❌ Paper jam or misalignment
✅ Reload paper/labels properly
✅ Check paper width settings
✅ Ensure labels are straight
```

### **Software Issues:**
```
❌ Commands not working
✅ Refresh browser page
✅ Reconnect printers
✅ Check console for errors
✅ Verify printer compatibility
```

---

## 💡 **PRO TIPS**

### **Efficiency Tips:**
- **Batch printing**: Print multiple tags at once
- **Keyboard shortcuts**: Use Ctrl+B (bill), Ctrl+T (tags)
- **Pre-load items**: Set up common laundry items
- **Quick customer entry**: Use customer database

### **Cost Optimization:**
- **Buy thermal paper in bulk** for SP POS891US
- **Use quality labels** for TSC TL240 (better adhesion)
- **Regular maintenance** extends printer life
- **Proper storage** of paper/labels prevents waste

### **Professional Operation:**
- **Consistent tag placement** on clothes
- **Clear barcode scanning** for tracking
- **Customer receipt copies** for records
- **Daily backup** of order data

---

## 📞 **SUPPORT & MAINTENANCE**

### **Regular Maintenance:**
- **Clean print heads** monthly
- **Check paper alignment** weekly  
- **Update software** as needed
- **Backup settings** regularly

### **Printer Support:**
- **SP POS891US**: ESC/POS standard commands
- **TSC TL240**: TSPL command reference
- **Web Serial API**: Chrome/Edge documentation
- **USB drivers**: Windows automatic detection

---

## 🎉 **READY FOR BUSINESS!**

Your **TSC TL240 + SP POS891US** setup is now configured for professional laundry operations:

✅ **Professional receipts** - SP POS891US thermal printing  
✅ **Durable laundry tags** - TSC TL240 barcode labels  
✅ **Seamless workflow** - integrated bill & tag printing  
✅ **Item tracking** - barcode scanning capability  
✅ **Cost effective** - minimal paper waste  
✅ **Reliable operation** - industrial-grade printers  

**Your laundry business now operates like a professional mall POS system!** 🏬

---

*For technical support or customization, refer to the printer manuals or contact your software provider.*