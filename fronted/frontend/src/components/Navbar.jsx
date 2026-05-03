import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Lightbulb, Send, Trophy, User, LogOut, Menu, X, ChevronDown, PlusCircle, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const logo = "/assests/logo.png";

export default function Navbar() {
  const { userInfo, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const drawerRef = useRef(null);
  const profileButtonRef = useRef(null);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Ideas", path: "/ideas", icon: <Lightbulb size={18} /> },
    { name: "Submit Idea", path: "/submit-idea", icon: <Send size={18} /> },
    { name: "Winners", path: "/winners", icon: <Trophy size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0B1F3A]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20 transition-all duration-300 ease-out">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

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
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`group/nav relative flex items-center gap-2 px-1 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-out ${isActive(item.path)
                  ? "text-white"
                  : "text-white/90 hover:text-white"
                  }`}
              >
                {item.icon}
                {item.name}
                <span className={`absolute bottom-1 left-2 right-2 border-b-2 border-[#D4AF37] origin-left rounded-full transition-transform duration-300 ease-out ${isActive(item.path) ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"}`} />
              </Link>
            ))}
          </div>

          {/* User Profile & Menu */}
          <div className="flex items-center gap-4">
            {userInfo && (
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 h-11 md:h-12 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-all duration-300 ease-out group shadow-lg shadow-black/20"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Member</p>
                    <p className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">{userInfo.user?.name?.split(" ")[0]}</p>
                  </div>
                  <div className="relative">
                    <img
                      src={userInfo.user?.photoUrl || `https://ui-avatars.com/api/?background=D4AF37&color=0B1220&size=128&name=${encodeURIComponent(userInfo.user?.name)}`}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover border border-[#D4AF37]/20 group-hover:border-[#D4AF37] transition-all shadow-sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#D4AF37] rounded-md border border-[#0B1220] flex items-center justify-center text-[#0B1220] shadow-[0_0_10px_rgba(212,175,55,0.45)]">
                      <ChevronDown size={8} className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {/* Profile Dropdown (Premium Drawer Style) */}
                <div
                  ref={drawerRef}
                  className={`absolute right-0 top-full mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-3xl bg-[#0B1F3A]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-[#0B1F3A]/35 overflow-hidden z-[9999] transition-all duration-300 ease-out ${
                    dropdownOpen
                      ? "pointer-events-auto opacity-100 translate-y-0 scale-100"
                      : "pointer-events-none opacity-0 -translate-y-2 scale-95"
                  }`}
                >
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
        <div className="lg:hidden fixed inset-0 top-20 bg-[#0B1F3A]/98 backdrop-blur-2xl z-40 animate-fade-in overflow-y-auto">
          <div className="mx-auto max-w-2xl p-5 sm:p-8 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-4 p-5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 ease-out ${isActive(item.path)
                  ? "bg-[#D4AF37] text-[#0B1220] shadow-[0_20px_50px_rgba(212,175,55,0.3)]"
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
