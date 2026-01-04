
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../db';
import { Order, OrderStatus } from '../types';
import { Truck, CheckCircle, Package, Clock, ShieldCheck, MapPin, ChevronLeft, Search, ArrowLeft } from 'lucide-react';
import { BUSINESS_CONFIG, STATUS_COLORS } from '../constants';

const TrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      if (token) {
        const found = db.getOrders().find(o => o.tokenNumber === token);
        setOrder(found || null);
      }
      setLoading(false);
    }, 800);
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-12">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <p className="text-xs font-black uppercase tracking-[0.4em] opacity-50">Syncing Intelligence</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <Search size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Token Not Found</h2>
        <p className="text-slate-400 font-medium mb-10 leading-relaxed">
          The digital identifier <span className="text-slate-900 font-bold">#{token}</span> was not located in our operational database.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 active:scale-95">
          <ChevronLeft size={16}/> Return to Portal
        </Link>
      </div>
    </div>
  );

  const steps = [
    { key: OrderStatus.PENDING, label: 'Initiated', icon: Clock, desc: 'Reviewing manifest and validating services.' },
    { key: OrderStatus.WASHING, label: 'Processing', icon: Package, desc: 'Garments are in active cleaning cycle.' },
    { key: OrderStatus.READY, label: 'Quality Assured', icon: CheckCircle, desc: 'Service complete, awaiting final dispatch.' },
    { key: OrderStatus.DELIVERED, label: 'Delivered', icon: Truck, desc: 'Order delivered to service destination.' },
  ];

  const currentIdx = steps.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-slate-900 lg:p-12 p-4 pb-20">
      <div className="max-w-6xl mx-auto mb-6 flex justify-start no-print">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors font-black uppercase text-[10px] tracking-[0.2em]">
          <ArrowLeft size={16} />
          Return to Portal
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-[60px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-700">
        <div className="p-8 md:p-20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-20">
            <div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Real-time Digital Tracking</p>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Tracking Protocol</h1>
              <div className="flex items-center gap-3">
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Digital Identifier:</span>
                 <span className="px-3 py-1 bg-slate-900 text-white font-black text-[10px] rounded-lg tracking-widest">#{order.tokenNumber}</span>
              </div>
            </div>
            <div className={`px-10 py-6 rounded-[32px] text-white font-black uppercase text-sm tracking-[0.2em] shadow-2xl ${
              order.status === 'delivered' ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}>
              {order.status}
            </div>
          </div>

          <div className="relative mb-32 px-10">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full hidden lg:block"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-1000 hidden lg:block"
              style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="flex flex-col lg:flex-row justify-between relative z-10 gap-12 lg:gap-0">
               {steps.map((step, i) => {
                 const isActive = i <= currentIdx;
                 const isCurrent = i === currentIdx;
                 return (
                   <div key={step.key} className="flex lg:flex-col items-center gap-6 lg:gap-6 text-center group flex-1">
                      <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-500 relative ${
                        isActive ? 'bg-indigo-600 text-white shadow-2xl scale-110' : 'bg-white border-2 border-slate-100 text-slate-300'
                      }`}>
                         <step.icon size={32} strokeWidth={isActive ? 2.5 : 1.5} />
                         {isCurrent && <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse"></div>}
                      </div>
                      <div className="text-left lg:text-center space-y-1">
                         <p className={`font-black text-xs uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</p>
                         <p className="text-[10px] text-slate-400 font-medium max-w-[140px] leading-tight hidden lg:block">{step.desc}</p>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-20 border-t border-slate-50">
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                     <MapPin size={14} /> Service Destination
                   </div>
                   <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{order.userName}</h4>
                      <p className="text-indigo-600 font-black text-sm uppercase tracking-widest">{order.userPhone}</p>
                      <p className="mt-6 pt-6 border-t border-slate-200 text-slate-500 font-medium leading-relaxed">{order.userAddress}</p>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
                <ShieldCheck size={200} className="absolute -bottom-20 -right-20 text-white/5" strokeWidth={1}/>
                <div className="relative z-10">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">Validated Manifest</h4>
                   <div className="space-y-6">
                      {order.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                           <div>
                              <p className="font-bold text-slate-100">{it.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Qty: {it.quantity}</p>
                           </div>
                           <p className="text-lg font-black tracking-tighter">₹{it.totalPrice}</p>
                        </div>
                      ))}
                      {(order.deliveryCharge || 0) > 0 && (
                        <div className="flex justify-between items-center py-4 border-b border-white/5">
                           <p className="text-indigo-400 font-bold text-sm italic">Logistics Surcharge</p>
                           <p className="text-indigo-400 font-black tracking-tighter">₹{order.deliveryCharge}</p>
                        </div>
                      )}
                      <div className="flex justify-between items-end pt-10">
                         <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authorization Value</p>
                            <p className="text-white font-black text-3xl tracking-tighter uppercase">Total Paid</p>
                         </div>
                         <p className="text-indigo-400 font-black text-5xl tracking-tighter">₹{order.totalAmount}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-50 p-12 lg:px-20 flex flex-col lg:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4 text-slate-400">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                <CheckCircle size={24} className="text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Verified By</p>
                 <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{BUSINESS_CONFIG.name}</p>
              </div>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
             <Link to="/" className="w-full lg:w-auto bg-white border border-slate-200 text-slate-900 px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all text-center no-print">
                Back to Home
             </Link>
             <button onClick={() => window.print()} className="w-full lg:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 no-print">
                Download Certificate
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
