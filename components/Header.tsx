
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Bell, LogOut, CheckCircle, Menu, X, Inbox, Check } from 'lucide-react';
import { db } from '../db';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onOpenMenu }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(db.getNotifications(user.id));
  const location = useLocation();

  useEffect(() => {
    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      setNotifs(db.getNotifications(user.id));
    }, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    db.markNotificationsRead(user.id);
    setNotifs(db.getNotifications(user.id));
  };

  const handleMarkOneRead = (e: React.MouseEvent, nid: string) => {
    e.stopPropagation();
    db.markNotificationRead(nid);
    setNotifs(db.getNotifications(user.id));
  };

  const currentPage = location.pathname.split('/').pop()?.replace('-', ' ') || 'DASHBOARD';

  return (
    <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 sticky top-0">
      <div className="flex items-center gap-4">
        <button onClick={onOpenMenu} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
          <Menu />
        </button>
        <div className="font-black text-slate-900 tracking-tighter text-xl hidden lg:block uppercase tracking-widest">
          {currentPage}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">System Sync Active</span>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={`p-2 rounded-xl transition-all relative ${showNotifs ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="px-2 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase hover:bg-indigo-700 transition-colors"
                    >
                      Clear {unreadCount}
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifs.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {notifs.map((n) => (
                        <div key={n.id} className={`p-5 hover:bg-slate-50 transition-colors flex gap-4 relative group ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${!n.read ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            <CheckCircle size={18} />
                          </div>
                          <div className="flex-1 pr-6">
                            <p className="font-bold text-sm text-slate-900 leading-tight">{n.title}</p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          {!n.read && (
                            <button 
                              onClick={(e) => handleMarkOneRead(e, n.id)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 bg-white shadow-md rounded-lg text-emerald-500 hover:bg-emerald-50 transition-all"
                              title="Mark as Read"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <Inbox className="mx-auto text-slate-100 mb-4" size={48} />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No activity alerts</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                  <button onClick={() => setShowNotifs(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Close Panel</button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

        <div className="flex items-center gap-3 pl-1">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            title="Terminate Session"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
