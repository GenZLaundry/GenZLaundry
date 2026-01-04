
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Order, OrderStatus, User } from '../../types';
import { Search, Package, Calendar, ArrowRight, Filter, Download, X, User as UserIcon } from 'lucide-react';
import { STATUS_COLORS } from '../../constants';
import BillModal from '../../components/BillModal';
import { useSearchParams } from 'react-router-dom';

const AdminHistory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  const [history, setHistory] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredUser, setFilteredUser] = useState<User | null>(null);

  useEffect(() => {
    let orders = db.getOrders().filter(o => o.status === OrderStatus.DELIVERED);
    
    if (userIdParam) {
      orders = orders.filter(o => o.userId === userIdParam);
      const user = db.getUsers().find(u => u.id === userIdParam);
      if (user) setFilteredUser(user);
    } else {
      setFilteredUser(null);
    }
    
    setHistory(orders);
  }, [userIdParam]);

  const filtered = history.filter(o => 
    o.tokenNumber.toLowerCase().includes(search.toLowerCase()) || 
    o.userName.toLowerCase().includes(search.toLowerCase())
  );

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Service Archive</h1>
          <p className="text-slate-500 font-medium">Historical record of all delivered manifests and realized value.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Download size={20} />
          </button>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {filteredUser && (
        <div className="bg-indigo-600 p-6 rounded-[32px] text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-indigo-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <UserIcon size={24} className="text-indigo-200" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Filtering History For</p>
              <h3 className="text-xl font-black tracking-tight">{filteredUser.fullName}</h3>
            </div>
          </div>
          <button 
            onClick={clearFilter}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Clear Filter <X size={16} />
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={filteredUser ? `Search tokens in ${filteredUser.fullName.split(' ')[0]}'s archive...` : "Search archived tokens or customer names..."}
          className="w-full bg-white border border-slate-200 rounded-[32px] py-6 pl-16 pr-8 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-10 py-6">Date & Schedule</th>
                <th className="px-10 py-6">Order Identity</th>
                <th className="px-10 py-6">Customer Context</th>
                <th className="px-10 py-6">Realized Value</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.slice().reverse().map(order => {
                const date = new Date(order.updatedAt || order.createdAt);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">
                            {date.toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                          <p className="font-bold text-slate-900">
                            {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-black text-slate-900 tracking-tighter">#{order.tokenNumber}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.items.length} Items</p>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-bold text-slate-900">{order.userName}</p>
                       <p className="text-xs text-slate-400">{order.userPhone}</p>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-xl font-black text-slate-900 tracking-tighter">₹{order.totalAmount}</p>
                       <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">Realized</span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
                       >
                         <ArrowRight size={20} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-40 text-center">
              <Package className="mx-auto text-slate-200 mb-6" size={64} />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
                {filteredUser ? `${filteredUser.fullName.split(' ')[0]}'s archive is empty` : 'Archive is currently empty'}
              </p>
              {filteredUser && (
                <button onClick={clearFilter} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">View All History</button>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && <BillModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

export default AdminHistory;
