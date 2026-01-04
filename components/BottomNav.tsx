
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, User, LayoutDashboard, History } from 'lucide-react';
import { UserRole } from '../types';

export default ({ role }: { role: UserRole }) => {
  const links = role === UserRole.ADMIN 
    ? [
        { to: '/admin', icon: LayoutDashboard, label: 'Home' },
        { to: '/admin/orders', icon: ClipboardList, label: 'Pipeline' },
        { to: '/admin/history', icon: History, label: 'History' }
      ]
    : [
        { to: '/customer', icon: Home, label: 'Home' },
        { to: '/customer/new-order', icon: PlusCircle, label: 'Request' },
        { to: '/customer/history', icon: History, label: 'History' }
      ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe">
      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 h-20 flex items-center justify-around shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
        {links.map((l, i) => (
          <NavLink key={i} to={l.to} className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
            <l.icon size={22} />
            <span className="text-[10px] font-black uppercase tracking-widest">{l.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
