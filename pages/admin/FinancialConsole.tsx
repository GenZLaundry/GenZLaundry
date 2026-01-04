
import React, { useState, useEffect } from 'react';
import { db } from '../../db';
import { Expense, OrderStatus } from '../../types';
import { 
  Plus, Wallet, Receipt, Trash2, Calendar, 
  ChevronRight, Filter, Download, DollarSign, TrendingDown, X
} from 'lucide-react';

const FinancialConsole: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'Utilities', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    setExpenses(db.getExpenses());
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Realized Revenue (Only Delivered)
  const realizedRevenue = db.getOrders()
    .filter(o => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const netProfit = realizedRevenue - totalExpenses;

  const categories = ['Utilities', 'Rent', 'Supplies', 'Marketing', 'Maintenance', 'Staffing', 'Other'];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
      date: form.date
    };
    db.saveExpense(newExp);
    setExpenses(db.getExpenses());
    setShowAdd(false);
    setForm({ category: 'Utilities', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    db.deleteExpense(id);
    setExpenses(db.getExpenses());
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Console</h1>
          <p className="text-slate-500 font-medium">Manage overheads, log expenses, and monitor realized net profitability.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3"
        >
          <Plus size={20} />
          Log New Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FinCard label="Realized Revenue" value={`₹${realizedRevenue}`} color="indigo" badge="Delivered Only" />
        <FinCard label="Business Overheads" value={`₹${totalExpenses}`} color="rose" negative />
        <FinCard label="Net Profitability" value={`₹${netProfit}`} color={netProfit >= 0 ? 'emerald' : 'rose'} />
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                <Receipt size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Expense Ledger</h3>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Download size={18}/></button>
              <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Filter size={18}/></button>
           </div>
        </div>
        <div className="divide-y divide-slate-50">
           {expenses.slice().reverse().map(e => {
             const expDate = new Date(e.date);
             return (
               <div key={e.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                        {e.category.slice(0, 3)}
                     </div>
                     <div>
                        <p className="font-bold text-slate-900">{e.description || e.category}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{e.category}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span className="text-rose-500">{expDate.toLocaleDateString('en-US', { weekday: 'short' })},</span> {expDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <p className="text-xl font-black text-rose-500 tracking-tighter">-₹{e.amount}</p>
                     <button onClick={() => handleDelete(e.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
               </div>
             );
           })}
           {expenses.length === 0 && (
             <div className="py-32 text-center opacity-30">
                <Wallet size={64} className="mx-auto mb-6" />
                <p className="font-black uppercase tracking-[0.3em] text-[10px]">No expenses logged in this period</p>
             </div>
           )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Log Expense</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
             </div>
             <form onSubmit={handleAdd} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Service Category</label>
                   <select 
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold outline-none"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                   >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cost Value</label>
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                      <input 
                        required 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full pl-10 pr-6 py-4 rounded-2xl bg-slate-50 font-black border-none outline-none focus:ring-2 focus:ring-rose-500" 
                        value={form.amount}
                        onChange={e => setForm({...form, amount: e.target.value})}
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Index Description</label>
                   <input 
                    required 
                    placeholder="e.g. Electric Bill July 2024" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none outline-none" 
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Ledger Date</label>
                   <input 
                    required 
                    type="date" 
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 font-bold border-none outline-none" 
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                   />
                </div>
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-4">
                   Commit to Ledger
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FinCard = ({ label, value, color, negative, badge }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-600 text-white',
    rose: 'bg-rose-500 text-white',
    emerald: 'bg-emerald-500 text-white'
  };
  return (
    <div className={`${styles[color]} p-10 rounded-[48px] shadow-2xl shadow-${color}-500/20 relative overflow-hidden`}>
       <DollarSign className="absolute -bottom-10 -right-10 text-white/10" size={160} />
       <div className="flex justify-between items-start mb-2">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">{label}</p>
         {badge && (
           <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-lg border border-white/10">{badge}</span>
         )}
       </div>
       <h3 className="text-4xl font-black tracking-tighter">
         {negative && '- '}{value}
       </h3>
    </div>
  );
};

export default FinancialConsole;
