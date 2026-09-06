import { BadgeCheck, Truck, RotateCcw, ShieldCheck, Headset } from "lucide-react";
import "./ServiceFeatures.css";

const FEATURES = [
  { icon: BadgeCheck, title: "Certified Jewellery", desc: "100% hallmarked" },
  { icon: Truck, title: "Free Shipping", desc: "On orders above ₹5,000" },
  { icon: RotateCcw, title: "Easy Returns", desc: "15-day return window" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "Safe & encrypted checkout" },
  { icon: Headset, title: "Customer Support", desc: "We're here to help" },
];

export default function ServiceFeatures() {
  return (
    <section className="service-features">
      <div className="container service-features-grid">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div className="service-feature" key={title}>
            <Icon aria-hidden="true" />
            <div>
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

