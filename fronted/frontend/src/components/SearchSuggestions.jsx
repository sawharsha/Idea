export default function SearchSuggestions({
  suggestions,
  onSelect,
  visible,
}) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#F8F5EF] shadow-[0_18px_45px_rgba(11,31,58,0.10)]">
      {suggestions.map((item, index) => (
        <button
          key={`${item}-${index}`}
          type="button"
          onClick={() => onSelect(item)}
          className="block w-full px-4 py-3 text-left text-sm font-medium text-[#0B1220]/75 transition hover:bg-[#D4AF37]/10 hover:text-[#0B1F3A]"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
