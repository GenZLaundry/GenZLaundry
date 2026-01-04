
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { useAuth } from '../../App';
import { Order, OrderStatus } from '../../types';
import { Package, Calendar, ArrowRight, Search, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomerHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Order[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      const orders = db.getOrders().filter(o => o.userId === user.id && o.status === OrderStatus.DELIVERED);
      setHistory(orders);
    }
  }, [user]);

  const filtered = history.filter(o => 
    o.tokenNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My Service History</h1>
        <p className="text-slate-500 font-medium">Historical archive of your completed care requests.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by token number..."
          className="w-full bg-white border border-slate-200 rounded-[32px] py-6 pl-16 pr-8 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.slice().reverse().map(order => {
          const date = new Date(order.updatedAt || order.createdAt);
          return (
            <div key={order.id} className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between">
               <div>
                  <div className="flex justify-between items-start mb-8">
                     <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center">
                        <Calendar size={28} />
                     </div>
                     <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl">Delivered</span>
                  </div>
                  
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter mb-6">
                    {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  <div className="space-y-3 mb-10">
                    <div className="flex items-center justify-between text-sm">
                       <span className="font-bold text-slate-400">Token</span>
                       <span className="font-black text-slate-900">#{order.tokenNumber}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                       <span className="font-bold text-slate-400">Garments</span>
                       <span className="font-black text-slate-900">{order.items.length} Units</span>
                    </div>
                  </div>
               </div>

               <Link 
                to={`/track/${order.tokenNumber}`}
                className="w-full bg-slate-50 text-slate-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
               >
                  Full Trace Report <ArrowRight size={16} />
               </Link>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 text-center">
             <Inbox className="mx-auto text-slate-200 mb-6" size={64} />
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No historical records found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerHistory;
