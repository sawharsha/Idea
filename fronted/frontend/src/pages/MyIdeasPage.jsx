import { useEffect, useState } from "react";
import { Lightbulb, Sparkles, X } from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import IdeaCard from "../components/IdeaCard";
import IdeaModal from "../components/IdeaModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const getOwnerId = (idea) =>
  idea.user?._id ||
  idea.userId?._id ||
  idea.userId ||
  idea.createdBy?._id ||
  idea.createdBy ||
  idea.author?._id ||
  idea.author;

export default function MyIdeasPage() {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const user = userInfo?.user;
  const authUser = userInfo?.user;
  const currentUserId =
    user?._id ||
    user?.id ||
    userInfo?._id ||
    userInfo?.id ||
    authUser?._id ||
    authUser?.id;

  const [myIdeas, setMyIdeas] = useState([]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "" });
  const [newFile, setNewFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasIdeaFile = (idea) =>
    Boolean(
      idea?.fileUrl ||
      idea?.filePublicId ||
      idea?.file?.url ||
      idea?.file?.path ||
      idea?.file?.publicId ||
      idea?.file?.public_id
    );

  const getIdeaFileName = (idea) =>
    idea?.originalFileName ||
    idea?.file?.originalName ||
    idea?.file?.originalFileName ||
    idea?.file?.name ||
    "View current file";

  useEffect(() => {
    fetchMyIdeas();
  }, []);

  const fetchMyIdeas = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/ideas");
      const ideas = Array.isArray(data.data)
        ? data.data
        : (data.data?.ideas || data.ideas || []);
      const myIdeas = ideas.filter((idea) => {
        return String(getOwnerId(idea)) === String(currentUserId);
      });

      console.log("currentUserId:", currentUserId);
      console.log("ideas owners:", ideas.map(i => getOwnerId(i)));
      console.log("myIdeas:", myIdeas);

      setAllIdeas(ideas);
      setMyIdeas(myIdeas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      await api.put(`/ideas/${id}/like`);
      fetchMyIdeas();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ideas/${id}`);
      setMyIdeas((ideas) => ideas.filter((idea) => idea._id !== id));
      if (selectedIdea?._id === id) setSelectedIdea(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditOpen = (idea) => {
    setSelectedIdea(idea);
    setEditForm({
      title: idea.title,
      description: idea.description,
      category: idea.category || idea.type || "Software",
    });
    setEditError("");
    setNewFile(null);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedIdea(null);
    setNewFile(null);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!selectedIdea?._id) return;

    setEditLoading(true);
    setEditError("");
    try {
      const payload = new FormData();
      payload.append("title", editForm.title);
      payload.append("description", editForm.description);
      payload.append("category", editForm.category);
      if (newFile) {
        payload.append("file", newFile);
      }

      await api.put(`/ideas/${selectedIdea._id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIsEditOpen(false);
      setSelectedIdea(null);
      setNewFile(null);
      fetchMyIdeas();
    } catch (error) {
      console.error(error);
      setEditError(error.response?.data?.message || "Unable to update idea.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="premium-page">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-fade-in">
        
        {/* Header Section */}
        <section className="premium-hero max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-up">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.1),transparent_40%)] pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl text-[#D4AF37] shadow-lg border border-white/10">
                <Lightbulb size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">Submission Status</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">My <span className="text-[#D4AF37]">Ideas.</span></h2>
              </div>
            </div>
            <button 
              onClick={() => navigate("/submit-idea")}
              className="px-5 py-2.5 bg-[#D4AF37] text-[#0B1220] rounded-full text-sm font-medium tracking-wide shadow-xl shadow-[#D4AF37]/25 hover:bg-white hover:scale-105 transition-all duration-300 ease-out active:scale-95"
            >
              Submit Idea
            </button>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[8px] font-bold uppercase tracking-wider text-[#D4AF37]">
                <Sparkles size={10} /> Personal Collection
             </div>
             <div className="text-[8px] font-bold text-white/50 uppercase tracking-wider">
                {myIdeas.length} {myIdeas.length === 1 ? 'Idea' : 'Ideas'} Submitted
             </div>
          </div>
        </section>

        {/* Ideas Grid */}
        <section className="animate-fade-up mt-8">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-64 bg-white/70 rounded-3xl border border-[#0B1F3A]/10 shadow-xl animate-pulse" />
               ))}
             </div>
          ) : myIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} allIdeas={allIdeas} onVote={handleVote} onOpen={setSelectedIdea} onDelete={handleDelete} onEdit={handleEditOpen} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/95 border-2 border-dashed border-[#D4AF37]/20 py-16 text-center flex flex-col items-center justify-center shadow-xl group transition-all duration-300">
               <div className="h-16 w-16 bg-[#F8F5EF] rounded-full flex items-center justify-center text-[#D4AF37]/20 mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0B1220] tracking-tight">No ideas submitted yet.</h3>
              <p className="text-[#1F2937]/30 text-[9px] font-bold uppercase tracking-wider mt-2 italic">Submit your first idea to get started.</p>
              <button onClick={() => navigate("/submit-idea")} className="mt-6 px-5 py-2.5 bg-[#D4AF37] text-[#0B1220] rounded-full text-sm font-semibold tracking-wide shadow-xl shadow-[#D4AF37]/25 hover:bg-[#0B1F3A] hover:text-white hover:scale-105 transition-all duration-300 ease-out active:scale-95">
                Submit Idea
              </button>
            </div>
          )}
        </section>
      </main>

      <IdeaModal 
        idea={isEditOpen ? null : selectedIdea} 
        allIdeas={allIdeas}
        onClose={() => setSelectedIdea(null)} 
        onVote={handleVote}
      />

      {isEditOpen && (
        <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4 sm:p-6 bg-[#0B1F3A]/80 backdrop-blur-xl animate-fade-in" onClick={closeEditModal}>
          <form
            onSubmit={handleEditSave}
            className="bg-white max-w-2xl w-full mx-auto rounded-3xl border border-[#D4AF37]/20 shadow-2xl p-6 md:p-8 space-y-6 relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">Modify Idea</p>
                <h2 className="text-2xl font-black tracking-tight text-[#0B1220]">Edit Submission</h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F8F5EF] text-[#1F2937]/40 hover:text-[#0B1220] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1 block">Idea Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl premium-input text-sm md:text-base font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1 block">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full h-12 px-4 rounded-2xl premium-input text-sm md:text-base font-bold"
                >
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                </select>
              </div>
            </div>

            <div className="relative z-10 space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] ml-1 block">Description</label>
              <textarea
                required
                rows={5}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full min-h-[180px] px-4 py-4 rounded-2xl premium-input text-sm md:text-base font-bold leading-relaxed resize-none"
              />
            </div>

            <div className="relative z-10 space-y-3 rounded-2xl border border-[#0B1F3A]/10 bg-[#F8F5EF]/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] block">Uploaded File</label>
                  <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                    {newFile ? newFile.name : "Choose a new file only if you want to replace the current one."}
                  </p>
                </div>
                {hasIdeaFile(selectedIdea) && (
                  <a
                    href={`${apiUrl}/ideas/${selectedIdea._id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A] underline decoration-[#D4AF37] underline-offset-4 hover:text-[#D4AF37] transition-colors"
                  >
                    {getIdeaFileName(selectedIdea)}
                  </a>
                )}
              </div>
              <input
                type="file"
                name="file"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-[#0B1220] file:mr-4 file:rounded-full file:border-0 file:bg-[#D4AF37] file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-[#0B1220] hover:file:bg-[#0B1F3A] hover:file:text-white file:transition-all file:duration-300"
              />
            </div>

            {editError && (
              <div className="relative z-10 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-red-600">
                {editError}
              </div>
            )}

            <div className="relative z-10 flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-5 py-2.5 rounded-full bg-white border border-[#0B1F3A]/10 text-[#0B1220] font-semibold tracking-wide text-sm hover:bg-[#0B1F3A] hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#0B1220] font-semibold tracking-wide text-sm shadow-xl shadow-[#D4AF37]/25 hover:bg-[#0B1F3A] hover:text-white transition-all duration-300 disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
