import { useEffect, useState } from "react";
import { Camera, Save, X, User, Mail, Building2, Lock } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AccountDrawer({ open, onClose }) {
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

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
      alert("Profile updated successfully");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete your account? This action is permanent.");
    if (!ok) return;
    try {
      await api.delete("/auth/profile");
      logout();
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Unable to delete account");
    }
  };

  const inputWrap = "flex items-center gap-3 rounded-2xl border border-[#C9A227]/10 bg-white px-5 py-4 transition-all duration-500 focus-within:border-[#C9A227] focus-within:ring-4 focus-within:ring-[#C9A227]/5";
  const inputField = "w-full bg-transparent text-sm font-bold text-[#0F3D2E] outline-none placeholder:text-[#222222]/20";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-[#222222]/40 ml-1";

  return (
    <div
      className={`fixed inset-0 z-[2000] bg-[#0F3D2E]/40 backdrop-blur-md transition-all duration-700 ease-in-out ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`ml-auto h-full w-full max-w-[560px] bg-[#F8F5EF] shadow-strong transition-all duration-700 ease-out border-l border-[#C9A227]/10 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-10 bg-[#0F3D2E] text-white overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(201,162,39,0.15),transparent_40%)] pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold tracking-tight">Account <span className="text-[#C9A227]">Settings</span></h3>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white active:scale-90"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="relative h-32 w-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl flex items-center justify-center bg-white p-1">
                <img
                  src={preview || `https://ui-avatars.com/api/?background=FAF7F0&color=C9A227&size=256&name=${encodeURIComponent(form.name || "User")}`}
                  alt="Avatar"
                  className="h-full w-full rounded-[2rem] object-cover"
                />
              </div>
              <label className="absolute -bottom-2 -right-2 h-12 w-12 bg-[#C9A227] text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl hover:bg-[#0F3D2E] transition-all duration-500 active:scale-95 border-4 border-[#F8F5EF]">
                <Camera size={20} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
            <div className="mt-8 text-center">
              <h4 className="text-xl font-bold text-[#0F3D2E] truncate px-6 leading-tight">{form.name || "User"}</h4>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {[
              { label: "Name", name: "name", type: "text", icon: <User size={20} className="text-[#C9A227]" />, ph: "Full name" },
              { label: "Email", name: "email", type: "email", icon: <Mail size={20} className="text-[#C9A227]" />, ph: "Email address" },
              { label: "Department", name: "department", type: "text", icon: <Building2 size={20} className="text-[#C9A227]" />, ph: "Team/Dept" },
              { label: "Password", name: "password", type: "password", icon: <Lock size={20} className="text-[#C9A227]" />, ph: "New password (optional)" },
            ].map((f) => (
              <div key={f.name} className="space-y-3">
                <label className={labelClass}>{f.label}</label>
                <div className={inputWrap}>
                  <div className="flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
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

          {/* Footer Area inside Body for "Do not push to bottom" */}
          <div className="space-y-5 pt-10">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-4 rounded-full bg-[#C9A227] text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#C9A227]/20 hover:bg-[#0F3D2E] hover:shadow-2xl hover:shadow-[#0F3D2E]/20 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            
            <button
              onClick={handleDelete}
              className="w-full py-3 text-[10px] font-black uppercase tracking-[0.25em] text-red-500/40 hover:text-red-600 transition-all duration-300"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
