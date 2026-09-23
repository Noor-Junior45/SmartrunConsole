import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Boxes, 
  LogOut, 
  ShieldCheck, 
  Database,
  Tag,
  Check,
  Sparkles,
  User,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  productCount?: number;
}

export function Navbar({ currentPath, onNavigate, productCount }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  // Derive initial & display info
  const userEmail = user?.email || 'admin@giriraj.in';
  const initial = (userEmail.charAt(0) || 'A').toUpperCase();
  const displayName = user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Administrator';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <header id="app-navbar" className="bg-[#2e4a3d] text-white border-b border-[#1a1716]/20 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <button
              id="brand-logo-btn"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-3 text-left group transition cursor-pointer"
            >
              <div className="w-9 h-9 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold tracking-tight group-hover:bg-white/15 transition-colors">
                SR
              </div>
              <div>
                <div className="font-display text-lg tracking-tight text-white flex items-center gap-2 font-bold">
                  SmartRun <span className="font-sans font-light text-xs tracking-wider uppercase text-emerald-300 bg-white/10 px-1.5 py-0.5 rounded-xs">Console</span>
                </div>
              </div>
            </button>

            {/* Quick Navigation Links - Clean and Focused */}
            <nav className="flex items-center gap-1 pl-4 border-l border-white/15 text-xs font-mono">
              <button
                id="nav-all-products"
                onClick={() => onNavigate('/')}
                className={`px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wider text-[11px] cursor-pointer ${
                  currentPath === '/' || currentPath === '/products' || currentPath.startsWith('/products/')
                    ? 'bg-white text-[#2e4a3d] font-bold shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Catalog</span>
                {productCount !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-xs text-[10px] ${
                    currentPath === '/' || currentPath === '/products' || currentPath.startsWith('/products/')
                      ? 'bg-[#2e4a3d]/15 text-[#2e4a3d]'
                      : 'bg-white/15 text-white'
                  }`}>
                    {productCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Profile Avatar & Gmail-style Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            {/* Profile Avatar Trigger */}
            <button
              id="navbar-profile-avatar-btn"
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all cursor-pointer select-none shadow-xs ${
                isProfileOpen
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2e4a3d] bg-amber-500 text-white'
                  : 'bg-amber-600/90 hover:bg-amber-500 text-white hover:ring-2 hover:ring-white/50'
              }`}
              title={`Google Account: ${userEmail}`}
            >
              {initial}
            </button>

            {/* Gmail-Style Dropdown Menu Box */}
            {isProfileOpen && (
              <div 
                id="profile-dropdown-box"
                className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Header: User Email Banner (Gmail Style) */}
                <div className="px-6 pt-5 pb-3 text-center border-b border-slate-100 bg-[#f8fafd]">
                  <p className="font-mono text-xs font-semibold text-slate-600 truncate" title={userEmail}>
                    {userEmail}
                  </p>
                </div>

                {/* Profile Center Card */}
                <div className="px-6 py-5 text-center flex flex-col items-center">
                  {/* Large Gmail-Style Avatar */}
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center font-display text-3xl font-bold shadow-md ring-4 ring-amber-50">
                      {initial}
                    </div>
                    <span 
                      className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"
                      title="Active Session"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                  </div>

                  {/* Greeting & Name */}
                  <h3 className="font-display font-semibold text-lg text-slate-900 tracking-tight capitalize">
                    Hi, {displayName}!
                  </h3>

                  {/* Admin Badge */}
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-mono font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Administrator • Full Access</span>
                  </div>

                  {/* Copy Email Pill Button */}
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="mt-3 px-4 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Email Copied!</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Email Address</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Details & Supabase Session Info */}
                <div className="px-6 py-3 bg-[#f8fafd] border-t border-b border-slate-100 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Database className="w-3 h-3 text-[#2e4a3d]" />
                      Project:
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px]">iffdkhzctkbglmvaayeh</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-500 text-[11px]">Security:</span>
                    <span className="text-emerald-700 font-semibold text-[11px]">Row-Level (RLS) Active</span>
                  </div>
                </div>

                {/* Sign Out Action Area (Gmail Pill Design) */}
                <div className="p-5 flex flex-col items-center gap-3">
                  <button
                    id="btn-profile-signout"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      signOut();
                    }}
                    className="w-full py-2.5 px-5 rounded-full border border-slate-300 hover:border-rose-300 hover:bg-rose-50/70 active:bg-rose-100 text-slate-700 hover:text-rose-700 font-mono text-xs uppercase tracking-wider font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                    <span>Sign out</span>
                  </button>

                  <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                    <span>Privacy Policy</span>
                    <span>&bull;</span>
                    <span>Terms of Service</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
