import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Upload, CheckCircle2, AlertCircle, Sparkles, ChevronLeft, FileText, Lightbulb, User, Calendar } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ideasHero from "../assets/ideas-hero.png";
import { useAuth } from "../context/AuthContext";

const buildCycles = (date = new Date()) => {
  const cycles = [];
  let start = new Date("2026-04-20T00:00:00");
  const end = new Date(date);

  while (start <= end) {
    const submissionClose = new Date(start);
    submissionClose.setDate(start.getDate() + 11);
    submissionClose.setHours(12, 0, 0, 0);

    const votingStart = new Date(submissionClose);

    const votingEnd = new Date(submissionClose);
    votingEnd.setDate(submissionClose.getDate() + 2);
    votingEnd.setHours(23, 59, 59, 999);

    const winnerAnnounceDate = new Date(submissionClose);
    winnerAnnounceDate.setDate(submissionClose.getDate() + 3);
    winnerAnnounceDate.setHours(9, 0, 0, 0);

    const label = `${start.toLocaleString("default", { month: "long" })} ${start.getFullYear()} Cycle ${cycles.length % 2 === 0 ? "2" : "1"}`;

    cycles.push({
      label,
      submissionStart: new Date(start),
      submissionClose,
      votingStart,
      votingEnd,
      winnerAnnounceDate,
    });

    start = new Date(winnerAnnounceDate);
    start.setHours(0, 0, 0, 0);
  }

  return cycles;
};

