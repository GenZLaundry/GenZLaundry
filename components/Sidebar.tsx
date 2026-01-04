
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Users, Truck, PlusCircle, History } from 'lucide-react';
import { UserRole } from '../types';

export default ({ role }: { role: UserRole }) => {
  const links = role === UserRole.ADMIN 
    ? [
        { to: '/admin', icon: LayoutDashboard, label: 'Control Center' },
        { to: '/admin/orders', icon: ClipboardList, label: 'Orders' },
        { to: '/admin/customers', icon: Users, label: 'CRM' },
        { to: '/admin/history', icon: History, label: 'History' }
      ]
    : [
        { to: '/customer', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/customer/new-order', icon: PlusCircle, label: 'New Request' },
        { to: '/customer/history', icon: History, label: 'History' }
      ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-8 flex items-center gap-3 text-indigo-600">
        <Truck size={28} />
        <span className="font-black text-xl tracking-tighter text-slate-900">LaundryLedger</span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
            <l.icon size={20} />
            <span className="text-sm font-bold">{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
