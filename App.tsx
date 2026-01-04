
import React, { useState, createContext, useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import { db } from './db';
import { 
  LayoutDashboard, ClipboardList, Users, PackagePlus, 
  LogOut, Bell, Menu, X, ShieldCheck, Truck, WalletCards, History
} from 'lucide-react';

import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import FinancialConsole from './pages/admin/FinancialConsole';
import AdminHistory from './pages/admin/AdminHistory';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerHistory from './pages/customer/CustomerHistory';
import NewOrder from './pages/customer/NewOrder';
import TrackingPage from './pages/TrackingPage';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth error");
  return context;
};

const Sidebar: React.FC<{ role: UserRole, close?: () => void }> = ({ role, close }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const links = role === UserRole.ADMIN 
    ? [
        { to: '/admin', icon: LayoutDashboard, label: 'Control Center' },
        { to: '/admin/orders', icon: ClipboardList, label: 'Order Pipeline' },
        { to: '/admin/customers', icon: Users, label: 'Customer Relations' },
        { to: '/admin/finances', icon: WalletCards, label: 'Financial Console' },
        { to: '/admin/history', icon: History, label: 'Service History' }
      ]
    : [
        { to: '/customer', icon: LayoutDashboard, label: 'My Dashboard' },
        { to: '/customer/new-order', icon: PackagePlus, label: 'New Request' },
        { to: '/customer/history', icon: History, label: 'My History' }
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-indigo-600 rounded-xl text-white">
          <Truck size={24} />
        </div>
        <span className="text-xl font-black text-white tracking-tighter">GenZLaundry</span>
      </div>
      <nav className="flex-1 space-y-2">
        {links.map(l => (
          <button 
            key={l.to} 
            onClick={() => { navigate(l.to); close?.(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
              isActive(l.to) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800'
            }`}
          >
            <l.icon size={20} />
            {l.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-2xl mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            <ShieldCheck size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Enterprise Secure</p>
            <p className="text-[10px] text-slate-500 uppercase font-black">Active Session</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const login = (u: User) => {
    setUser(u);
    db.setCurrentUser(u);
    navigate(u.role === UserRole.ADMIN ? '/admin' : '/customer');
  };

  const logout = () => {
    setUser(null);
    db.setCurrentUser(null);
    navigate('/login');
  };

  const isPublic = location.pathname === '/login' || location.pathname.startsWith('/track');

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen flex bg-slate-50 relative">
        {user && !isPublic && (
          <aside className="hidden lg:block w-72 sticky top-0 h-screen overflow-y-auto border-r border-slate-200">
            <Sidebar role={user.role} />
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {user && !isPublic && (
            <Header 
              user={user} 
              onLogout={logout} 
              onOpenMenu={() => setMobileMenu(true)} 
            />
          )}

          <main className={`flex-1 overflow-x-hidden ${isPublic ? '' : 'p-4 md:p-8 lg:p-12'}`}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track/:token" element={<TrackingPage />} />
              <Route path="/admin" element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/orders" element={user?.role === UserRole.ADMIN ? <OrderManagement /> : <Navigate to="/login" />} />
              <Route path="/admin/customers" element={user?.role === UserRole.ADMIN ? <CustomerManagement /> : <Navigate to="/login" />} />
              <Route path="/admin/finances" element={user?.role === UserRole.ADMIN ? <FinancialConsole /> : <Navigate to="/login" />} />
              <Route path="/admin/history" element={user?.role === UserRole.ADMIN ? <AdminHistory /> : <Navigate to="/login" />} />
              <Route path="/customer" element={user?.role === UserRole.CUSTOMER ? <CustomerDashboard /> : <Navigate to="/login" />} />
              <Route path="/customer/new-order" element={user?.role === UserRole.CUSTOMER ? <NewOrder /> : <Navigate to="/login" />} />
              <Route path="/customer/history" element={user?.role === UserRole.CUSTOMER ? <CustomerHistory /> : <Navigate to="/login" />} />
              <Route path="/" element={<Navigate to={user ? (user.role === UserRole.ADMIN ? '/admin' : '/customer') : '/login'} />} />
            </Routes>
          </main>
        </div>

        {/* Floating Logout Button */}
        {user && !isPublic && (
          <button 
            onClick={logout}
            className="fixed bottom-8 right-8 z-[100] p-5 bg-slate-900 text-white rounded-[24px] shadow-2xl hover:bg-rose-600 hover:scale-110 active:scale-95 transition-all duration-300 group no-print flex items-center gap-3 overflow-hidden max-w-[60px] hover:max-w-[200px]"
            title="Sign Out"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Sign Out</span>
          </button>
        )}

        {mobileMenu && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenu(false)}></div>
            <div className="absolute top-0 left-0 w-72 h-full animate-in slide-in-from-left duration-300">
              <div className="h-full relative">
                <button onClick={() => setMobileMenu(false)} className="absolute top-4 right-4 text-white p-2"><X /></button>
                <Sidebar role={user!.role} close={() => setMobileMenu(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
