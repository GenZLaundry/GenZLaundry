
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../db';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Mail, Key, User as UserIcon, MapPin, 
  ArrowRight, ShieldCheck, ChevronLeft, 
  Smartphone, Lock, CheckCircle2, Loader2, ShieldAlert,
  Info, X as CloseIcon, Search, Eye
} from 'lucide-react';

enum AuthMode { LOGIN = 'LOGIN', SIGNUP = 'SIGNUP', TRACK = 'TRACK' }

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  
  // Login State
  const [loginContact, setLoginContact] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup State
  const [signupStep, setSignupStep] = useState(1); 
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [password, setPassword] = useState('');
  
  // Public Tracking State
  const [trackToken, setTrackToken] = useState('');
  const [trackError, setTrackError] = useState('');
  
  // Demo Alert State
  const [demoToast, setDemoToast] = useState<{show: boolean, code: string}>({ show: false, code: '' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (role === UserRole.ADMIN) {
        if (loginContact === 'admin@GenZLaundry.com' && loginPassword === 'admin') {
          login({ id: 'admin-1', fullName: 'System Admin', email: 'admin@GenZLaundry.com', role: UserRole.ADMIN, address: 'HQ' });
        } else setError('Invalid administrative credentials.');
      } else {
        const u = db.findUserByContact(loginContact);
        if (u && u.password === loginPassword) login(u);
        else if (!u) setError('Account not found. Select "Join Us" above.');
        else setError('Access Denied. Incorrect password.');
      }
      setLoading(false);
    }, 800);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address || !phone) { setError('Complete all profile fields first.'); return; }
    if (db.findUserByContact(phone)) { setError('Phone number already associated with an account.'); return; }

    setLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setDemoToast({ show: true, code });
      db.addNotification('public', 'Auth Protocol', `Your registration code is: ${code}`);
      setSignupStep(2);
      setLoading(false);
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('') === generatedOtp) {
      setIsPhoneVerified(true);
      setSignupStep(3);
      setDemoToast({ show: false, code: '' });
      setError('');
    } else {
      setError('Mismatched security code.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleFinalizeRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      fullName, phone, password, address,
      role: UserRole.CUSTOMER, createdAt: new Date().toISOString()
    };
    db.saveUser(newUser);
    login(newUser);
  };

  const handlePublicTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    if (!trackToken) return;
    const orders = db.getOrders();
    const found = orders.find(o => o.tokenNumber.toLowerCase() === trackToken.toLowerCase() || o.id === trackToken);
    if (found) {
      navigate(`/track/${found.tokenNumber}`);
    } else {
      setTrackError('Order token not found. Please verify and retry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* SIMULATED SMS TOAST */}
      {demoToast.show && (mode === AuthMode.SIGNUP) && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-in slide-in-from-top duration-500">
          <div className="bg-indigo-600 text-white p-6 rounded-[32px] shadow-2xl border border-white/20 backdrop-blur-xl flex items-center gap-5">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <Smartphone className="animate-bounce" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Simulated Message</p>
              <p className="text-sm font-bold leading-tight">Your GenZLaundry code is: <span className="text-xl font-black tracking-widest bg-white/20 px-2 py-0.5 rounded-lg ml-1">{demoToast.code}</span></p>
            </div>
            <button onClick={() => setDemoToast({ ...demoToast, show: false })} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <CloseIcon size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-[1200px] grid md:grid-cols-2 rounded-[50px] overflow-hidden shadow-2xl relative min-h-[750px] border border-slate-200/50 z-10">
        
        {/* ACTION PANEL */}
        <div className="p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Truck size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">GenZLaundry</span>
          </div>

          <div className="mb-10 flex p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button 
              onClick={() => { setMode(AuthMode.LOGIN); setError(''); setSignupStep(1); setDemoToast({show:false, code:''}); }}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === AuthMode.LOGIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode(AuthMode.SIGNUP); setError(''); }}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === AuthMode.SIGNUP ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Join Us
            </button>
            <button 
              onClick={() => { setMode(AuthMode.TRACK); setError(''); setTrackError(''); }}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === AuthMode.TRACK ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Track Order
            </button>
          </div>

          <div className="relative">
            {mode === AuthMode.LOGIN && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Welcome Back</h1>
                <p className="text-slate-400 font-medium mb-10">Secure access to your laundry pipeline.</p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setRole(UserRole.CUSTOMER)} className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${role === UserRole.CUSTOMER ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-400 border-slate-200'}`}>Customer</button>
                    <button type="button" onClick={() => setRole(UserRole.ADMIN)} className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${role === UserRole.ADMIN ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-400 border-slate-200'}`}>Admin</button>
                  </div>
                  <div className="space-y-3">
                    <Input icon={Mail} placeholder="Email or Phone" value={loginContact} onChange={setLoginContact} />
                    <Input icon={Lock} placeholder="Password" type="password" value={loginPassword} onChange={setLoginPassword} />
                  </div>
                  {error && <Alert message={error} />}
                  <button disabled={loading} className="w-full bg-slate-900 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-indigo-600 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Authorize Session'}
                  </button>
                </form>
              </div>
            )}

            {mode === AuthMode.SIGNUP && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">New Account</h1>
                <p className="text-slate-400 font-medium mb-8">Establish your verified fabric care profile.</p>
                
                <div className="space-y-4">
                  {/* Step 1: Data Entry */}
                  <div className="space-y-3">
                    <Input icon={UserIcon} placeholder="Full Legal Name" value={fullName} onChange={setFullName} disabled={signupStep > 1} />
                    <Input icon={MapPin} placeholder="Primary Address" value={address} onChange={setAddress} disabled={signupStep > 1} />
                    <div className="relative">
                      <Input icon={Smartphone} placeholder="Phone Number" value={phone} onChange={setPhone} disabled={signupStep > 1} />
                      {isPhoneVerified && <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />}
                    </div>
                  </div>

                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] font-medium text-amber-700 leading-relaxed uppercase tracking-widest">Note: In this demo, the code will appear at the top of the screen after clicking below.</p>
                      </div>
                      <button onClick={handleRequestOtp} disabled={loading} className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Verify Identity'}
                      </button>
                    </div>
                  )}

                  {/* Step 2: OTP Entry */}
                  {signupStep === 2 && (
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4">
                      <div className="flex justify-between items-center mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Insert 6-Digit Code</p>
                        <button type="button" onClick={() => { setSignupStep(1); setDemoToast({show:false, code:''}); }} className="text-[9px] font-black text-indigo-600 uppercase">Edit Info</button>
                      </div>
                      <div className="flex justify-between gap-2 mb-6">
                        {otp.map((digit, i) => (
                          <input 
                            key={i} 
                            ref={el => { otpRefs.current[i] = el; }} 
                            type="text" 
                            maxLength={1} 
                            className="w-full h-12 text-center text-lg font-black bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-all" 
                            value={digit} 
                            onChange={e => {
                              const val = e.target.value;
                              if (val.length > 1) return;
                              const n = [...otp]; n[i] = val; setOtp(n);
                              if (val && i < 5) otpRefs.current[i+1]?.focus();
                            }} 
                            onKeyDown={e => {
                              if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i-1]?.focus();
                            }}
                          />
                        ))}
                      </div>
                      <button onClick={handleVerifyOtp} className="w-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl shadow-lg active:scale-95">Confirm Code</button>
                    </div>
                  )}

                  {/* Step 3: Password Completion */}
                  {signupStep === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-top-4">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center gap-3">
                         <CheckCircle2 size={18} />
                         <span className="text-[10px] font-black uppercase tracking-widest">Phone Verified</span>
                      </div>
                      <Input icon={Lock} type="password" placeholder="Create Access Password" value={password} onChange={setPassword} />
                      <button onClick={handleFinalizeRegistration} className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-widest py-5 rounded-2xl shadow-xl active:scale-95 transition-all">Initialize Account</button>
                    </div>
                  )}
                </div>
                {error && <div className="mt-4"><Alert message={error} /></div>}
              </div>
            )}

            {mode === AuthMode.TRACK && (
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Track Order</h1>
                <p className="text-slate-400 font-medium mb-10">Real-time status check without login.</p>
                <form onSubmit={handlePublicTrack} className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      required 
                      placeholder="Enter Token (e.g. GenZ-1234)" 
                      className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border-none outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all uppercase" 
                      value={trackToken} 
                      onChange={e => setTrackToken(e.target.value)} 
                    />
                  </div>
                  {trackError && <Alert message={trackError} />}
                  <button type="submit" className="w-full bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                    Search Registry <Eye size={18} />
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Authorized public access via secure token
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* INFO PANEL */}
        <div className="hidden md:flex bg-slate-900 p-16 text-white relative flex-col justify-between">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-400 rounded-full blur-[100px]"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-black tracking-tighter leading-tight mb-8">Care. Scale.<br/>Simplicity.</h2>
            <div className="space-y-8 max-w-sm">
              <Feature icon={Smartphone} title="Live Tracking" desc="Every stage of your garment's care is logged in real-time." />
              <Feature icon={ShieldCheck} title="Verified Profiles" desc="MFA-protected accounts ensure zero service friction." />
            </div>
          </div>

          <div className="relative z-10 p-8 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <p className="font-black text-lg tracking-tighter">Secure Ledger v4.2</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed font-medium">All sessions are encrypted. Data integrity is maintained across the entire network.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ icon: Icon, value, onChange, placeholder, type = 'text', disabled = false }: any) => (
  <div className="relative">
    <Icon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
    <input 
      disabled={disabled}
      type={type} 
      placeholder={placeholder} 
      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const Alert = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
    <ShieldAlert size={16} />
    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{message}</span>
  </div>
);

const Feature = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-4">
    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
      <Icon size={24} className="text-indigo-400" />
    </div>
    <div>
      <h4 className="font-black text-xs uppercase tracking-[0.2em] text-white mb-1">{title}</h4>
      <p className="text-slate-400 text-sm leading-snug font-medium">{desc}</p>
    </div>
  </div>
);

export default LoginPage;
