
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { useAuth } from '../../App';
import { Order, OrderStatus } from '../../types';
import { Package, Clock, CheckCircle, ShoppingBag, ArrowRight, PackagePlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATUS_COLORS } from '../../constants';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) setOrders(db.getOrders().filter(o => o.userId === user.id));
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Manifest Hub</h1>
          <p className="text-slate-500 font-medium">Welcome back, {user.fullName}. Monitor your active care items.</p>
        </div>
        <Link to="/customer/new-order" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3">
          <PackagePlus size={20} />
          Initialize New Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Summary icon={Clock} label="Active Pipeline" count={orders.filter(o => o.status !== OrderStatus.DELIVERED).length} color="indigo" />
        <Summary icon={CheckCircle} label="Completed Care" count={orders.filter(o => o.status === OrderStatus.DELIVERED).length} color="emerald" />
        <Summary icon={ShoppingBag} label="Total Manifests" count={orders.length} color="slate" />
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 tracking-tighter">Order History</h3>
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{orders.length} Records</span>
        </div>
        <div className="divide-y divide-slate-50">
           {orders.slice().reverse().map(o => (
             <div key={o.id} className="p-8 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black transition-all group-hover:scale-105 ${STATUS_COLORS[o.status]}`}>
                      <Package size={28} />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className="font-black text-slate-900 tracking-tighter text-lg">#{o.tokenNumber}</span>
                         <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[o.status]}`}>
                            {o.status}
                         </span>
                      </div>
                      <p className="text-sm font-medium text-slate-400">
                        {o.items.length} garments • Authorized Value: ₹{o.totalAmount}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="hidden lg:block text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Service Date</p>
                      <p className="font-bold text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</p>
                   </div>
                   <Link to={`/track/${o.tokenNumber}`} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all active:scale-95">
                      <ArrowRight size={24} />
                   </Link>
                </div>
             </div>
           ))}
           {orders.length === 0 && (
             <div className="py-32 text-center">
                <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
                <h4 className="text-xl font-black text-slate-900 tracking-tighter mb-2">Manifest is Clean</h4>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">You haven't initiated any care requests yet. Start your first order today.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const Summary = ({ icon: Icon, label, count, color }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    slate: 'bg-slate-50 text-slate-600'
  };
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center gap-6">
       <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center ${colors[color]}`}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{count}</p>
       </div>
    </div>
  );
};

export default CustomerDashboard;
