import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, LockKeyhole, Mail, User2, Camera, Sparkles, ShieldCheck, Trophy, Lightbulb, CheckCircle, RefreshCw } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const logo = "/assests/logo.png";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", department: "", password: "" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePhotoChange = (e) => { const f = e.target.files[0]; setPhoto(f); if (f) setPreview(URL.createObjectURL(f)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("department", formData.department);
      payload.append("password", formData.password);
      if (photo) payload.append("photo", photo);

      const { data } = await api.post("/auth/register", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      login(data.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2 block ml-1";
  const inputClass = "w-full h-12 rounded-xl premium-input px-4 text-sm font-medium placeholder:text-[#6B7280]/60 shadow-sm group";

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 overflow-x-hidden bg-[#F8F5EF] font-sans selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">

      {/* Left Hero Section */}
      {/* Left Hero Section */}
      <section className="relative flex min-h-screen flex-col justify-between bg-[#0B1F3A] px-6 md:px-12 xl:px-20 py-10 md:py-16 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0B1220] to-transparent z-10" />

        {/* Top: Logo */}
        <div className="relative z-20 w-full max-w-2xl">
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  SIVION <span className="text-[#D4AF37]">GLOBAL</span>
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-white/70">
                  TECHNOLOGIES
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Middle: Content */}
        <div className="relative z-20 w-full max-w-2xl my-auto py-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
              <Sparkles size={14} /> New Member
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-white">
              Join the <br /> <span className="text-[#D4AF37] italic">Idea Network.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm md:text-base leading-relaxed text-white/60 font-medium italic mt-6">
            "Join the global innovation community. Register today to share your ideas and shape the future."
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-3 text-sm text-white/80 font-medium flex items-center gap-3">
              <Lightbulb size={16} className="text-[#D4AF37] shrink-0" />
              <span>Share ideas</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-3 text-sm text-white/80 font-medium flex items-center gap-3">
              <CheckCircle size={16} className="text-[#D4AF37] shrink-0" />
              <span>Vote weekly</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-3 text-sm text-white/80 font-medium flex items-center gap-3">
              <Trophy size={16} className="text-[#D4AF37] shrink-0" />
              <span>Win recognition</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-4 py-3 text-sm text-white/80 font-medium flex items-center gap-3">
              <RefreshCw size={16} className="text-[#D4AF37] shrink-0" />
              <span>One idea per cycle</span>
            </div>
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-20 w-full max-w-2xl">
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em]">SIVION GLOBAL TECHNOLOGIES &bull; IDEA HUB</p>
        </div>
      </section>

      {/* Right Form Section */}
      <section className="flex items-center justify-center px-6 md:px-12 xl:px-20 py-10 md:py-16 bg-[#F8F5EF] animate-fade-in">
        <div className="w-full max-w-2xl premium-card p-8 sm:p-10 lg:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />

          <div className="mb-10 relative z-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#0B1220]">Registration</h2>
            <div className="mt-4 h-1.5 w-12 bg-[#D4AF37] rounded-full" />
          </div>

          <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Full Name</label>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <User2 size={18} />
                  </div>
                  <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required className={inputClass + " pl-12"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Work Email</label>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <Mail size={18} />
                  </div>
                  <input type="email" name="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required className={inputClass + " pl-12"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Department</label>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <Building2 size={18} />
                  </div>
                  <input type="text" name="department" placeholder="Engineering" value={formData.department} onChange={handleChange} className={inputClass + " pl-12"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Password</label>
                <div className="relative group/field">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] group-focus-within/field:scale-110 transition-transform duration-300">
                    <LockKeyhole size={18} />
                  </div>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={inputClass + " pl-12"} />
                </div>
              </div>
            </div>

            <div className="relative rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#F8F5EF]/50 p-6 flex flex-col items-center justify-center group hover:border-[#D4AF37]/50 hover:bg-white transition-all duration-300 cursor-pointer shadow-inner">
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {!preview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center text-[#D4AF37] shadow-md border border-[#D4AF37]/10 transition-transform duration-300 group-hover:scale-110"><Camera size={24} /></div>
                  <div className="text-center space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#0B1220]">Profile Photo</p>
                    <p className="text-[8px] font-medium text-[#1F2937]/30 uppercase tracking-widest italic">Optional</p>
                  </div>
                </div>
              ) : (
                <div className="relative group/preview">
                  <div className="absolute -inset-4 bg-[#D4AF37]/20 blur-2xl rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity" />
                  <img src={preview} alt="Preview" className="h-24 w-24 rounded-xl object-cover border-2 border-white shadow-lg relative z-10 transition-transform duration-300 group-hover/preview:scale-105" />
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-[#D4AF37] text-[#0B1220] rounded-lg flex items-center justify-center shadow-md border-2 border-white z-20"><Camera size={14} /></div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/5 px-4 py-3 border border-red-500/20 flex items-center gap-3 animate-fade-in">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-full bg-[#D4AF37] text-[#0B1220] font-semibold tracking-wide text-sm shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 ease-out hover:bg-[#0B1F3A] hover:text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? "Registering..." : "Create Account"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-wider text-[#1F2937]/30">
            Already have an account?{" "}
            <Link to="/login" className="text-[#D4AF37] font-bold hover:text-[#0B1220] transition-all ml-1.5 border-b border-[#D4AF37]/30 hover:border-[#0B1220] pb-0.5">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
