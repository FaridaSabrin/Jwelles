import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import "./SortDropdown.css";

const OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Selling", value: "popular" },
  { label: "Highest Rated", value: "best_rated" },
  { label: "Biggest Discount", value: "discount_desc" },
];

export default function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = OPTIONS.find((o) => o.value === value) || OPTIONS[0];

  return (
    <div className="sort-dropdown" ref={ref}>
      <button className="sort-trigger" onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open}>
        <ArrowUpDown size={14} />
        <span>Sort: {active.label}</span>
      </button>

      {open && (
        <ul className="sort-menu" role="menu">
          {OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                className={opt.value === active.value ? "is-active" : ""}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
                {opt.value === active.value && <Check size={14} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

