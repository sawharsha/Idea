export default function AppCard({ children, className = "" }) {
  return (
    <div className={`bg-white/95 rounded-xl border border-[#0B1220]/10 shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] group relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none transition-transform duration-700 group-hover:scale-125" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
