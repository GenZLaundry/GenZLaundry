# 🏷️ TAG COUNTER VISIBILITY FIX

## ✅ **PROBLEM IDENTIFIED**
The tag counter (1/3, 2/3, 3/3) was not visible on TSC TL240 labels due to incorrect TSPL positioning coordinates.

## 🔧 **FIXES IMPLEMENTED**

### **1. Corrected TSPL Positioning**
- **Before**: Fixed pixel coordinates that were outside printable area
- **After**: Dynamic calculation based on label dimensions and DPI

```typescript
// OLD (incorrect positioning)
tspl += `TEXT 250,110,"1",0,1,1,"${tag.tagIndex}/${tag.totalTags}"\r\n`;

// NEW (dynamic positioning)
const dotsPerMm = dpi / 25.4;
const widthDots = Math.floor(width * dotsPerMm);
const heightDots = Math.floor(height * dotsPerMm);
tspl += `TEXT ${widthDots - 48},${heightDots - 32},"2",0,1,1,"${tag.tagIndex}/${tag.totalTags}"\r\n`;
```

### **2. Enhanced Tag Counter Visibility**
- **Larger font size**: Changed from font "1" to font "2"
- **Better positioning**: Bottom right corner with proper margins
- **Calculated coordinates**: Based on actual label dimensions (50mm × 25mm)

### **3. Improved Label Layout**
- **Proper spacing**: All elements positioned within printable area
- **Consistent margins**: 4-8 dots from edges
- **Optimized text sizes**: Fit content within 50mm × 25mm constraints

## 🎯 **NEW TAG LAYOUT**

```
┌─────────────────────────────────────┐ 50mm
│ GenZ Laundry          GenZ-024      │
│ Customer +91-XXXX                   │
│                                     │
│   SHIRT (COTTON)        [BARCODE]   │
│                                     │
│ WASH+IRON                      1/3  │ 25mm
└─────────────────────────────────────┘
```

### **Tag Counter Position:**
- **Location**: Bottom right corner
- **Font**: Size 2 (medium)
- **Coordinates**: `(widthDots - 48, heightDots - 32)`
- **Format**: "1/3", "2/3", "3/3", etc.

## 🧪 **TESTING FEATURES ADDED**

### **1. Visual Preview**
- **LaundryTagPreview.tsx**: Shows how tags will look before printing
- **Scaled display**: 4x scale for screen visibility
- **Tag counter highlighted**: Black background for prominence

### **2. Test Functions**
- **testTagCounter()**: Prints test label with counter in different positions
- **Enhanced testPrint()**: Includes tag counter in test output
- **Debug logging**: Shows TSPL commands for troubleshooting

### **3. Print Modal Integration**
- **"TEST COUNTER" button**: Specifically tests tag counter visibility
- **Tag preview**: Shows both receipt and tags before printing
- **Real-time preview**: Updates as you change print options

## 🔧 **TROUBLESHOOTING GUIDE**

### **If Tag Counter Still Not Visible:**

1. **Check Label Size Settings**
   ```
   SIZE 50 mm, 25 mm
   ```

2. **Verify Printer DPI**
   - TSC TL240 default: 203 DPI
   - Calculation: 203 DPI ÷ 25.4 = 8 dots per mm

3. **Test Print Coordinates**
   - Use "TEST COUNTER" button
   - Should show counters in different positions
   - Verify which position is visible

4. **Check Label Paper**
   - Ensure 50mm × 25mm labels are loaded
   - Verify label orientation in printer
   - Check if labels are properly aligned

### **TSPL Command Verification:**
```
SIZE 50 mm, 25 mm
CLS
TEXT 8,8,"2",0,1,1,"GenZ Laundry"
TEXT 112,72,"2",0,1,1,"1/3"    ← Tag counter position
BOX 4,4,156,96,2
PRINT 1,1
```

## 🎯 **EXPECTED RESULTS**

### **After Fix:**
- ✅ **Tag counter visible** in bottom right corner
- ✅ **Proper font size** for readability
- ✅ **Correct positioning** within label boundaries
- ✅ **Sequential numbering** (1/3, 2/3, 3/3)
- ✅ **Professional appearance** like commercial laundry tags

### **Tag Counter Features:**
- **Format**: "tagIndex/totalTags" (e.g., "1/3")
- **Position**: Bottom right corner with margin
- **Font**: Medium size for visibility
- **Background**: Optional black background for contrast

## 🚀 **USAGE**

1. **Create order** with multiple items
2. **Enable "Print Laundry Tags"** option
3. **Click "Print Bill"** → Preview shows tags with counters
4. **Verify counter visibility** in preview
5. **Print** → Each tag shows correct counter (1/3, 2/3, etc.)

The tag counter should now be clearly visible on all printed labels! 🎉