
import React from 'react';
import { Order } from '../types';
import { BUSINESS_CONFIG } from '../constants';
import { X, Printer, CheckCircle, Calendar } from 'lucide-react';

const BillModal: React.FC<{ order: Order, onClose: () => void }> = ({ order, onClose }) => {
  const subtotal = order.items.reduce((a, b) => a + (b.totalPrice || 0), 0);
  const orderDate = new Date(order.createdAt);
  
  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 no-print">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tighter">Receipt Preview</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
          {/* Mockup of the Print-Optimized View */}
          <div className="bg-white p-10 rounded-[32px] shadow-sm font-mono text-sm text-slate-700 border border-slate-200">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-indigo-600 tracking-tighter mb-1 uppercase">{BUSINESS_CONFIG.name}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                {BUSINESS_CONFIG.address}<br/>Ph: {BUSINESS_CONFIG.phone}
              </p>
              <div className="mt-6 border-b border-dashed border-slate-200"></div>
            </div>

            <div className="flex justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Token ID</p>
                <p className="font-bold text-slate-900">#{order.tokenNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Registered Date</p>
                <p className="font-bold text-slate-900 text-xs">
                  {orderDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="mb-8">
               <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Customer Context</p>
               <p className="font-black text-slate-900">{order.userName}</p>
               <p className="text-xs">{order.userPhone}</p>
               <p className="text-[10px] text-slate-400 italic mt-1">{order.userAddress}</p>
            </div>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase pb-2 border-b border-slate-100">
                  <span>Manifest Item</span>
                  <span>Value</span>
               </div>
               {order.items.map((item, i) => (
                 <div key={i} className="flex justify-between text-xs">
                    <span>{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                    <span className="font-bold">₹{item.totalPrice}</span>
                 </div>
               ))}
               {(order.deliveryCharge || 0) > 0 && (
                 <div className="flex justify-between text-xs text-indigo-600 font-bold italic">
                    <span>Delivery Surcharge</span>
                    <span>₹{order.deliveryCharge}</span>
                 </div>
               )}
            </div>

            <div className="border-t-2 border-dashed border-slate-200 pt-6">
               <div className="flex justify-between items-baseline">
                  <span className="text-xs font-black uppercase text-slate-400">Total Authorized</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{order.totalAmount}</span>
               </div>
            </div>

            <div className="mt-10 text-center text-[10px] text-slate-400 space-y-2">
               <p className="font-black uppercase tracking-[0.2em] text-indigo-500">Authorized & Paid</p>
               <p>System Generated Digital Signature</p>
               <p>Visit: laundryledger.com/track/{order.tokenNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <button 
            onClick={() => window.print()}
            className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Printer size={20} />
            Initialize Print Queue
          </button>
        </div>
      </div>

      {/* Actual Hidden Print Element */}
      <div className="print-only fixed inset-0 bg-white p-8 font-mono text-[14px] text-black">
         <div className="text-center mb-8">
            <h1 className="text-2xl font-bold uppercase">{BUSINESS_CONFIG.name}</h1>
            <p className="text-xs uppercase">{BUSINESS_CONFIG.address}</p>
            <p className="text-xs">Ph: {BUSINESS_CONFIG.phone}</p>
            <div className="border-b border-black my-4"></div>
         </div>
         <div className="flex justify-between mb-4">
            <span className="font-bold">TOKEN: #{order.tokenNumber}</span>
            <span>{orderDate.toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
         </div>
         <div className="mb-4">
            <p className="font-bold">{order.userName}</p>
            <p>{order.userPhone}</p>
            <p className="text-xs italic">{order.userAddress}</p>
         </div>
         <div className="border-y border-black py-4 mb-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between py-1">
                 <span>{item.name} (x{item.quantity})</span>
                 <span>₹{item.totalPrice}</span>
              </div>
            ))}
            {(order.deliveryCharge || 0) > 0 && (
              <div className="flex justify-between py-1 italic font-bold">
                 <span>Logistics Surcharge</span>
                 <span>₹{order.deliveryCharge}</span>
              </div>
            )}
         </div>
         <div className="flex justify-between text-2xl font-bold">
            <span>TOTAL:</span>
            <span>₹{order.totalAmount}</span>
         </div>
         <div className="mt-12 text-center text-xs space-y-2">
            <p className="font-bold">THANK YOU FOR YOUR BUSINESS</p>
            <p>System Generated Digital Invoice</p>
         </div>
      </div>
    </div>
  );
};

export default BillModal;
