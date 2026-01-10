
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LaundryItem, OrderItem, Order, ShopConfig } from './types';
import { DEFAULT_ITEMS, STORAGE_KEYS } from './constants';
import { printThermalBill, copyThermalESCPOS, printTestThermalReceipt, BillData } from './ThermalPrintManager';
import { connectUSBPrinter, printUSBReceipt, testUSBPrint, isUSBPrinterConnected } from './DirectUSBPrinter';
import { connectTSCPrinter, isTSCConnected, testTSCPrint, testTagCounter, LaundryTag } from './TSCLabelPrinter';
import { dualPrinterManager, LaundryOrder } from './DualPrinterManager';
import ThermalReceipt from './ThermalBillGenerator';
import { LaundryTagsPreview } from './LaundryTagPreview';
import AdminPanel from './AdminPanel';
import { WebSerialFallback, getEnvironmentSpecificError } from './WebSerialFallback';

const App: React.FC = () => {
  // State
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<LaundryItem[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orderId, setOrderId] = useState('GenZ-001');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [shopConfig, setShopConfig] = useState<ShopConfig>({
    shopName: 'GenZLaundry',
    address: '123 Laundry Street, Delhi - 110001',
    contact: '+91 98765 43210'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState<'bill' | 'tag'>('bill');
  const [usbConnected, setUsbConnected] = useState(false);
  const [tscConnected, setTscConnected] = useState(false);
  const [printTags, setPrintTags] = useState(true);
  const [generateBarcodes, setGenerateBarcodes] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [enableDelivery, setEnableDelivery] = useState(false);

  // Refs for keyboard management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const itemSearchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialization
  useEffect(() => {
    const savedCount = localStorage.getItem(STORAGE_KEYS.ORDER_COUNT);
    if (savedCount) {
      const nextId = (parseInt(savedCount) + 1).toString().padStart(3, '0');
      setOrderId(`GenZ-${nextId}`);
    }

    const savedItems = localStorage.getItem(STORAGE_KEYS.SAVED_ITEMS);
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(DEFAULT_ITEMS);
      localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(DEFAULT_ITEMS));
    }

    const savedConfig = localStorage.getItem(STORAGE_KEYS.SHOP_CONFIG);
    if (savedConfig) {
      setShopConfig(JSON.parse(savedConfig));
    }

    // Check printer connection status
    setUsbConnected(isUSBPrinterConnected());
    setTscConnected(isTSCConnected());

    // Auto-focus name on mount
    nameInputRef.current?.focus();
  }, []);

  // Totals Calculation (including delivery charge)
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculatedDiscount = discountType === 'fixed' ? discount : (subtotal * discount / 100);
  const deliveryAmount = enableDelivery ? deliveryCharge : 0;
  const total = Math.max(0, subtotal - calculatedDiscount + deliveryAmount);

  // Handlers
  const addToCart = (item: LaundryItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setSearchQuery('');
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const resetOrder = useCallback(() => {
    if (window.confirm("Reset entire order?")) {
      setCustomerName('');
      setCart([]);
      setDiscount(0);
      setSearchQuery('');
      nameInputRef.current?.focus();
    }
  }, []);

  const completeOrder = (type: 'bill' | 'tag') => {
    if (!customerName) {
      alert("Please enter Customer Name");
      nameInputRef.current?.focus();
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    setPrintType(type);
    setShowPrintModal(true);

    // Save logic
    const currentCount = parseInt(orderId.split('-')[1]);
    localStorage.setItem(STORAGE_KEYS.ORDER_COUNT, currentCount.toString());
  };

  const finalizePrint = async () => {
    // Create laundry order data
    const laundryOrder: LaundryOrder = {
      businessName: shopConfig.shopName,
      address: shopConfig.address,
      phone: shopConfig.contact,
      billNumber: orderId,
      customerName: customerName,
      customerPhone: shopConfig.contact,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        rate: item.price,
        amount: item.price * item.quantity,
        washType: 'WASH+IRON'
      })),
      subtotal: subtotal,
      discount: calculatedDiscount,
      gst: 0,
      grandTotal: total,
      thankYouMessage: "Your clothes, cared for with Gen-Z speed. THANK YOU!",
      printTags: printTags,
      generateBarcodes: generateBarcodes
    };

    if (printType === 'bill') {
      // Print thermal receipt only
      const success = await dualPrinterManager.printBillOnly(laundryOrder);
      if (success) {
        alert('✅ Bill printed successfully!');
      } else {
        alert('❌ Bill printing failed - check thermal printer connection.');
      }
    } else if (printType === 'tag') {
      // Print tags only
      const success = await dualPrinterManager.printTagsOnly(laundryOrder);
      if (success) {
        alert('✅ Tags printed successfully!');
      } else {
        alert('❌ Tag printing failed - check TSC printer connection.');
      }
    }
    
    setShowPrintModal(false);
  };

  // Update items list
  const updateItems = (newItems: LaundryItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify(newItems));
  };

  // Check printer connection status periodically
  useEffect(() => {
    const checkConnectionStatus = () => {
      const thermalStatus = isUSBPrinterConnected();
      const tscStatus = isTSCConnected();
      
      setUsbConnected(thermalStatus);
      setTscConnected(tscStatus);
    };

    // Check status every 2 seconds
    const interval = setInterval(checkConnectionStatus, 2000);
    
    // Initial check
    checkConnectionStatus();

    return () => clearInterval(interval);
  }, []);

  // Connect all printers with enhanced debugging and environment detection
  const handleConnectAllPrinters = async () => {
    try {
      console.log('🔌 Starting printer connection process...');
      
      // Check Web Serial API support first
      const serialSupport = await WebSerialFallback.checkWebSerialSupport();
      console.log('📊 Web Serial Support:', serialSupport);
      
      if (!serialSupport.supported) {
        alert(`❌ WEB SERIAL API NOT SUPPORTED\n\n${serialSupport.reason}\n\n💡 SOLUTION:\n${serialSupport.solution}`);
        return;
      }

      if (!serialSupport.available) {
        const instructions = WebSerialFallback.getConnectionInstructions(window.location.hostname);
        alert(`⚠️ USB CONNECTION LIMITATION\n\n${serialSupport.reason}\n\n${instructions}`);
        return;
      }
      
      // Show loading state
      alert('🔌 Connecting to printers...\n\nPlease wait while we establish connections.');
      
      const results = await dualPrinterManager.connectAllPrinters();
      
      console.log('📊 Connection results:', results);
      
      // Force status update
      setUsbConnected(results.thermal);
      setTscConnected(results.tsc);
      
      // Double-check actual connection status
      setTimeout(() => {
        const actualThermalStatus = isUSBPrinterConnected();
        const actualTscStatus = isTSCConnected();
        
        console.log('🔍 Actual status check:', { 
          thermal: actualThermalStatus, 
          tsc: actualTscStatus 
        });
        
        setUsbConnected(actualThermalStatus);
        setTscConnected(actualTscStatus);
      }, 1000);
      
      let message = '🖨️ PRINTER CONNECTION RESULTS:\n\n';
      message += `Thermal Printer (SP-POS893UED): ${results.thermal ? '✅ CONNECTED' : '❌ FAILED'}\n`;
      message += `Label Printer (TSC TL240): ${results.tsc ? '✅ CONNECTED' : '❌ FAILED'}\n\n`;
      
      if (results.thermal && results.tsc) {
        message += '🎉 Both printers ready for professional laundry POS operation!';
      } else if (results.thermal || results.tsc) {
        message += '⚠️ Partial connection - some features may be limited.';
        message += '\n\n💡 TIP: Try connecting one printer at a time if issues persist.';
      } else {
        const isHosted = WebSerialFallback.isHostedEnvironment();
        if (isHosted) {
          message += '❌ No printers connected.\n\n';
          message += '🌐 HOSTED ENVIRONMENT DETECTED (Render.com):\n';
          message += 'Direct USB access may be limited on hosted platforms.\n\n';
          message += '💡 RECOMMENDED SOLUTION:\n';
          message += '• Use "ESC/POS DIRECT" method\n';
          message += '• Copy commands to thermal printer software\n';
          message += '• This bypasses browser limitations completely!\n\n';
          message += '🔧 ALTERNATIVE:\n';
          message += '• Run the POS system locally for full USB access';
        } else {
          message += '❌ No printers connected. Check USB connections and try again.';
          message += '\n\n🔧 TROUBLESHOOTING:\n';
          message += '• Ensure printers are powered on\n';
          message += '• Check USB cable connections\n';
          message += '• Use Chrome/Edge browser\n';
          message += '• Allow serial port permissions\n';
          message += '• Try connecting one printer at a time';
        }
      }
      
      alert(message);
    } catch (error) {
      console.error('❌ Connection error:', error);
      const errorMessage = getEnvironmentSpecificError(error as Error);
      alert(errorMessage);
    }
  };

  // Connect individual printers for debugging
  const handleConnectThermalOnly = async () => {
    try {
      console.log('🔌 Connecting thermal printer only...');
      const success = await connectUSBPrinter();
      setUsbConnected(success);
      
      if (success) {
        alert('✅ Thermal Printer Connected!\n\nSP-POS893UED is ready for receipt printing.');
      } else {
        alert('❌ Thermal Printer Connection Failed!\n\n🔧 Check:\n• Printer is powered on\n• USB cable connected\n• Browser permissions allowed');
      }
    } catch (error) {
      console.error('❌ Thermal connection error:', error);
      alert('❌ Thermal Connection Error:\n\n' + (error as Error).message);
    }
  };

  const handleConnectTSCOnly = async () => {
    try {
      console.log('🔌 Connecting TSC printer only...');
      const success = await connectTSCPrinter();
      setTscConnected(success);
      
      if (success) {
        alert('✅ TSC Label Printer Connected!\n\nTSC TL240 is ready for tag printing.');
      } else {
        alert('❌ TSC Printer Connection Failed!\n\n🔧 Check:\n• Printer is powered on\n• USB cable connected\n• Label paper loaded');
      }
    } catch (error) {
      console.error('❌ TSC connection error:', error);
      alert('❌ TSC Connection Error:\n\n' + (error as Error).message);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        completeOrder('bill');
      }
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        completeOrder('tag');
      }
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        if (usbConnected) {
          // Quick USB print
          if (customerName && cart.length > 0) {
            finalizePrint();
          }
        } else {
          handleConnectAllPrinters();
        }
      }
      if (e.key === 'Escape') {
        if (showPrintModal) setShowPrintModal(false);
        else if (showSettings) setShowSettings(false);
        else resetOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customerName, cart, orderId, showPrintModal, showSettings, usbConnected, resetOrder]);

  // Filtered items for search
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-blue-700 p-4 shadow-lg flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <i className="fas fa-washing-machine text-3xl"></i>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase">{shopConfig.shopName}</h1>
            <p className="text-xs opacity-80">{shopConfig.address}</p>
            {WebSerialFallback.isHostedEnvironment() && (
              <p className="text-xs bg-orange-600 text-white px-2 py-1 rounded mt-1">
                <i className="fas fa-info-circle mr-1"></i>
                Hosted Environment - Use ESC/POS Direct for printing
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-blue-900 px-4 py-2 rounded-md font-bold border border-blue-500">
            {orderId}
          </div>
          
          {/* Dual Printer Status */}
          <div className="flex gap-2">
            {/* Thermal Printer Status */}
            <div className={`px-2 py-1 rounded-md text-xs font-bold border ${
              usbConnected 
                ? 'bg-green-900 border-green-500 text-green-300' 
                : 'bg-red-900 border-red-500 text-red-300'
            }`} title={`Thermal Printer: ${usbConnected ? 'Connected and Ready' : 'Disconnected - Click to connect'}`}>
              <i className={`fas ${usbConnected ? 'fa-receipt' : 'fa-times'} mr-1`}></i>
              THERMAL
            </div>
            
            {/* TSC Label Printer Status */}
            <div className={`px-2 py-1 rounded-md text-xs font-bold border ${
              tscConnected 
                ? 'bg-green-900 border-green-500 text-green-300' 
                : 'bg-red-900 border-red-500 text-red-300'
            }`} title={`TSC Label Printer: ${tscConnected ? 'Connected and Ready' : 'Disconnected - Click to connect'}`}>
              <i className={`fas ${tscConnected ? 'fa-tags' : 'fa-times'} mr-1`}></i>
              LABELS
            </div>
          </div>
          
          {(!usbConnected || !tscConnected) && (
            <div className="flex gap-1">
              <button 
                onClick={handleConnectAllPrinters}
                className="bg-orange-600 hover:bg-orange-500 px-2 py-1 rounded-md text-xs font-bold transition-colors"
                title="Connect All Printers"
              >
                <i className="fas fa-plug mr-1"></i> ALL
              </button>
              
              {!usbConnected && (
                <button 
                  onClick={handleConnectThermalOnly}
                  className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded-md text-xs font-bold transition-colors"
                  title="Connect Thermal Printer Only"
                >
                  <i className="fas fa-receipt mr-1"></i> THERMAL
                </button>
              )}
              
              {!tscConnected && (
                <button 
                  onClick={handleConnectTSCOnly}
                  className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded-md text-xs font-bold transition-colors"
                  title="Connect TSC Label Printer Only"
                >
                  <i className="fas fa-tags mr-1"></i> TSC
                </button>
              )}
            </div>
          )}
          
          <button 
            onClick={() => setShowSettings(true)}
            className="hover:bg-blue-600 p-2 rounded-full transition-colors"
          >
            <i className="fas fa-cog"></i>
          </button>
          
          <button 
            onClick={() => setShowAdminPanel(true)}
            className="hover:bg-purple-600 p-2 rounded-full transition-colors"
            title="Admin Panel - Manage Items"
          >
            <i className="fas fa-user-shield"></i>
          </button>
          
          <button 
            onClick={() => {
              const thermalStatus = isUSBPrinterConnected();
              const tscStatus = isTSCConnected();
              
              let debugInfo = '🔍 PRINTER DEBUG INFO:\n\n';
              debugInfo += `Current Status:\n`;
              debugInfo += `• Thermal: ${thermalStatus ? '✅ Connected' : '❌ Disconnected'}\n`;
              debugInfo += `• TSC: ${tscStatus ? '✅ Connected' : '❌ Disconnected'}\n\n`;
              
              debugInfo += `State Variables:\n`;
              debugInfo += `• usbConnected: ${usbConnected}\n`;
              debugInfo += `• tscConnected: ${tscConnected}\n\n`;
              
              debugInfo += `Browser Support:\n`;
              debugInfo += `• Web Serial API: ${('serial' in navigator) ? '✅ Supported' : '❌ Not Supported'}\n`;
              debugInfo += `• User Agent: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Edge') ? 'Edge' : 'Other'}\n`;
              debugInfo += `• Protocol: ${window.location.protocol}\n\n`;
              
              debugInfo += `💡 If status shows disconnected after connecting:\n`;
              debugInfo += `• Try refreshing the page\n`;
              debugInfo += `• Check browser console for errors\n`;
              debugInfo += `• Ensure printer drivers are installed\n`;
              debugInfo += `• Try connecting one printer at a time`;
              
              alert(debugInfo);
            }}
            className="hover:bg-yellow-600 p-2 rounded-full transition-colors"
            title="Debug Printer Connections"
          >
            <i className="fas fa-bug"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden no-print">
        {/* Left Panel: Order Entry */}
        <div className="w-1/2 p-6 flex flex-col border-r border-gray-700 bg-gray-800">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-400 uppercase">Customer Name</label>
            <input
              ref={nameInputRef}
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter customer name..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && itemSearchRef.current?.focus()}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label className="block text-sm font-semibold mb-2 text-gray-400 uppercase">Add Items (Search or Add New)</label>
            <div className="relative mb-4">
              <input
                ref={itemSearchRef}
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Search items... (Press Enter to Add New)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                        const existing = items.find(i => i.name.toLowerCase() === searchQuery.toLowerCase());
                        if (existing) {
                            addToCart(existing);
                        } else {
                            const price = prompt(`Enter price for "${searchQuery}":`);
                            if (price && !isNaN(parseFloat(price))) {
                                const newItem = { id: Date.now().toString(), name: searchQuery, price: parseFloat(price) };
                                setItems(prev => [...prev, newItem]);
                                localStorage.setItem(STORAGE_KEYS.SAVED_ITEMS, JSON.stringify([...items, newItem]));
                                addToCart(newItem);
                            }
                        }
                    }
                }}
              />
              <i className="fas fa-search absolute right-4 top-4 text-gray-500"></i>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-2">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 p-4 rounded text-left transition-all active:scale-95 group flex justify-between items-center"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-green-400 font-mono">₹{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Cart & Actions */}
        <div className="w-1/2 p-6 flex flex-col bg-gray-900">
          <div className="flex-1 overflow-y-auto mb-4 border border-gray-700 rounded bg-gray-800">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-gray-700 text-xs text-gray-300 uppercase">
                <tr>
                  <th className="p-3">Item</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-gray-500 italic">No items in cart</td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded bg-gray-600 hover:bg-red-500">-</button>
                          <span className="w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded bg-gray-600 hover:bg-green-500">+</button>
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono text-gray-400">₹{item.price}</td>
                      <td className="p-3 text-right font-mono text-green-400">₹{item.price * item.quantity}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-2xl font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Discount:</span>
                <select 
                  className="bg-gray-700 text-xs p-1 rounded border border-gray-600"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percent')}
                >
                  <option value="fixed">Fixed (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <input
                type="number"
                className="w-24 bg-gray-700 border border-gray-600 rounded p-1 text-right focus:outline-none"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              />
            </div>
            
            {/* Print Options */}
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={printTags}
                    onChange={(e) => setPrintTags(e.target.checked)}
                    className="rounded"
                  />
                  <span>Print Laundry Tags</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={generateBarcodes}
                    onChange={(e) => setGenerateBarcodes(e.target.checked)}
                    className="rounded"
                  />
                  <span>Generate Barcodes</span>
                </label>
              </div>
              
              {/* Delivery Charge */}
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enableDelivery}
                    onChange={(e) => setEnableDelivery(e.target.checked)}
                    className="rounded"
                  />
                  <span>Delivery Charge</span>
                </label>
                {enableDelivery && (
                  <input
                    type="number"
                    className="w-20 bg-gray-700 border border-gray-600 rounded p-1 text-right focus:outline-none text-sm"
                    placeholder="0"
                    value={deliveryCharge || ''}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-blue-400">Total Payable:</span>
              <span className="text-4xl font-bold text-green-500 font-mono">₹{total}</span>
            </div>

            {/* Breakdown */}
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount:</span>
                  <span>-₹{calculatedDiscount}</span>
                </div>
              )}
              {enableDelivery && deliveryCharge > 0 && (
                <div className="flex justify-between text-blue-400">
                  <span>Delivery:</span>
                  <span>+₹{deliveryCharge}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => completeOrder('bill')}
                className="bg-green-600 hover:bg-green-500 p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:translate-y-1"
              >
                <i className="fas fa-file-invoice"></i> Print Bill (Ctrl+B)
              </button>
              <button
                onClick={() => completeOrder('tag')}
                className="bg-orange-600 hover:bg-orange-500 p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:translate-y-1"
              >
                <i className="fas fa-tag"></i> Print Tags (Ctrl+T)
              </button>
              <button
                onClick={resetOrder}
                className="bg-red-900/30 hover:bg-red-800 p-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all border border-red-800/50"
              >
                <i className="fas fa-undo"></i> Reset (Esc)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-700 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-xl font-bold"><i className="fas fa-cogs mr-2"></i> Shop Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Shop Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={shopConfig.shopName}
                  onChange={(e) => setShopConfig({...shopConfig, shopName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Address</label>
                <textarea
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none h-20"
                  value={shopConfig.address}
                  onChange={(e) => setShopConfig({...shopConfig, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-500 mb-1">Contact No.</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={shopConfig.contact}
                  onChange={(e) => setShopConfig({...shopConfig, contact: e.target.value})}
                />
              </div>
              <button
                onClick={() => {
                    localStorage.setItem(STORAGE_KEYS.SHOP_CONFIG, JSON.stringify(shopConfig));
                    setShowSettings(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-bold transition-all mt-4"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black flex flex-col z-[100] no-print">
          <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold">
                {printType === 'bill' ? (
                  <>
                    Professional Laundry POS Printing
                    <div className="text-sm font-normal mt-1">
                      <span className={usbConnected ? 'text-green-400' : 'text-red-400'}>
                        • Thermal: {usbConnected ? 'READY' : 'DISCONNECTED'}
                      </span>
                      <span className="mx-2">|</span>
                      <span className={tscConnected ? 'text-green-400' : 'text-red-400'}>
                        • Labels: {tscConnected ? 'READY' : 'DISCONNECTED'}
                      </span>
                    </div>
                  </>
                ) : 'Label Preview (Durable Tags)'}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={finalizePrint}
                className={`px-6 py-2 rounded-lg font-bold animate-pulse ${
                  printType === 'bill' 
                    ? (usbConnected ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500')
                    : (tscConnected ? 'bg-orange-600 hover:bg-orange-500' : 'bg-gray-600 hover:bg-gray-500')
                }`}
              >
                <i className={`fas ${printType === 'bill' ? 'fa-receipt' : 'fa-tags'} mr-2`}></i> 
                {printType === 'bill' 
                  ? (usbConnected ? 'PRINT BILL (THERMAL)' : 'PRINT BILL (FALLBACK)')
                  : (tscConnected ? 'PRINT TAGS (TSC)' : 'TSC DISCONNECTED')
                }
              </button>
              
              <button 
                onClick={async () => {
                  // Print both bill and tags separately
                  const laundryOrder: LaundryOrder = {
                    businessName: shopConfig.shopName,
                    address: shopConfig.address,
                    phone: shopConfig.contact,
                    billNumber: orderId,
                    customerName: customerName,
                    customerPhone: shopConfig.contact,
                    items: cart.map(item => ({
                      id: item.id,
                      name: item.name,
                      quantity: item.quantity,
                      rate: item.price,
                      amount: item.price * item.quantity,
                      washType: 'WASH+IRON'
                    })),
                    subtotal: subtotal,
                    discount: calculatedDiscount,
                    gst: 0,
                    grandTotal: total,
                    thankYouMessage: "Your clothes, cared for with Gen-Z speed. THANK YOU!",
                    printTags: true,
                    generateBarcodes: generateBarcodes
                  };

                  const result = await dualPrinterManager.processLaundryOrder(laundryOrder);
                  
                  let message = '🖨️ DUAL PRINTING RESULTS:\n\n';
                  message += `Bill (Thermal): ${result.billPrinted ? '✅ SUCCESS' : '❌ FAILED'}\n`;
                  message += `Tags (TSC): ${result.tagsPrinted ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;
                  
                  if (result.billPrinted && result.tagsPrinted) {
                    message += '🎉 Complete laundry POS operation successful!';
                  } else if (result.errors.length > 0) {
                    message += 'Errors:\n' + result.errors.join('\n');
                  }
                  
                  alert(message);
                  setShowPrintModal(false);
                }}
                className={`px-6 py-2 rounded-lg font-bold ${
                  (usbConnected && tscConnected) 
                    ? 'bg-purple-600 hover:bg-purple-500' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                disabled={!usbConnected && !tscConnected}
              >
                <i className="fas fa-print mr-2"></i> PRINT BOTH
              </button>
              
              {(!usbConnected || !tscConnected) && (
                <button 
                  onClick={handleConnectAllPrinters}
                  className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-lg font-bold"
                >
                  <i className="fas fa-plug mr-2"></i> CONNECT PRINTERS
                </button>
              )}
              
              <button 
                onClick={() => {
                  const billData: BillData = {
                    businessName: shopConfig.shopName,
                    address: shopConfig.address,
                    phone: shopConfig.contact,
                    billNumber: orderId,
                    customerName: customerName,
                    items: cart.map(item => ({
                      name: item.name,
                      quantity: item.quantity,
                      rate: item.price,
                      amount: item.price * item.quantity
                    })),
                    subtotal: subtotal,
                    discount: calculatedDiscount,
                    gst: 0,
                    grandTotal: total,
                    thankYouMessage: "Your clothes, cared for with Gen-Z speed. THANK YOU!"
                  };
                  copyThermalESCPOS(billData);
                }}
                className={`px-6 py-2 rounded-lg font-bold ${
                  WebSerialFallback.isHostedEnvironment() 
                    ? 'bg-green-600 hover:bg-green-500 animate-pulse' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <i className="fas fa-code mr-2"></i> 
                ESC/POS DIRECT
                {WebSerialFallback.isHostedEnvironment() && (
                  <span className="ml-2 text-xs">(RECOMMENDED)</span>
                )}
              </button>
              
              <button 
                onClick={async () => {
                  const results = await dualPrinterManager.testAllPrinters();
                  let message = '🧪 PRINTER TEST RESULTS:\n\n';
                  message += `Thermal Printer: ${results.thermal ? '✅ SUCCESS' : '❌ FAILED'}\n`;
                  message += `Label Printer: ${results.tsc ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;
                  
                  if (results.thermal && results.tsc) {
                    message += '🎉 Both printers working perfectly!';
                  } else if (results.thermal || results.tsc) {
                    message += '⚠️ Partial success - check disconnected printer.';
                  } else {
                    message += '❌ Both printers failed - check connections.';
                  }
                  
                  alert(message);
                }}
                className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg font-bold"
              >
                <i className="fas fa-vial mr-2"></i> TEST ALL
              </button>
              
              {tscConnected && (
                <button 
                  onClick={async () => {
                    const success = await testTagCounter();
                    if (success) {
                      alert('✅ Tag Counter Test Printed!\n\nCheck your TSC TL240 output:\n• Should show "1/3", "2/3", "3/3" in different positions\n• Tag counter should be visible in bottom right\n• If not visible, check label size settings');
                    } else {
                      alert('❌ Tag Counter Test Failed\n\nCheck TSC printer connection and label paper');
                    }
                  }}
                  className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-lg font-bold"
                >
                  <i className="fas fa-hashtag mr-2"></i> TEST COUNTER
                </button>
              )}
              
              <button 
                onClick={() => {
                  alert(`🖨️ SEPARATE PRINTER OPERATION:

📋 PRINTING WORKFLOW:

1️⃣ BILL PRINTING (Thermal SP-POS893UED)
• Customer receipt only
• 80mm thermal paper
• Payment details and totals
• NO laundry tags included

2️⃣ TAG PRINTING (TSC TL240 Label Printer)  
• Individual laundry tags
• 50mm × 25mm labels
• Item tracking with barcodes
• Tag counter (1/3, 2/3, 3/3)

🎯 SEPARATE OPERATIONS:
• "Print Bill" → Thermal receipt only
• "Print Tags" → TSC labels only  
• "Print Both" → Both printers separately

💡 PROFESSIONAL WORKFLOW:
1. Print bill for customer payment
2. Print tags for item tracking
3. Attach tags to clothes
4. Customer gets receipt, items get tracked

This matches real laundry shop operations!`);
                }}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold"
              >
                <i className="fas fa-info-circle mr-2"></i> HELP
              </button>
              
              <button 
                onClick={() => setShowPrintModal(false)}
                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-900 p-10 flex justify-center items-start">
            <div className="bg-white text-black p-8 shadow-2xl rounded-sm transform scale-110 origin-top">
              {printType === 'bill' ? (
                <ThermalReceipt
                  businessName={shopConfig.shopName}
                  address={shopConfig.address}
                  phone={shopConfig.contact}
                  billNumber={orderId}
                  customerName={customerName}
                  items={cart.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    rate: item.price,
                    amount: item.price * item.quantity
                  }))}
                  subtotal={subtotal}
                  discount={calculatedDiscount}
                  gst={0}
                  grandTotal={total}
                  thankYouMessage="Your clothes, cared for with Gen-Z speed. THANK YOU!"
                />
              ) : (
                <div className="max-w-4xl">
                  <LaundryTagsPreview
                    title="Laundry Tags (50mm × 25mm) - TSC TL240"
                    tags={(() => {
                      const tags: LaundryTag[] = [];
                      cart.forEach(item => {
                        for (let i = 0; i < item.quantity; i++) {
                          tags.push({
                            laundryName: shopConfig.shopName,
                            billNumber: orderId,
                            customerName: customerName,
                            customerPhone: shopConfig.contact,
                            itemName: item.name,
                            washType: 'WASH+IRON',
                            barcode: generateBarcodes ? `${orderId}-${item.id}-${i + 1}` : undefined,
                            qrCode: generateBarcodes ? `https://genzlaundry.com/track/${orderId}/${item.id}/${i + 1}` : undefined,
                            tagIndex: tags.length + 1,
                            totalTags: cart.reduce((sum, cartItem) => sum + cartItem.quantity, 0)
                          });
                        }
                      });
                      return tags;
                    })()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          items={items}
          onItemsUpdate={updateItems}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      <footer className="bg-gray-800 p-2 text-[10px] text-center text-gray-500 no-print flex justify-center gap-8 uppercase tracking-widest">
        <span>Ctrl+B: Print Bill</span>
        <span>Ctrl+T: Print Tags</span>
        <span>Ctrl+U: {(usbConnected && tscConnected) ? 'Print All' : 'Connect Printers'}</span>
        <span>Esc: Reset</span>
        <span>Enter: Next Field</span>
      </footer>
    </div>
  );
};

// Sub-components for printing logic

const TagListView: React.FC<{
  customerName: string,
  orderId: string,
  cart: OrderItem[]
}> = ({ customerName, orderId, cart }) => {
  // Expand items to individual tags
  const tags: { itemName: string, index: number, total: number }[] = [];
  const totalTags = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  let currentIndex = 1;
  cart.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      tags.push({ itemName: item.name, index: currentIndex++, total: totalTags });
    }
  });

  const dateShort = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-8 print:space-y-0">
      {tags.map((tag, i) => (
        <div key={i} className="w-[50mm] h-[25mm] border-2 border-black p-1 mb-4 print:mb-0 break-after-page flex flex-col justify-between relative overflow-hidden bg-white text-black">
          <div className="flex justify-between items-start border-b border-black pb-1">
             <div className="font-black text-sm uppercase truncate w-2/3">{customerName}</div>
             <div className="text-[10px] font-bold">{dateShort}</div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center py-1">
             <div className="font-bold text-xs uppercase text-center w-full truncate">{tag.itemName}</div>
             <div className="font-black text-xl">{orderId}</div>
          </div>
          <div className="flex justify-between items-end border-t border-black pt-1">
             <div className="text-[8px] font-mono tracking-tighter">BARCODE: {orderId}-{tag.index.toString().padStart(2, '0')}</div>
             <div className="bg-black text-white px-1 text-xs font-black rounded-sm">{tag.index}/{tag.total}</div>
          </div>
          {/* Simple simulated barcode */}
          <div className="absolute right-[-10px] top-4 rotate-90 h-10 w-24 opacity-20 pointer-events-none flex gap-[1px]">
             {[...Array(20)].map((_, j) => (
               <div key={j} className="bg-black flex-1" style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
