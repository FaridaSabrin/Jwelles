const PRIORITY_META = {
  low: { label: "Low", className: "badge-muted" },
  medium: { label: "Medium", className: "badge-gold" },
  high: { label: "High", className: "badge-error" },
};

export default function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || { label: priority, className: "badge-muted" };
  return <span className={`badge ${meta.className}`}>{meta.label}</span>;
}
