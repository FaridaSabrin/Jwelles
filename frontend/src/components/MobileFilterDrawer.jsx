import { useEffect } from "react";
import { X } from "lucide-react";
import { FilterFields } from "./FilterSidebar";
import "./MobileFilterDrawer.css";

export default function MobileFilterDrawer({ open, onClose, resultCount, ...filterProps }) {
  useEffect(() => {
    document.body.classList.toggle("scroll-lock", open);
    return () => document.body.classList.remove("scroll-lock");
  }, [open]);

  if (!open) return null;

  return (
    <div className="drawer-overlay mobile-filter-overlay" onClick={onClose}>
      <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="mobile-filter-header">
          <h2>Filters</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </header>

        <div className="mobile-filter-body">
          <FilterFields {...filterProps} />
        </div>

        <footer className="mobile-filter-footer">
          <button className="btn btn-outline btn-block" onClick={() => { filterProps.onClear(); }}>Clear All</button>
          <button className="btn btn-primary btn-block" onClick={onClose}>
            Show {resultCount ?? ""} Results
          </button>
        </footer>
      </div>
    </div>
  );
}

