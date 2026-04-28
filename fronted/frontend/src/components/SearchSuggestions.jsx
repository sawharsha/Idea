export default function SearchSuggestions({
  suggestions,
  onSelect,
  visible,
}) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#C9A227]/20 bg-[#FAF7F0] shadow-[0_18px_45px_rgba(15,61,46,0.08)]">
      {suggestions.map((item, index) => (
        <button
          key={`${item}-${index}`}
          type="button"
          onClick={() => onSelect(item)}
          className="block w-full px-4 py-3 text-left text-sm font-medium text-[#222222]/75 transition hover:bg-[#C9A227]/10 hover:text-[#0F3D2E]"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
