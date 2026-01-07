
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LaundryItem, OrderItem, Order, ShopConfig } from './types';
import { DEFAULT_ITEMS, STORAGE_KEYS } from './constants';

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

    // Auto-focus name on mount
    nameInputRef.current?.focus();
  }, []);

  // Totals Calculation
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const calculatedDiscount = discountType === 'fixed' ? discount : (subtotal * discount / 100);
  const total = Math.max(0, subtotal - calculatedDiscount);

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

  const finalizePrint = () => {
    window.print();
    setShowPrintModal(false);
    // After printing, we could auto-reset or prepare for next
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
      if (e.key === 'Escape') {
        if (showPrintModal) setShowPrintModal(false);
        else if (showSettings) setShowSettings(false);
        else resetOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customerName, cart, orderId, showPrintModal, showSettings, resetOrder]);

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
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-blue-900 px-4 py-2 rounded-md font-bold border border-blue-500">
            {orderId}
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="hover:bg-blue-600 p-2 rounded-full transition-colors"
          >
            <i className="fas fa-cog"></i>
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
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-blue-400">Total Payable:</span>
              <span className="text-4xl font-bold text-green-500 font-mono">₹{total}</span>
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
                {printType === 'bill' ? 'Receipt Preview (80mm Thermal)' : 'Label Preview (Durable Tags)'}
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={finalizePrint}
                className="bg-green-600 hover:bg-green-500 px-8 py-2 rounded-lg font-bold animate-pulse"
              >
                <i className="fas fa-print mr-2"></i> CONFIRM PRINT
              </button>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg font-bold"
              >
                CANCEL
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-900 p-10 flex justify-center items-start">
            <div className="bg-white text-black p-8 shadow-2xl rounded-sm transform scale-110 origin-top">
              {printType === 'bill' ? (
                <ReceiptView shopConfig={shopConfig} customerName={customerName} orderId={orderId} cart={cart} subtotal={subtotal} discount={calculatedDiscount} total={total} />
              ) : (
                <TagListView customerName={customerName} orderId={orderId} cart={cart} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Section for actual printing */}
      <div id="print-section" className="hidden print:block bg-white text-black p-4 font-mono text-[10pt]">
        {printType === 'bill' ? (
          <ReceiptView shopConfig={shopConfig} customerName={customerName} orderId={orderId} cart={cart} subtotal={subtotal} discount={calculatedDiscount} total={total} />
        ) : (
          <TagListView customerName={customerName} orderId={orderId} cart={cart} />
        )}
      </div>

      <footer className="bg-gray-800 p-2 text-[10px] text-center text-gray-500 no-print flex justify-center gap-8 uppercase tracking-widest">
        <span>Ctrl+B: Print Bill</span>
        <span>Ctrl+T: Print Tags</span>
        <span>Esc: Reset</span>
        <span>Enter: Next Field</span>
      </footer>
    </div>
  );
};

// Sub-components for printing logic

const ReceiptView: React.FC<{ 
    shopConfig: ShopConfig, 
    customerName: string, 
    orderId: string, 
    cart: OrderItem[], 
    subtotal: number, 
    discount: number, 
    total: number 
}> = ({ shopConfig, customerName, orderId, cart, subtotal, discount, total }) => {
  const dateStr = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  return (
    <div className="w-[72mm] mx-auto text-black leading-tight text-center">
      <div className="border-b-2 border-black pb-2 mb-2">
        <h1 className="text-2xl font-black uppercase mb-1">{shopConfig.shopName}</h1>
        <p className="text-xs">{shopConfig.address}</p>
        <p className="text-xs">Ph: {shopConfig.contact}</p>
      </div>
      <div className="text-left text-sm mb-4 space-y-1">
        <p><strong>CUST:</strong> {customerName}</p>
        <p><strong>ORDER:</strong> {orderId}</p>
        <p><strong>DATE:</strong> {dateStr}</p>
      </div>
      <div className="border-y-2 border-black py-1 my-2 text-xs font-bold flex justify-between uppercase">
        <span className="w-1/2 text-left">Item</span>
        <span className="w-1/4 text-center">Qty</span>
        <span className="w-1/4 text-right">Price</span>
      </div>
      {cart.map((item, idx) => (
        <div key={idx} className="flex justify-between text-xs py-1 border-b border-dotted border-gray-400">
          <span className="w-1/2 text-left truncate">{item.name}</span>
          <span className="w-1/4 text-center">{item.quantity}</span>
          <span className="w-1/4 text-right">₹{item.price * item.quantity}</span>
        </div>
      ))}
      <div className="mt-4 pt-2 border-t-2 border-black space-y-1">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-red-600">
          <span>Discount:</span>
          <span>-₹{discount}</span>
        </div>
        <div className="flex justify-between text-lg font-black pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>₹{total}</span>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t-2 border-black text-center italic text-xs">
        <p>Your clothes, cared for with Gen-Z speed.</p>
        <p className="mt-2 font-bold uppercase">THANK YOU!</p>
        <div className="mt-4 text-[8px] opacity-30">Powered by GenZLaundry-POS</div>
      </div>
    </div>
  );
};

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
