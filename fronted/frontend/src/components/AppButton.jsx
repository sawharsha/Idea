export default function AppButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const baseStyle = "flex items-center justify-center gap-2 rounded-lg font-semibold uppercase tracking-[0.15em] text-sm transition-all duration-300 active:scale-95 disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#D4AF37] text-[#0B1220] px-4 py-2 shadow-sm hover:bg-[#0B1220] hover:text-white hover:shadow-md",
    primaryLg: "bg-[#D4AF37] text-[#0B1220] px-6 py-3 text-sm shadow-md hover:bg-[#0B1220] hover:text-white hover:shadow-lg",
    secondary: "bg-white text-[#0B1220] border border-[#0B1220]/10 px-4 py-2 hover:border-[#D4AF37]/40 hover:shadow-sm",
    danger: "bg-red-500/10 text-red-600 border border-red-500/20 px-4 py-2 hover:bg-red-600 hover:text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
