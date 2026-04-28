import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail, Sparkles, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      const { data } = await api.post("/auth/login", formData);
      login(data.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-3 block ml-1";
  const inputClass = "w-full rounded-2xl border border-[#0B1220]/10 bg-[#F8F5EF]/70 px-6 py-5 text-base font-black text-[#0B1220] outline-none transition-all duration-500 focus:border-[#D4AF37] focus:ring-8 focus:ring-[#D4AF37]/10 focus:bg-white placeholder:text-[#1F2937]/20 shadow-sm group";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 overflow-x-hidden bg-[#F8F5EF] font-sans selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      
      {/* Left Hero Section */}
      <section className="relative overflow-hidden bg-[#0B1220] px-8 sm:px-12 lg:px-20 py-12 lg:py-0 flex flex-col justify-center min-h-[60vh] lg:min-h-screen animate-fade-in">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0B1220] to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col h-full space-y-20">
          <Link to="/" className="inline-flex items-center gap-6 group">
            <img
              src={logo}
              alt="Sivion Logo"
              className="h-16 sm:h-20 w-auto object-contain brightness-200 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="leading-none">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-white uppercase italic">
                SIVION <span className="text-[#D4AF37] not-italic">GLOBAL</span>
              </h1>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.5em] text-white/40">
                Technologies
              </p>
            </div>
          </Link>
          
          <div className="space-y-10 max-w-xl">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                <ShieldCheck size={16} /> Secure Portal
              </div>
              <h2 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                Access Your <br /> <span className="text-[#D4AF37] italic">Idea Hub.</span>
              </h2>
            </div>
            
            <p className="max-w-md text-lg sm:text-xl leading-relaxed text-white/60 font-bold italic">
              "Join the global innovation stream. Log in to manage your ideas and vote on the future."
            </p>

            <div className="flex flex-wrap gap-6 pt-10">
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Cloud Protected</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <ShieldCheck size={16} className="text-white/40" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Encrypted Session</p>
              </div>
            </div>
          </div>

          <div className="pt-20">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em]">Proprietary Enterprise Innovation Environment</p>
          </div>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 lg:py-0 bg-[#F8F5EF] animate-fade-in">
        <div className="w-full max-w-lg rounded-[3.5rem] bg-white border border-[#D4AF37]/20 shadow-[0_40px_100px_rgba(11,18,32,0.15)] p-10 sm:p-14 lg:p-20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
          
          <div className="mb-16 relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#0B1220]">Login</h2>
            <div className="mt-6 h-2 w-16 bg-[#D4AF37] rounded-full" />
          </div>

          <form className="space-y-10 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className={labelClass}>Email Address</label>
                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 group-focus-within/field:rotate-6 transition-transform duration-500">
                    <Mail size={22} />
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="name@company.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    className={inputClass + " pl-16"}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className={labelClass}>Password</label>
                  <a href="#" className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] hover:text-[#0B1220] transition-colors border-b border-[#D4AF37]/20">Forgot?</a>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 group-focus-within/field:rotate-6 transition-transform duration-500">
                    <LockKeyhole size={22} />
                  </div>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required
                    className={inputClass + " pl-16"}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/5 p-6 border-2 border-red-500/20 flex items-center gap-4 animate-fade-in">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{error}</p>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full h-20 flex items-center justify-center gap-5 rounded-full bg-[#D4AF37] text-[#0B1220] font-black uppercase tracking-[0.4em] text-[12px] shadow-[0_20px_50px_rgba(212,175,55,0.3)] transition-all duration-500 hover:bg-[#0B1220] hover:text-white hover:-translate-y-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </form>

          <p className="mt-16 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#1F2937]/30">
            No account yet?{" "}
            <Link to="/register" className="text-[#D4AF37] font-black hover:text-[#0B1220] transition-all ml-2 border-b-2 border-[#D4AF37]/30 hover:border-[#0B1220] pb-1">Create One</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
