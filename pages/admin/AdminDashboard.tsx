
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Users, ShoppingBag, TrendingUp, ShieldCheck, 
  ArrowUpRight, ArrowDownRight, Truck, Wallet, Activity, Banknote, Briefcase
} from 'lucide-react';
import { OrderStatus } from '../../types';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState(db.getOrders());
  const [expenses, setExpenses] = useState(db.getExpenses());
  const [users, setUsers] = useState(db.getUsers());
  
  useEffect(() => {
    const i = setInterval(() => {
      setOrders(db.getOrders());
      setExpenses(db.getExpenses());
      setUsers(db.getUsers());
    }, 3000);
    return () => clearInterval(i);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Today's Collection: Only Delivered Today
  const todayCollection = orders
    .filter(o => o.status === OrderStatus.DELIVERED && o.updatedAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 2. Net Yield: Total Networth (Sum of all orders ever - Sum of all expenses)
  const totalValueBooked = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netYieldNetworth = totalValueBooked - totalExpenses;

  // 3. Active Pipeline: Value of orders NOT yet delivered
  const pipelineValue = orders
    .filter(o => o.status !== OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const chartData = [
    { name: 'Mon', rev: 4500 }, { name: 'Tue', rev: 5200 },
    { name: 'Wed', rev: 4800 }, { name: 'Thu', rev: 6100 },
    { name: 'Fri', rev: 5900 }, { name: 'Sat', rev: 8200 },
    { name: 'Sun', rev: 7100 },
  ];

  const statusMix = [
    { name: 'PEND', count: orders.filter(o => o.status === OrderStatus.PENDING).length, color: '#F43F5E' },
    { name: 'WASH', count: orders.filter(o => o.status === OrderStatus.WASHING).length, color: '#F59E0B' },
    { name: 'RDY', count: orders.filter(o => o.status === OrderStatus.READY).length, color: '#6366F1' },
    { name: 'DEL', count: orders.filter(o => o.status === OrderStatus.DELIVERED).length, color: '#10B981' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI 
          icon={Banknote} 
          label="Today's Collection" 
          value={`₹${todayCollection}`} 
          trend={todayCollection > 0 ? +100 : 0} 
          color="today" 
          special
        />
        <KPI 
          icon={Briefcase} 
          label="Net Yield" 
          value={`₹${netYieldNetworth}`} 
          trend={+12.8} 
          color="emerald" 
          subtitle="Total Business Networth"
        />
        <KPI 
          icon={ShoppingBag} 
          label="Active Pipeline" 
          value={`₹${pipelineValue}`} 
          trend={+5.4} 
          color="indigo" 
          subtitle="Revenue in Progress"
        />
        <KPI 
          icon={Wallet} 
          label="Total Overheads" 
          value={`₹${totalExpenses}`} 
          trend={+1.5} 
          color="rose" 
          subtitle="Lifetime Expenses"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[48px] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Activity className="text-indigo-600" size={24} />
              Growth Dynamics
            </h3>
            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-xl tracking-widest border border-indigo-100">Live Sync</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} dy={15} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }} />
                <Area type="monotone" dataKey="rev" stroke="#6366f1" strokeWidth={5} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10">Pipeline Density</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusMix}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 9}} dy={10} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="count" radius={[12, 12, 12, 12]} barSize={32}>
                  {statusMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
             {statusMix.map((s, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.name}: {s.count}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[50px] p-12 text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 opacity-20"></div>
            <div className="relative z-10">
               <h4 className="text-3xl font-black tracking-tighter mb-2">Audit Control</h4>
               <p className="text-slate-400 text-sm font-medium">Verify system-wide data integrity.</p>
            </div>
            <div className="p-5 bg-white/10 rounded-3xl text-emerald-400 relative z-10 backdrop-blur-md">
               <ShieldCheck size={36} />
            </div>
         </div>
         <div className="bg-indigo-600 rounded-[50px] p-12 text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
               <h4 className="text-3xl font-black tracking-tighter mb-2">Logistics Hub</h4>
               <p className="text-indigo-100 text-sm font-medium">Auto-dispatch {orders.filter(o=>o.status==='ready').length} ready manifests.</p>
            </div>
            <div className="p-5 bg-white/10 rounded-3xl relative z-10 backdrop-blur-md">
               <Truck size={36} />
            </div>
         </div>
      </div>
    </div>
  );
};

const KPI = ({ icon: Icon, label, value, trend, color, special, subtitle }: any) => {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    today: 'bg-emerald-600 text-white border-emerald-500'
  };

  if (special) {
    return (
      <div className={`${themes[color]} p-8 md:p-10 rounded-[40px] border shadow-xl shadow-emerald-500/20 relative overflow-hidden group animate-in zoom-in-95 duration-500`}>
        <Icon className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform duration-500" size={120} />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-100 mb-2">{label}</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{value}</h3>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50">Live Collection</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border transition-all group-hover:scale-110 ${themes[color]}`}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">{label}</p>
      {subtitle && <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mb-2">{subtitle}</p>}
      <div className="flex items-baseline gap-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <span className={`text-[10px] font-black flex items-center gap-1.5 px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </div>
  );
};

export default AdminDashboard;
