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
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#D4AF37]/20 p-8 text-center shadow-lg space-y-6 animate-scale-in">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-[#D4AF37]/10 blur-2xl rounded-full" />
            <div className="relative h-20 w-20 bg-[#D4AF37] text-[#0B1220] rounded-xl flex items-center justify-center shadow-xl mx-auto border-4 border-white">
              <CheckCircle2 size={40} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#0B1220]">Idea Submitted.</h2>
            <p className="text-[#1F2937]/50 font-medium leading-relaxed text-base italic">"Your idea has been successfully shared. Redirecting to your ideas page..."</p>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-12 md:h-[52px] px-4 bg-[#F8F5EF]/70 border border-[#0B1220]/10 rounded-2xl outline-none text-sm md:text-base font-bold text-[#0B1220] placeholder:text-[#1F2937]/20 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/10 focus:bg-white transition-all duration-300 shadow-sm";
  const labelClass = "text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1 block mb-2";

  return (
    <div className="min-h-screen w-full bg-[#F8F5EF] font-sans tracking-tight text-[#1F2937] overflow-x-hidden selection:bg-[#D4AF37]/20 selection:text-[#0B1220]">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 animate-fade-in">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-6 md:gap-8 rounded-[2rem] bg-[#0B1220] border border-[#D4AF37]/20 shadow-lg p-6 md:p-8 min-h-[280px] md:min-h-[340px] overflow-hidden relative group animate-fade-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <Sparkles size={14} /> Idea Portal
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight italic">Share Your <span className="text-[#D4AF37] not-italic">Idea.</span></h1>
              <div className="h-1 w-12 bg-[#D4AF37] rounded-full mt-4" />
            </div>
            <p className="max-w-xl text-base sm:text-lg text-white/60 font-medium leading-relaxed italic">Enter your idea. Define the future. Submit your idea for community voting.</p>
          </div>
          <div className="relative h-auto max-h-[280px] md:max-h-[340px] overflow-hidden rounded-xl border border-[#D4AF37]/20 bg-[#111827] shadow-xl group/hero">
            <img src={ideasHero} alt="" className="w-full h-auto max-h-[280px] md:max-h-[340px] object-cover object-center opacity-95 transition-transform duration-[2000ms] group-hover/hero:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1220]/70 via-transparent to-[#D4AF37]/15 pointer-events-none" />
          </div>
        </section>

        <div className="max-w-3xl mx-auto space-y-8 animate-fade-up">
          <div className="flex items-center justify-between px-2">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#1F2937]/40 hover:text-[#0B1220] transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Return
            </button>
            <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37] bg-white px-6 py-2 rounded-xl shadow-sm border border-[#0B1220]/5">
              <Calendar size={14} /> {currentCycle?.label || "Calculating Cycle..."}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/95 rounded-2xl md:rounded-3xl border border-[#0B1220]/10 shadow-lg p-6 md:p-8 space-y-6 md:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
            
            {/* Title & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className={labelClass}><Lightbulb size={14} className="inline mr-1" /> Idea Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter idea name..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-3">
                <label className={labelClass}><FileText size={14} className="inline mr-1" /> Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`${inputClass} cursor-pointer appearance-none bg-no-repeat bg-[right_1rem_center]`}
                >
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
            </div>

            {/* Description Area */}
            <div className="space-y-3">
              <label className={labelClass}><User size={14} className="inline mr-1" /> Description</label>
              <textarea
                required
                rows={5}
                placeholder="Describe your idea, its potential impact, and how it works..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputClass} min-h-[220px] md:min-h-[260px] py-4 leading-relaxed resize-none`}
              />
            </div>

            {/* Upload Area */}
            <div className="space-y-3">
              <label className={labelClass}><Upload size={14} className="inline mr-1" /> Additional Files (Optional)</label>
              <div className="relative group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="h-32 rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#F8F5EF]/50 flex flex-col items-center justify-center gap-3 transition-all duration-300 group-hover:border-[#D4AF37]/50 group-hover:bg-white shadow-inner">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-[#D4AF37] shadow-md border border-[#D4AF37]/10 transition-transform duration-300 group-hover:scale-110">
                    <Upload size={20} />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#1F2937]/30">
                    {file ? file.name : "Upload documents / images (PDF, JPEG, etc.)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Errors/Warnings */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-3 animate-fade-in shadow-sm">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            {hasSubmittedInCurrentCycle && (
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-6 shadow-md animate-fade-up relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm border border-[#D4AF37]/20 transition-transform duration-300 group-hover:scale-110">
                    <AlertCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight text-[#0B1220]">
                      Submission limit reached.
                    </h3>
                    <p className="text-xs leading-relaxed text-[#1F2937]/60 font-medium italic">
                      "You have already submitted an idea for this cycle. Only one idea per user is allowed to ensure fair voting."
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || !isSubmissionOpen || hasSubmittedInCurrentCycle}
                className="w-full px-5 py-3 md:py-4 flex items-center justify-center gap-3 rounded-full bg-[#0B1220] text-white font-bold uppercase tracking-wider text-sm shadow-md transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B1220] active:scale-95 disabled:bg-[#D4AF37]/30 disabled:text-[#0B1220]/30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? "Submitting..." : "Submit Idea"}
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
