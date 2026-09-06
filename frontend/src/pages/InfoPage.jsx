import { useParams, Navigate } from "react-router-dom";
import { Mail, Phone, MapPin, Truck, RotateCcw, HelpCircle, Info } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import "./InfoPage.css";

const PAGES = {
  about: {
    icon: Info,
    title: "About Jwelles",
    intro: "Fine jewellery, crafted with intention.",
    body: [
      "Jwelles was founded on a simple belief — that jewellery should be as meaningful as the moments it marks. Every piece in our collection is designed to be worn, loved and passed down.",
      "We work with certified, hallmarked metals and stones, and stand behind every product we sell with transparent pricing and honest craftsmanship.",
    ],
  },
  contact: {
    icon: Mail,
    title: "Contact Us",
    intro: "We'd love to hear from you.",
    body: [],
    contact: true,
  },
  shipping: {
    icon: Truck,
    title: "Shipping Policy",
    intro: "Fast, secure delivery on every order.",
    body: [
      "Orders above ₹5,000 ship free across India. Orders below this threshold carry a flat shipping fee, calculated at checkout.",
      "Most orders are dispatched within 24–48 hours and arrive within 3–6 business days, depending on your location. You'll receive tracking details by email once your order ships.",
      "All jewellery is shipped in tamper-proof, insured packaging.",
    ],
  },
  returns: {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    intro: "Easy 15-day returns.",
    body: [
      "If you're not completely satisfied, you may return unworn, undamaged items in their original packaging within 15 days of delivery for a refund or exchange.",
      "To start a return, sign in and visit My Orders, or reach out to our support team with your order ID.",
    ],
  },
  faq: {
    icon: HelpCircle,
    title: "Frequently Asked Questions",
    intro: "Answers to common questions.",
    faqs: [
      { q: "Is your jewellery certified?", a: "Yes — all applicable pieces are certified and hallmarked in line with industry standards." },
      { q: "How do I track my order?", a: "Sign in and open My Orders to see live status for every order you've placed." },
      { q: "What payment methods are accepted?", a: "We accept cards, UPI, net banking and cash on delivery." },
      { q: "Can I cancel or modify my order?", a: "Contact support as soon as possible after placing your order — we'll do our best to accommodate changes before dispatch." },
    ],
  },
  privacy: {
    icon: Info,
    title: "Privacy Policy",
    intro: "Your information, protected.",
    body: [
      "We collect only the information required to process your orders and improve your shopping experience — your name, contact details and shipping address.",
      "We never sell your personal information to third parties. Payment details are handled securely and are never stored on our servers.",
    ],
  },
  terms: {
    icon: Info,
    title: "Terms & Conditions",
    intro: "The fine print.",
    body: [
      "By using this site and placing an order, you agree to our pricing, shipping and returns policies as published here.",
      "Product images are indicative; actual weight and dimensions may vary slightly due to the handcrafted nature of jewellery.",
      "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
    ],
  },
};

export default function InfoPage() {
  const { slug } = useParams();
  const page = PAGES[slug];

  if (!page) return <Navigate to="/" replace />;

  const Icon = page.icon;

  return (
    <div className="container info-page">
      <Breadcrumbs items={[{ label: page.title }]} />

      <div className="info-page-header">
        <div className="info-page-icon"><Icon aria-hidden="true" /></div>
        <h1 className="heading-lg">{page.title}</h1>
        <p className="text-muted">{page.intro}</p>
      </div>

      <div className="info-page-body">
        {page.body?.map((para) => <p key={para.slice(0, 24)}>{para}</p>)}

        {page.faqs && (
          <div className="info-faq-list">
            {page.faqs.map((item) => (
              <div className="info-faq-item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        )}

        {page.contact && (
          <div className="info-contact-grid">
            <a href="mailto:support@Jwelles.com" className="info-contact-card">
              <Mail aria-hidden="true" />
              <strong>Email</strong>
              <span>support@Jwelles.com</span>
            </a>
            <a href="tel:+919876543210" className="info-contact-card">
              <Phone aria-hidden="true" />
              <strong>Phone</strong>
              <span>+91 98765 43210</span>
            </a>
            <div className="info-contact-card">
              <MapPin aria-hidden="true" />
              <strong>Studio</strong>
              <span>Mumbai, India</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

