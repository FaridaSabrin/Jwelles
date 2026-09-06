import { Clock, CheckCircle2, PackageCheck, Truck, Home, XCircle, Package } from "lucide-react";

const STATUS_META = {
  placed: { label: "Order Placed", icon: Clock, className: "badge-gold" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "badge-gold" },
  processing: { label: "Processing", icon: Package, className: "badge-gold" },
  shipped: { label: "Shipped", icon: Truck, className: "badge-success" },
  out_for_delivery: { label: "Out for Delivery", icon: PackageCheck, className: "badge-success" },
  delivered: { label: "Delivered", icon: Home, className: "badge-success" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "badge-error" },
};

export default function OrderStatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, icon: Clock, className: "badge-muted" };
  const Icon = meta.icon;
  return (
    <span className={`badge ${meta.className}`}>
      <Icon size={12} /> {meta.label}
    </span>
  );
}

export { STATUS_META };

