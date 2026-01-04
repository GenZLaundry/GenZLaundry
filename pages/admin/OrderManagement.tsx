
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Order, OrderStatus } from '../../types';
import { 
  Search, Printer, CheckCircle2, DollarSign, 
  Package, Truck, Clock, AlertCircle, X, ChevronDown, 
  FileText, UserMinus, PlusCircle, UserPlus, Sparkles, Calendar, Tag
} from 'lucide-react';
import { STATUS_COLORS } from '../../constants';
import BillModal from '../../components/BillModal';
import TemporaryOrderModal from '../../components/TemporaryOrderModal';
import ItemTokenModal from '../../components/ItemTokenModal';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(db.getOrders());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pricingOrder, setPricingOrder] = useState<Order | null>(null);
  const [tagOrder, setTagOrder] = useState<Order | null>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  useEffect(() => {
    const i = setInterval(() => {
      setOrders(db.getOrders());
    }, 5000);
    return () => clearInterval(i);
  }, []);

  const handleStatusUpdate = (id: string, s: OrderStatus) => {
    db.updateOrderStatus(id, s);
    setOrders(db.getOrders());
  };

  const filtered = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.tokenNumber.includes(search) || o.userName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Operations Hub</h1>
          <p className="text-slate-500 font-medium">Control the enterprise lifecycle of active orders.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button 
            onClick={() => setShowWalkInModal(true)}
            className="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            New Walk-in Order
          </button>
          
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search token/name..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-2xl px-6 py-3.5 text-sm font-black uppercase tracking-widest text-slate-600 shadow-sm outline-none"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">ALL STAGES</option>
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Identity & Schedule</th>
                <th className="px-8 py-6">Customer Context</th>
                <th className="px-8 py-6">Manifest & Value</th>
                <th className="px-8 py-6">Lifecycle Control</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice().reverse().map(order => {
                const needsPricing = order.items.some(i => i.unitPrice === 0);
                const isWalkIn = order.userId === 'WALK-IN';
                const orderDate = new Date(order.createdAt);
                const totalQty = order.items.reduce((a,c)=>a+c.quantity, 0);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${STATUS_COLORS[order.status]}`}>
                          #{order.tokenNumber.split('-')[1]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="font-black text-slate-900 tracking-tighter">#{order.tokenNumber}</p>
                             {isWalkIn && <span title="Walk-in Order"><UserMinus size={12} className="text-slate-300" /></span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={10} className="text-slate-300" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              <span className="text-indigo-600 font-black">{orderDate.toLocaleDateString('en-US', { weekday: 'short' })},</span> {orderDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{order.userName}</span>
                        <span className="text-xs text-slate-400 font-medium">{order.userPhone}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-slate-900">₹{order.totalAmount}</span>
                          {needsPricing && (
                            <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                              <AlertCircle size={10} /> Needs Pricing
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{totalQty} garments in manifest</span>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        <select 
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border outline-none transition-all ${STATUS_COLORS[order.status]}`}
                          value={order.status}
                          onChange={e => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                        >
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setTagOrder(order)}
                          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                          title="Generate Garment Tags"
                        >
                          <Tag size={20} />
                        </button>
                        <button 
                          onClick={() => setPricingOrder(order)}
                          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                          title="Authorize Pricing"
                        >
                          <DollarSign size={20} />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                          title="Print Receipt"
                        >
                          <Printer size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-32 text-center">
              <Package className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No operational records found</p>
            </div>
          )}
        </div>
      </div>

      {showWalkInModal && (
        <TemporaryOrderModal 
          onClose={() => setShowWalkInModal(false)} 
          onSuccess={(o: Order) => {
            setShowWalkInModal(false);
            setOrders(db.getOrders());
            setSelectedOrder(o);
          }} 
        />
      )}

      {pricingOrder && (
        <PricingAuthorization 
          order={pricingOrder} 
          onClose={() => setPricingOrder(null)} 
          onSave={() => { setPricingOrder(null); setOrders(db.getOrders()); }}
        />
      )}

      {selectedOrder && <BillModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      {tagOrder && <ItemTokenModal order={tagOrder} onClose={() => setTagOrder(null)} />}
    </div>
  );
};

const PricingAuthorization = ({ order, onClose, onSave }: any) => {
  const [items, setItems] = useState([...order.items]);
  const [delivery, setDelivery] = useState(order.deliveryCharge || 0);

  const updatePrice = (idx: number, p: number) => {
    const next = [...items];
    next[idx].unitPrice = p;
    next[idx].totalPrice = p * next[idx].quantity;
    setItems(next);
  };

  const handleSave = () => {
    db.updateOrder(order.id, { items, deliveryCharge: delivery });
    onSave();
  };

  const subtotal = items.reduce((a, b) => a + (b.totalPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Pricing Intelligence</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Reviewing Token #{order.tokenNumber}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"><X /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
            <Sparkles className="text-indigo-600 shrink-0 mt-1" size={20} />
            <p className="text-sm font-medium text-indigo-700 leading-relaxed">
              Master Control: You can modify the unit price of <strong>any</strong> item below. The total for each entry will automatically calculate based on quantity.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quantity: {item.quantity}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <label className="text-[8px] font-black uppercase text-slate-400 mb-1">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={item.unitPrice || ''} 
                        onChange={e => updatePrice(i, parseFloat(e.target.value) || 0)}
                        className="w-32 pl-8 pr-4 py-3 bg-white rounded-2xl border border-slate-200 outline-none font-black text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-2">Total (x{item.quantity})</p>
                    <p className="font-black text-slate-900">₹{item.totalPrice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
               <Truck size={16} className="text-slate-400" />
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Override Delivery Surcharge</label>
            </div>
            <div className="flex gap-2">
              {[0, 30, 50, 100].map(v => (
                <button key={v} onClick={() => setDelivery(v)} className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all border ${delivery === v ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-100'}`}>₹{v}</button>
              ))}
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                <input 
                  type="number" 
                  value={delivery}
                  onChange={e => setDelivery(parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-3 bg-white rounded-2xl border border-slate-200 outline-none font-black text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Final Authorization Value</p>
              <p className="text-4xl font-black text-indigo-700 tracking-tighter">₹{subtotal + delivery}</p>
            </div>
            <p className="text-xs font-bold text-slate-400">Total {items.reduce((a,c)=>a+c.quantity, 0)} items manifest</p>
          </div>
          <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
            Authorize & Commit Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
