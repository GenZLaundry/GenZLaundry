
import React, { useState } from 'react';
import { X, Plus, Minus, User, Phone, MapPin, PackageCheck, ChevronRight, ArrowLeft, Sparkles, Truck } from 'lucide-react';
import { SERVICES } from '../constants';
import { db } from '../db';
import { OrderStatus, OrderItem } from '../types';

export default ({ onClose, onSuccess }: any) => {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name: '', phone: '', address: 'Counter Service / Walk-in' });
  const [items, setItems] = useState<Record<string, number>>({});
  const [customItems, setCustomItems] = useState<OrderItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  const subtotalStandard = Object.entries(items).reduce((a, [id, q]) => a + (SERVICES.find(s=>s.id===id)?.price||0)*q, 0);
  const subtotalCustom = customItems.reduce((a, b) => a + b.totalPrice, 0);
  const total = subtotalStandard + subtotalCustom + deliveryCharge;

  const addCustomItem = () => {
    if (!customName || !customPrice) return;
    const price = parseFloat(customPrice);
    const qty = Math.max(1, customQty);
    setCustomItems([...customItems, {
      itemId: `c-${Date.now()}`,
      name: customName,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty
    }]);
    setCustomName('');
    setCustomPrice('');
    setCustomQty(1);
  };

  const save = () => {
    if (Object.keys(items).length === 0 && customItems.length === 0) return;
    const o = {
      id: Math.random().toString(36).substr(2,9), 
      tokenNumber: db.generateToken(), 
      userId: 'WALK-IN', 
      userName: info.name || 'Anonymous Guest', 
      userPhone: info.phone || 'Not Provided', 
      userAddress: info.address, 
      isTemporary: true, 
      status: OrderStatus.PENDING,
      items: [
        ...Object.entries(items).map(([id, q]) => {
          const s = SERVICES.find(x => x.id === id)!;
          return { itemId: id, name: s.name, quantity: q, unitPrice: s.price, totalPrice: s.price * q };
        }),
        ...customItems
      ],
      deliveryCharge,
      totalAmount: total, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString()
    };
    db.saveOrder(o);
    onSuccess(o);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Walk-in Registry</h2>
            <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Manual Manifest Entry</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Customer Name" 
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                    value={info.name} 
                    onChange={e=>setInfo({...info, name:e.target.value})} 
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Phone Number" 
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                    value={info.phone} 
                    onChange={e=>setInfo({...info, phone:e.target.value})} 
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Address / Note" 
                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all" 
                    value={info.address} 
                    onChange={e=>setInfo({...info, address:e.target.value})} 
                  />
                </div>
              </div>
              <button 
                onClick={()=>setStep(2)} 
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                Assemble Manifest <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right duration-300">
              <button onClick={()=>setStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                <ArrowLeft size={14}/> Back to Customer
              </button>
              
              {/* Standard Catalog */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Standard Catalog</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map(s => {
                    const q = items[s.id] || 0;
                    return (
                      <div key={s.id} className={`flex justify-between items-center p-4 rounded-3xl border transition-all ${q > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent'}`}>
                        <div className="flex-1 mr-2">
                          <p className="font-bold text-slate-900 text-xs truncate">{s.name}</p>
                          <p className="text-indigo-600 font-black text-[10px]">₹{s.price}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                          <button 
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
                            onClick={() => setItems({...items, [s.id]: Math.max(0, (items[s.id]||0)-1)})}
                          >
                            <Minus size={14}/>
                          </button>
                          <span className="w-4 text-center font-black text-slate-900 text-xs">{q}</span>
                          <button 
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm"
                            onClick={() => setItems({...items, [s.id]: (items[s.id]||0)+1})}
                          >
                            <Plus size={14}/>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Custom Item Entry */}
              <section className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Custom Manual Item</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      placeholder="Garment Name" 
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1 sm:w-24">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px]">₹</span>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500"
                          value={customPrice}
                          onChange={e => setCustomPrice(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button onClick={() => setCustomQty(Math.max(1, customQty - 1))} className="p-1 hover:text-indigo-600"><Minus size={14}/></button>
                        <span className="text-[10px] font-black w-4 text-center">{customQty}</span>
                        <button onClick={() => setCustomQty(customQty + 1)} className="p-1 hover:text-indigo-600"><Plus size={14}/></button>
                      </div>
                      <button 
                        onClick={addCustomItem}
                        className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                {customItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {customItems.map((ci, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div>
                          <span className="text-xs font-bold text-slate-700">{ci.name}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase ml-2">x {ci.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-indigo-600">₹{ci.totalPrice}</span>
                          <button onClick={() => setCustomItems(customItems.filter((_, idx) => idx !== i))} className="text-rose-400 hover:text-rose-600"><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Logistics */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className="text-slate-400" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics / Delivery</h4>
                </div>
                <div className="flex gap-2">
                  {[0, 30, 50, 100].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setDeliveryCharge(v)}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border ${deliveryCharge === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200'}`}
                    >
                      ₹{v}
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      placeholder="Custom" 
                      className="w-full h-full bg-white border border-slate-200 rounded-xl px-4 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={e => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Valuation</p>
              <p className="text-4xl font-black text-indigo-700 tracking-tighter">₹{total}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
              <p className="font-black text-slate-900 text-xl">{Object.values(items).reduce((a,b)=>a+b, 0) + customItems.reduce((a,c)=>a+c.quantity, 0)}</p>
            </div>
          </div>
          <button 
            disabled={step === 1 || (Object.keys(items).length === 0 && customItems.length === 0)}
            onClick={save} 
            className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            Finalize Entry <PackageCheck size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
