
import React, { useState } from 'react';
import { SERVICES } from '../../constants';
import { db } from '../../db';
import { useAuth } from '../../App';
import { OrderStatus, OrderItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Minus, ShoppingBag, Trash2, ArrowRight, 
  ClipboardList, AlertCircle, Sparkles, MessageSquare,
  CheckCircle2, Package, Loader2
} from 'lucide-react';

const NewOrder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Record<string, number>>({});
  const [customs, setCustoms] = useState<OrderItem[]>([]);
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateQty = (id: string, d: number) => {
    setItems(prev => {
      const q = Math.max(0, (prev[id] || 0) + d);
      const next = { ...prev };
      if (q === 0) delete next[id];
      else next[id] = q;
      return next;
    });
  };

  const calculateSubtotal = () => {
    const catalogTotal = Object.entries(items).reduce((acc, [id, q]) => acc + (SERVICES.find(s => s.id === id)?.price || 0) * q, 0);
    const customsTotal = customs.reduce((acc, it) => acc + it.totalPrice, 0);
    return catalogTotal + customsTotal;
  };

  const handlePlace = () => {
    if (Object.keys(items).length === 0 && customs.length === 0) return;
    if (!user) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems: OrderItem[] = [
        ...Object.entries(items).map(([id, q]) => {
          const s = SERVICES.find(x => x.id === id)!;
          return { itemId: id, name: s.name, quantity: q, unitPrice: s.price, totalPrice: s.price * q };
        }),
        ...customs
      ];

      const order = {
        id: Math.random().toString(36).substr(2,9),
        tokenNumber: db.generateToken(),
        userId: user.id,
        userName: user.fullName,
        userPhone: user.phone || '',
        userAddress: user.address,
        isTemporary: false,
        status: OrderStatus.PENDING,
        items: orderItems,
        totalAmount: calculateSubtotal(),
        specialInstructions: notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.saveOrder(order);
      navigate('/customer');
    }, 1500);
  };

  const addCustom = () => {
    if (!customName) return;
    setCustoms([...customs, { 
      itemId: `c-${Date.now()}`, 
      name: customName, 
      quantity: customQty, 
      unitPrice: 0, 
      totalPrice: 0 
    }]);
    setCustomName('');
    setCustomQty(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-[30px] flex items-center justify-center text-white shadow-2xl">
          <Package size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Initialize Request</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Populate your care manifest with items for processing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CATALOG SECTION */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4">
              Standard Services <div className="h-px flex-1 bg-slate-100"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES.map(s => {
                const q = items[s.id] || 0;
                return (
                  <div key={s.id} className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between ${q > 0 ? 'border-indigo-600 bg-indigo-50/50 shadow-xl shadow-indigo-100/50' : 'border-slate-50 bg-white hover:border-slate-200 shadow-sm'}`}>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5">{s.name}</p>
                      <p className="text-indigo-600 font-black text-sm">₹{s.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                      <button onClick={() => updateQty(s.id, -1)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"><Minus size={18}/></button>
                      <span className="w-6 text-center font-black text-slate-900">{q}</span>
                      <button onClick={() => updateQty(s.id, 1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg"><Plus size={18}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center"><Sparkles size={20}/></div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Specialized Care</h3>
                </div>
                <p className="text-slate-400 font-medium mb-8 text-sm">Add bespoke garments. Pricing is authorized post-inspection by our master cleaners.</p>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Garment Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Wedding Gown or Designer Silk Saree"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <button onClick={() => setCustomQty(Math.max(1, customQty - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Minus size={16}/></button>
                      <input 
                        type="number" 
                        className="w-12 bg-transparent text-center font-black text-slate-900 outline-none" 
                        value={customQty} 
                        onChange={e => setCustomQty(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button onClick={() => setCustomQty(customQty + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white"><Plus size={16}/></button>
                    </div>
                  </div>
                  <button 
                    onClick={addCustom}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all h-[58px]"
                  >
                    Append to List
                  </button>
                </div>

                {customs.length > 0 && (
                  <div className="mt-10 space-y-3">
                    {customs.map((c, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2">
                        <div>
                          <p className="font-bold text-slate-700 text-sm">{c.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty: {c.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">Awaiting Inspection</span>
                           <button onClick={() => setCustoms(customs.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </section>

          <section className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center"><MessageSquare size={20}/></div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Instructions</h3>
             </div>
             <textarea 
              placeholder="e.g. Handle velvet lapels with extreme care, ensure no high heat for the woolens..."
              className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-8 py-6 font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[160px] text-sm"
              value={notes}
              onChange={e => setNotes(e.target.value)}
             />
          </section>
        </div>

        {/* SIDEBAR MANIFEST */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-24 bg-slate-900 rounded-[50px] shadow-2xl p-10 text-white space-y-10 overflow-hidden">
             <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full blur-[80px] -mr-20 -mt-20 opacity-30"></div>
             
             <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <ShoppingBag size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter">Live Manifest</h3>
             </div>

             <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 relative z-10">
                {Object.entries(items).map(([id, q]) => {
                  const s = SERVICES.find(x => x.id === id)!;
                  return (
                    <div key={id} className="flex justify-between items-end border-b border-white/5 pb-5">
                       <div>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{q} Units</p>
                          <p className="font-bold text-slate-200 tracking-tight text-sm">{s.name}</p>
                       </div>
                       <p className="font-black text-lg">₹{s.price * q}</p>
                    </div>
                  );
                })}
                {customs.map((c, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-white/5 pb-5 italic">
                     <div>
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">{c.quantity} Units</p>
                        <p className="font-bold text-slate-400 tracking-tight text-sm">{c.name}</p>
                     </div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quote TBD</p>
                  </div>
                ))}
                {(Object.keys(items).length === 0 && customs.length === 0) && (
                  <div className="py-20 text-center opacity-20">
                     <Package size={60} className="mx-auto mb-4" />
                     <p className="font-black uppercase text-[10px] tracking-widest">Cart is empty</p>
                  </div>
                )}
             </div>

             <div className="pt-10 border-t border-white/10 relative z-10">
                <div className="flex justify-between items-end mb-10">
                   <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Authorized</p>
                      <p className="text-5xl font-black text-indigo-400 tracking-tighter">₹{calculateSubtotal()}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Items</p>
                      <p className="text-xl font-black text-white">{Object.values(items).reduce((a,b)=>a+b, 0) + customs.reduce((a,c)=>a+c.quantity, 0)}</p>
                   </div>
                </div>
                <button 
                  disabled={isSubmitting || (Object.keys(items).length === 0 && customs.length === 0)}
                  onClick={handlePlace}
                  className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : (
                    <>Initialize Care <ArrowRight size={20} /></>
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
