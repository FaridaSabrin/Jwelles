import { CircleDot, Loader2, Clock3, CheckCircle2, XCircle } from "lucide-react";

const STATUS_META = {
  open: { label: "Open", icon: CircleDot, className: "badge-gold" },
  in_progress: { label: "In Progress", icon: Loader2, className: "badge-gold" },
  awaiting_customer: { label: "Awaiting Your Reply", icon: Clock3, className: "badge-gold" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "badge-success" },
  closed: { label: "Closed", icon: XCircle, className: "badge-muted" },
};

export default function TicketStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, icon: CircleDot, className: "badge-muted" };
  const Icon = meta.icon;
  return (
    <span className={`badge ${meta.className}`}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

export { STATUS_META };
