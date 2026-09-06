import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import "./FilterSidebar.css";

const PRICE_BUCKETS = [
  { label: "Under ₹10,000", min: "", max: "10000" },
  { label: "₹10,000 – ₹25,000", min: "10000", max: "25000" },
  { label: "₹25,000 – ₹50,000", min: "25000", max: "50000" },
  { label: "₹50,000 – ₹1,00,000", min: "50000", max: "100000" },
  { label: "Above ₹1,00,000", min: "100000", max: "" },
];

const GENDERS = [
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
  { label: "Unisex", value: "unisex" },
  { label: "Kids", value: "kids" },
];

const DISCOUNTS = [
  { label: "10% & above", value: "10" },
  { label: "20% & above", value: "20" },
  { label: "30% & above", value: "30" },
  { label: "50% & above", value: "50" },
];

const RATINGS = [
  { label: "4★ & above", value: "4" },
  { label: "3★ & above", value: "3" },
];

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <ChevronDown size={15} className={open ? "rotated" : ""} />
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function OptionList({ options, activeValue, onSelect, valueKey = "value", labelKey = "label" }) {
  return (
    <div className="filter-option-list">
      {options.map((opt) => {
        const value = typeof opt === "string" ? opt : opt[valueKey];
        const label = typeof opt === "string" ? opt : opt[labelKey];
        const active = activeValue === value;
        return (
          <button
            key={value}
            className={`filter-option ${active ? "is-active" : ""}`}
            onClick={() => onSelect(active ? "" : value)}
            aria-pressed={active}
          >
            <span className="filter-option-dot" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function FilterFields({ filters, onChange, onClear, purityOptions = [] }) {
  const { primaryCategories, metalCategories } = useCategories();

  const activeBucket = PRICE_BUCKETS.find((b) => b.min === (filters.min_price || "") && b.max === (filters.max_price || ""));

  return (
    <div className="filter-fields">
      <div className="filter-fields-head">
        <span>Filters</span>
        <button className="filter-clear-all" onClick={onClear}>
          <RotateCcw size={13} /> Clear All
        </button>
      </div>

      {primaryCategories.length > 0 && (
        <Section title="Category">
          <OptionList
            options={primaryCategories.map((c) => ({ label: c.name, value: c.name }))}
            activeValue={filters.category || ""}
            onSelect={(v) => onChange("category", v)}
          />
        </Section>
      )}

      {metalCategories.length > 0 && (
        <Section title="Metal">
          <OptionList
            options={metalCategories.map((c) => ({ label: c.name, value: c.name }))}
            activeValue={filters.metal_type || ""}
            onSelect={(v) => onChange("metal_type", v)}
          />
        </Section>
      )}

      {purityOptions.length > 0 && (
        <Section title="Purity" defaultOpen={false}>
          <OptionList
            options={purityOptions}
            activeValue={filters.purity || ""}
            onSelect={(v) => onChange("purity", v)}
          />
        </Section>
      )}

      <Section title="Gender" defaultOpen={false}>
        <OptionList options={GENDERS} activeValue={filters.gender || ""} onSelect={(v) => onChange("gender", v)} />
      </Section>

      <Section title="Price">
        <OptionList
          options={PRICE_BUCKETS.map((b) => ({ label: b.label, value: b.label }))}
          activeValue={activeBucket?.label || ""}
          onSelect={(label) => {
            const bucket = PRICE_BUCKETS.find((b) => b.label === label);
            onChange("min_price", bucket ? bucket.min : "");
            onChange("max_price", bucket ? bucket.max : "");
          }}
        />

        <div className="filter-price-custom">
          <input
            type="number"
            min="0"
            className="input"
            placeholder="Min ₹"
            value={filters.min_price || ""}
            onChange={(e) => onChange("min_price", e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            className="input"
            placeholder="Max ₹"
            value={filters.max_price || ""}
            onChange={(e) => onChange("max_price", e.target.value)}
          />
        </div>
      </Section>

      <Section title="Discount" defaultOpen={false}>
        <OptionList
          options={DISCOUNTS}
          activeValue={filters.min_discount || ""}
          onSelect={(v) => { onChange("min_discount", v); onChange("discount", v ? "true" : ""); }}
        />
      </Section>

      <Section title="Rating" defaultOpen={false}>
        <OptionList options={RATINGS} activeValue={filters.rating || ""} onSelect={(v) => onChange("rating", v)} />
      </Section>

      <Section title="Availability" defaultOpen={false}>
        <label className="checkbox-row filter-availability">
          <input
            type="checkbox"
            checked={filters.available === "true"}
            onChange={(e) => onChange("available", e.target.checked ? "true" : "")}
          />
          In Stock Only
        </label>
      </Section>
    </div>
  );
}

export default function FilterSidebar(props) {
  return (
    <aside className="filter-sidebar">
      <FilterFields {...props} />
    </aside>
  );
}

