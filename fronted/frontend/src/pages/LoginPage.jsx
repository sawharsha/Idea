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

  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2 block ml-1";
  const inputClass = "w-full rounded-lg border border-[#0B1220]/10 bg-[#F8F5EF]/70 px-5 py-4 text-sm font-bold text-[#0B1220] outline-none transition-all duration-300 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 focus:bg-white placeholder:text-[#1F2937]/20 shadow-sm group";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 overflow-x-hidden bg-[#F8F5EF] font-sans selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">

      {/* Left Hero Section */}
      <section className="relative flex min-h-screen flex-col justify-center bg-[#0B1220] px-6 sm:px-10 lg:px-14 py-8 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0B1220] to-transparent z-10" />

        <div className="relative z-20 w-full max-w-2xl space-y-6">
          <Link to="/" className="inline-flex items-center gap-4 group">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center bg-transparent border-0 shadow-none ring-0 overflow-hidden">
                <img
                  src={logo}
                  alt="Sivion Logo"
                  className="h-16 w-auto object-contain bg-transparent mix-blend-screen brightness-200 contrast-150 saturate-150 drop-shadow-[0_0_18px_rgba(255,255,255,0.45)]"
                />
              </div>

              <div className="leading-none">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  SIVION <span className="text-[#D4AF37]">GLOBAL</span>
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-white/70">
                  TECHNOLOGIES
                </p>
              </div>
            </div>
          </Link>

          <div className="space-y-5 md:space-y-6 mt-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <ShieldCheck size={14} /> Secure Portal
              </div>
              <h2 className="text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-white">
                Access Your <br /> <span className="text-[#D4AF37] italic">Idea Hub.</span>
              </h2>
            </div>

            <p className="max-w-md text-base sm:text-lg leading-relaxed text-white/60 font-medium italic">
              "Join the global innovation stream. Log in to manage your ideas and vote on the future."
            </p>

            <div className="flex flex-wrap gap-4 pt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">Cloud Protected</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
                <ShieldCheck size={14} className="text-white/40" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">Encrypted Session</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest">Proprietary Enterprise Innovation Environment</p>
          </div>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex items-center justify-center px-6 sm:px-10 lg:px-20 py-12 lg:py-0 bg-[#F8F5EF] animate-fade-in">
        <div className="w-full max-w-md rounded-2xl bg-white border border-[#D4AF37]/20 shadow-lg p-8 sm:p-10 lg:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

          <div className="mb-10 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B1220]">Login</h2>
            <div className="mt-4 h-1.5 w-12 bg-[#D4AF37] rounded-full" />
          </div>

          <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Email Address</label>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={inputClass + " pl-12"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className={labelClass}>Password</label>
                  <a href="#" className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-[#0B1220] transition-colors border-b border-[#D4AF37]/20">Forgot?</a>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <LockKeyhole size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={inputClass + " pl-12"}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/5 px-4 py-3 border border-red-500/20 flex items-center gap-3 animate-fade-in">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-3 rounded-lg bg-[#0B1220] text-white font-bold uppercase tracking-wider text-sm shadow-md transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B1220] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-wider text-[#1F2937]/30">
            No account yet?{" "}
            <Link to="/register" className="text-[#D4AF37] font-bold hover:text-[#0B1220] transition-all ml-1.5 border-b border-[#D4AF37]/30 hover:border-[#0B1220] pb-0.5">Create One</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
