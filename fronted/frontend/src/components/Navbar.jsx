import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Lightbulb, Send, Trophy, User, LogOut, Menu, X, ChevronDown, PlusCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { userInfo, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Ideas", path: "/ideas", icon: <Lightbulb size={18} /> },
    { name: "Submit Idea", path: "/submit-idea", icon: <Send size={18} /> },
    { name: "Winners", path: "/winners", icon: <Trophy size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-[5000] w-full bg-[#0B1220]/95 border-b border-[#D4AF37]/20 shadow-2xl backdrop-blur-xl transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">

          {/* Logo & Brand Block */}
          <Link to="/dashboard" className="flex shrink-0 items-center gap-4 group">
            <img
              src={logo}
              alt="Logo"
              className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 brightness-200"
            />
            <div className="hidden sm:block leading-none">
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">
                SIVION <span className="text-[#D4AF37]">GLOBAL</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/40 mt-1">
                Technologies Hub
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-2.5 ${isActive(item.path)
                    ? "text-[#D4AF37] bg-white/5"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.icon}
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
                )}
              </Link>
            ))}
          </div>

          {/* User Profile & Menu */}
          <div className="flex items-center gap-4">
            {userInfo && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 group shadow-lg"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Operator</p>
                    <p className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-colors">{userInfo.user?.name?.split(" ")[0]}</p>
                  </div>
                  <div className="relative">
                    <img
                      src={userInfo.user?.photoUrl || `https://ui-avatars.com/api/?background=D4AF37&color=0B1220&size=128&name=${encodeURIComponent(userInfo.user?.name)}`}
                      alt="Profile"
                      className="h-10 w-10 rounded-xl object-cover border-2 border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-[#D4AF37] rounded-lg border-2 border-[#0B1220] flex items-center justify-center text-[#0B1220]">
                      <ChevronDown size={10} className={`transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown (Premium Drawer Style) */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-4 lg:right-0 top-full mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-[#0B1220]/95 backdrop-blur-2xl border border-[#D4AF37]/20 rounded-[2rem] shadow-[0_30px_80px_rgba(11,18,32,0.6)] overflow-hidden animate-fade-up z-[9999]">
                      {/* Identity Section */}
                      <div className="p-8 border-b border-[#D4AF37]/10 bg-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
                        <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.4em] mb-2 relative z-10">Identity</p>
                        <div className="space-y-0.5 relative z-10">
                          <p className="text-base font-black text-white truncate">{userInfo.user?.name}</p>
                          <p className="text-[10px] font-bold text-white/40 truncate tracking-widest">{userInfo.user?.email}</p>
                        </div>
                      </div>

                      {/* Navigation Items */}
                      <div className="p-4 space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black tracking-[0.2em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] hover:translate-x-1 uppercase"
                        >
                          <User size={18} className="text-[#D4AF37]" /> My Profile
                        </Link>
                        
                        <Link
                          to="/my-ideas"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black tracking-[0.2em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] hover:translate-x-1 uppercase"
                        >
                          <FileText size={18} className="text-[#D4AF37]" /> My Ideas
                        </Link>

                        <Link
                          to="/submit-idea"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black tracking-[0.2em] text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] hover:translate-x-1 uppercase"
                        >
                          <PlusCircle size={18} className="text-[#D4AF37]" /> Submit Idea
                        </Link>

                        <div className="h-px bg-[#D4AF37]/10 my-4 mx-2" />

                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black tracking-[0.2em] text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 hover:translate-x-1 uppercase"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/40 transition-all active:scale-95 shadow-lg"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 md:top-24 bg-[#0B1220]/98 backdrop-blur-2xl z-[4999] animate-fade-in overflow-y-auto">
          <div className="p-8 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-5 p-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.25em] transition-all duration-300 ${isActive(item.path)
                    ? "bg-[#D4AF37] text-[#0B1220] shadow-[0_20px_50px_rgba(212,175,55,0.3)] scale-[1.02]"
                    : "text-white/60 hover:text-white bg-white/5"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}