export default function SubmitIdeaPage() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const currentUser = userInfo?.user;

  const [form, setForm] = useState({ title: "", description: "", category: "Software" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [existingIdeas, setExistingIdeas] = useState([]);

  useEffect(() => {
    fetchMyIdeas();
  }, []);

  const fetchMyIdeas = async () => {
    try {
      const { data } = await api.get("/ideas", { params: { mine: true } });
      setExistingIdeas(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const currentCycle = useMemo(() => {
    const now = new Date();
    return buildCycles(now).find(
      (cycle) => now >= new Date(cycle.submissionStart) && now <= new Date(cycle.votingEnd)
    );
  }, []);

  const isSubmissionOpen = useMemo(() => {
    if (!currentCycle) return false;
    return new Date() <= new Date(currentCycle.submissionClose);
  }, [currentCycle]);

  const hasSubmittedInCurrentCycle = useMemo(() => {
    if (!currentCycle || !existingIdeas.length) return false;
    return existingIdeas.some((idea) => {
      const ideaDate = new Date(idea.createdAt || idea.submittedAt);
      const start = new Date(currentCycle.submissionStart);
      const end = new Date(currentCycle.votingEnd);
      const currentUserId = currentUser?.id || currentUser?._id;
      const ownerId = idea.user?._id || idea.userId || idea.createdBy?._id || idea.createdBy;
      return (
        ideaDate >= start &&
        ideaDate <= end &&
        ownerId?.toString() === currentUserId?.toString()
      );
    });
  }, [currentCycle, existingIdeas, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSubmissionOpen) return alert("Submissions are closed for the current cycle.");
    if (hasSubmittedInCurrentCycle) return;

    setLoading(true);
    setError("");
    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("category", form.category);
      if (file) payload.append("file", file);

      await api.post("/ideas", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
      setTimeout(() => navigate("/my-ideas"), 2000);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Error submitting idea";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5EF] p-6 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-[3rem] border border-[#D4AF37]/20 p-12 text-center shadow-[0_40px_100px_rgba(11,18,32,0.15)] space-y-8 animate-scale-in">
          <div className="relative inline-block">
            <div className="absolute -inset-6 bg-[#D4AF37]/10 blur-3xl rounded-full animate-pulse" />
            <div className="relative h-28 w-28 bg-[#D4AF37] text-[#0B1220] rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto border-4 border-white">
              <CheckCircle2 size={56} />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter text-[#0B1220]">Idea Submitted.</h2>
            <p className="text-[#1F2937]/50 font-bold leading-relaxed text-lg italic">"Your idea has been successfully shared. Redirecting to your ideas page..."</p>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-16 px-8 bg-[#F8F5EF]/70 border border-[#0B1220]/10 rounded-2xl outline-none text-sm font-black text-[#0B1220] placeholder:text-[#1F2937]/20 focus:border-[#D4AF37] focus:ring-8 focus:ring-[#D4AF37]/10 focus:bg-white transition-all duration-500 shadow-sm";
  const labelClass = "text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37] ml-2 block mb-3";

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] font-sans tracking-tight text-[#1F2937] overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-16 animate-fade-in">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 rounded-[3rem] bg-[#0B1220] border border-[#D4AF37]/20 shadow-[0_40px_100px_rgba(11,18,32,0.4)] p-8 md:p-14 overflow-hidden relative group animate-fade-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">
                <Sparkles size={16} /> Idea Portal
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.9] italic">Share Your <span className="text-[#D4AF37] not-italic">Idea.</span></h1>
              <div className="h-2 w-20 bg-[#D4AF37] rounded-full mt-6" />
            </div>
            <p className="max-w-xl text-lg sm:text-xl text-white/60 font-bold leading-relaxed italic">Enter your idea. Define the future. Submit your idea for community voting.</p>
          </div>
          <div className="relative h-64 md:h-80 lg:h-[400px] overflow-hidden rounded-[2.5rem] border border-[#D4AF37]/20 bg-[#111827] shadow-2xl group/hero">
            <img src={ideasHero} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-95 transition-transform duration-[2000ms] group-hover/hero:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/70 via-transparent to-[#D4AF37]/15 pointer-events-none" />
          </div>
        </section>

        <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
          <div className="flex items-center justify-between px-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.4em] text-[#1F2937]/40 hover:text-[#0B1220] transition-colors group">
              <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" /> Return
            </button>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37] bg-white px-8 py-3 rounded-2xl shadow-sm border border-[#0B1220]/5">
              <Calendar size={16} /> {currentCycle?.label || "Calculating Cycle..."}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/95 rounded-[3.5rem] border border-[#0B1220]/10 shadow-[0_30px_100px_rgba(11,18,32,0.1)] p-8 md:p-16 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
            
            {/* Title & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className={labelClass}><Lightbulb size={16} className="inline mr-2" /> Idea Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter idea name..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-4">
                <label className={labelClass}><FileText size={16} className="inline mr-2" /> Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${inputClass} cursor-pointer appearance-none bg-no-repeat bg-[right_1.5rem_center]`}
                >
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-4">
              <label className={labelClass}><User size={16} className="inline mr-2" /> Description</label>
              <textarea
                required
                rows={6}
                placeholder="Describe your idea, its potential impact, and how it works..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} h-auto py-6 leading-relaxed resize-none`}
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-4">
              <label className={labelClass}><Upload size={16} className="inline mr-2" /> Additional Files (Optional)</label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="h-40 rounded-[2rem] border-2 border-dashed border-[#D4AF37]/20 bg-[#F8F5EF]/50 flex flex-col items-center justify-center gap-4 transition-all duration-500 group-hover:border-[#D4AF37]/40 group-hover:bg-white shadow-inner">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-xl border border-[#D4AF37]/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Upload size={28} />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#1F2937]/30">
                    {file ? file.name : "Upload documents / images (PDF, JPEG, etc.)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Errors/Warnings */}
            {error && (
              <div className="rounded-2xl border-2 border-red-500/20 bg-red-500/5 px-8 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-red-600 flex items-center gap-4 animate-fade-in shadow-sm">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}

            {hasSubmittedInCurrentCycle && (
              <div className="rounded-3xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-8 shadow-xl shadow-[#0B1220]/5 animate-in fade-in slide-in-from-bottom-3 duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                <div className="flex items-start gap-6 relative z-10">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] shadow-xl border border-[#D4AF37]/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <AlertCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-[#0B1220]">
                      Submission limit reached.
                    </h3>
                    <p className="text-sm leading-relaxed text-[#1F2937]/60 font-bold italic">
                      "You have already submitted an idea for this cycle. Only one idea per user is allowed to ensure fair voting. You can still edit your existing idea until the cycle ends."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-10">
              <button
                type="submit"
                disabled={loading || !isSubmissionOpen || hasSubmittedInCurrentCycle}
                className="w-full h-20 flex items-center justify-center gap-4 rounded-full bg-[#D4AF37] text-[#0B1220] font-black uppercase tracking-[0.4em] text-[12px] shadow-[0_20px_50px_rgba(212,175,55,0.3)] transition-all duration-500 hover:-translate-y-2 hover:bg-[#0B1220] hover:text-white active:scale-95 disabled:bg-[#D4AF37]/30 disabled:text-[#0B1220]/30 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
              >
                {loading ? "Submitting..." : "Submit Idea"}
                <Send size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
