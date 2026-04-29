import { useEffect, useState } from "react";
import { Camera, Save, User, Mail, Building2, Lock, Sparkles, LogOut, ShieldCheck } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const { userInfo, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", department: "", password: "" });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.user) {
      setForm({
        name: userInfo.user.name || "",
        email: userInfo.user.email || "",
        department: userInfo.user.department || "",
        password: "",
      });
      setPreview(userInfo.user.photoUrl || "");
    }
  }, [userInfo]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("department", form.department);
      if (form.password) payload.append("password", form.password);
      if (photo) payload.append("photo", photo);
      const { data } = await api.put("/auth/profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser(data.data);
      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete your account? This action is permanent and will erase all your ideas.");
    if (!ok) return;
    try {
      await api.delete("/auth/profile");
      logout();
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Unable to delete account.");
    }
  };

  const inputWrap = "flex items-center gap-3 rounded-2xl border border-[#0B1220]/10 bg-[#F8F5EF]/70 px-4 h-12 md:h-[52px] transition-all duration-300 focus-within:border-[#D4AF37] focus-within:ring-4 focus-within:ring-[#D4AF37]/10 focus-within:bg-white shadow-sm group";
  const inputField = "w-full bg-transparent text-sm md:text-base font-bold text-[#0B1220] outline-none placeholder:text-[#1F2937]/20";
  const labelClass = "text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] font-sans tracking-tight text-[#1F2937] overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8 animate-fade-in">
        
        {/* Profile Card Section */}
        <section className="bg-white rounded-2xl md:rounded-3xl border border-[#0B1220]/10 shadow-lg overflow-hidden animate-fade-up">
          <div className="bg-[#0B1220] px-6 md:px-10 py-8 relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)]" />
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative group/avatar">
                  <div className="absolute -inset-4 bg-[#D4AF37]/10 blur-2xl rounded-full" />
                  <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-xl overflow-hidden border border-white shadow-lg bg-[#111827] flex items-center justify-center p-0.5 group-hover/avatar:scale-105 transition-transform duration-500">
                    <img
                      src={preview || `https://ui-avatars.com/api/?background=FFFFFF&color=0B1220&size=256&name=${encodeURIComponent(form.name || "User")}`}
                      alt="Avatar"
                      className="h-full w-full rounded-lg object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                    />
                  </div>
                  <label className="absolute -bottom-1 -right-1 h-10 w-10 bg-[#D4AF37] text-[#0B1220] rounded-lg flex items-center justify-center cursor-pointer shadow-md hover:bg-white transition-all duration-300 border-2 border-[#0B1220] group-hover/avatar:scale-110">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <div className="text-center md:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                    <Sparkles size={12} /> Personal Idea Hub
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">Account <span className="text-[#D4AF37] italic">Settings.</span></h1>
                  <p className="text-white/40 text-xs md:text-sm font-medium mt-1">Manage your profile and account preferences</p>
                </div>
             </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    { label: "Full Name", name: "name", type: "text", icon: <User size={16} className="text-[#D4AF37]" />, ph: "Your name" },
                    { label: "Email Address", name: "email", type: "email", icon: <Mail size={16} className="text-[#D4AF37]" />, ph: "Your email" },
                    { label: "Department", name: "department", type: "text", icon: <Building2 size={16} className="text-[#D4AF37]" />, ph: "Your department" },
                    { label: "Password", name: "password", type: "password", icon: <Lock size={16} className="text-[#D4AF37]" />, ph: "Update password" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-3">
                      <label className={labelClass}>{f.label}</label>
                      <div className={inputWrap}>
                        <div className="shrink-0 group-focus-within:scale-110 transition-transform duration-300">{f.icon}</div>
                        <input
                          name={f.name}
                          type={f.type}
                          value={form[f.name]}
                          onChange={handleChange}
                          placeholder={f.ph}
                          className={inputField}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div className="bg-[#F8F5EF] rounded-xl p-6 border border-[#D4AF37]/10 space-y-4 shadow-inner relative overflow-hidden group/summary">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#0B1220] flex items-center gap-2">
                     <ShieldCheck size={14} className="text-[#D4AF37]" /> Account Status
                   </h4>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold border-b border-[#0B1220]/5 pb-2">
                        <span className="text-[#1F2937]/40 uppercase tracking-widest text-[8px]">Status</span>
                        <span className="text-[#0B1220] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 bg-[#D4AF37] rounded-full animate-pulse" /> Active Member
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#1F2937]/40 uppercase tracking-widest text-[8px]">Last Update</span>
                        <span className="text-[#0B1220] font-bold uppercase tracking-wider text-[10px]">Today</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full px-5 py-3 md:py-4 flex items-center justify-center gap-2 rounded-full bg-[#0B1220] text-white font-bold uppercase tracking-wider text-sm shadow-md hover:bg-[#D4AF37] hover:text-[#0B1220] transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  
                  <button
                    onClick={() => logout()}
                    className="w-full py-2.5 text-[10px] font-bold uppercase tracking-wider text-red-500/50 hover:text-red-600 transition-all duration-300 group/delete flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} className="transition-transform group-hover:scale-110" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Termination Section */}
        <section className="bg-red-500/5 rounded-2xl md:rounded-3xl border border-red-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-up">
          <div className="space-y-0.5 text-center md:text-left">
            <h3 className="text-red-600 font-bold text-lg tracking-tight">Delete Account</h3>
            <p className="text-red-500/40 text-xs font-medium italic">Permanently remove your account and all associated data</p>
          </div>
          <button
            onClick={handleDelete}
            className="px-5 py-3 rounded-full border border-red-500/20 text-red-500 text-sm font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
          >
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
}
