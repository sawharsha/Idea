export default function AppCard({ children, className = "" }) {
  return (
    <div className={`bg-white/95 rounded-[2.5rem] border border-[#0B1220]/10 shadow-xl shadow-[#0B1220]/5 p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-150" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
