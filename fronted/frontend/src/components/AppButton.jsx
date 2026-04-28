export default function AppButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "flex items-center justify-center gap-3 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 active:scale-95 disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#D4AF37] text-[#0B1220] px-8 py-4 shadow-xl shadow-[#D4AF37]/20 hover:bg-[#0B1220] hover:text-white hover:-translate-y-1",
    primaryLg: "bg-[#D4AF37] text-[#0B1220] px-12 py-5 text-xs shadow-2xl shadow-[#D4AF37]/30 hover:bg-[#0B1220] hover:text-white hover:-translate-y-1",
    secondary: "bg-white text-[#0B1220] border border-[#0B1220]/10 px-8 py-4 hover:border-[#D4AF37]/40 hover:-translate-y-1",
    danger: "bg-red-500/10 text-red-600 border border-red-500/20 px-8 py-4 hover:bg-red-600 hover:text-white hover:-translate-y-1",
  };

  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
