
import React, { useState } from 'react';
import { db } from '../../db';
import { User, UserRole } from '../../types';
import { Search, UserPlus, Phone, Mail, MapPin, ExternalLink, Filter, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState(db.getUsers().filter(u => u.role === UserRole.CUSTOMER));
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = customers.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Relationship Console</h1>
          <p className="text-slate-500 font-medium">Lifecycle management for your enterprise customer base.</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 transition-all">
          <UserPlus size={20} />
          Register New Account
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filter customer database by name, email or phone index..."
          className="w-full bg-white border border-slate-200 rounded-[32px] py-6 pl-16 pr-8 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.map(c => {
          const orders = db.getOrders().filter(o => o.userId === c.id);
          const totalVal = orders.reduce((a, b) => a + b.totalAmount, 0);
          return (
            <div key={c.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 text-slate-50 opacity-10 group-hover:text-indigo-50 group-hover:opacity-100 transition-colors">
                  <History size={100} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        {c.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-slate-900 tracking-tighter">{c.fullName}</h3>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Active Client</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/admin/history?userId=${c.id}`)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all shadow-sm"
                      title="View Service History"
                    >
                      <History size={20} />
                    </button>
                  </div>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                      <Phone size={16} className="text-slate-300" /> {c.phone}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                      <Mail size={16} className="text-slate-300" /> {c.email}
                    </div>
                    <div className="flex items-start gap-4 text-sm font-bold text-slate-500">
                      <MapPin size={16} className="text-slate-300 mt-1 flex-shrink-0" /> <span className="line-clamp-1">{c.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-10 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Value</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalVal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">{orders.length}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/admin/history?userId=${c.id}`)}
                    className="mt-8 w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                  >
                    Explore Complete History
                  </button>
               </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-40 text-center">
            <Filter className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Database query returned zero records</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
