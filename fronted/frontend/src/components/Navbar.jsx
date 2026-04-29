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
    <nav className="sticky top-0 z-[5000] w-full bg-[#0B1220]/95 border-b border-[#D4AF37]/20 shadow-lg backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-[72px]">

          {/* Logo & Brand Block */}
          <Link to="/dashboard" className="flex shrink-0 items-center gap-3 group">
            <div className="flex items-center justify-center overflow-hidden bg-transparent border-0 shadow-none ring-0">
              <img
                src={logo}
                alt="Sivion Logo"
                className="h-9 md:h-11 w-auto object-contain bg-transparent mix-blend-screen brightness-200 contrast-150 saturate-150 drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
              />
            </div>

            <div className="hidden sm:block leading-none">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                SIVION <span className="text-[#D4AF37]">GLOBAL</span>
              </h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">
                TECHNOLOGIES
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${isActive(item.path)
                  ? "text-[#D4AF37] bg-white/5"
                  : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                {item.icon}
                {item.name}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
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
                  className="flex items-center gap-2 px-2 h-10 md:h-11 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 group shadow-md"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Member</p>
                    <p className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{userInfo.user?.name?.split(" ")[0]}</p>
                  </div>
                  <div className="relative">
                    <img
                      src={userInfo.user?.photoUrl || `https://ui-avatars.com/api/?background=D4AF37&color=0B1220&size=128&name=${encodeURIComponent(userInfo.user?.name)}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-lg object-cover border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#D4AF37] rounded-md border border-[#0B1220] flex items-center justify-center text-[#0B1220]">
                      <ChevronDown size={8} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown (Premium Drawer Style) */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-4 lg:right-0 top-full mt-2 w-64 bg-[#0B1220]/95 backdrop-blur-xl border border-[#D4AF37]/20 rounded-xl shadow-xl overflow-hidden animate-fade-up z-[9999]">
                      {/* Identity Section */}
                      <div className="p-5 border-b border-[#D4AF37]/10 bg-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />
                        <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1 relative z-10">Identity</p>
                        <div className="space-y-0.5 relative z-10">
                          <p className="text-sm font-bold text-white truncate">{userInfo.user?.name}</p>
                          <p className="text-[9px] font-medium text-white/40 truncate tracking-wide">{userInfo.user?.email}</p>
                        </div>
                      </div>

                      {/* Navigation Items */}
                      <div className="p-2 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold tracking-wide text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] uppercase"
                        >
                          <User size={16} className="text-[#D4AF37]" /> My Profile
                        </Link>

                        <Link
                          to="/my-ideas"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold tracking-wide text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] uppercase"
                        >
                          <FileText size={16} className="text-[#D4AF37]" /> My Ideas
                        </Link>

                        <Link
                          to="/submit-idea"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold tracking-wide text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-[#D4AF37] uppercase"
                        >
                          <PlusCircle size={16} className="text-[#D4AF37]" /> Submit Idea
                        </Link>

                        <div className="h-px bg-[#D4AF37]/10 my-2 mx-1" />

                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-xs font-semibold tracking-wide text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300 uppercase"
                        >
                          <LogOut size={16} /> Logout
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