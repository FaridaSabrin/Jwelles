import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Wallet,
  Send,
} from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import "./Footer.css";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.5.5.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 0 1-1.15 1.76 4.9 4.9 0 0 1-1.76 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 0 1-1.76-1.15 4.9 4.9 0 0 1-1.15-1.76c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76A4.9 4.9 0 0 1 5.44 2.53c.64-.25 1.37-.42 2.43-.47C8.94 2.01 9.28 2 12 2m0 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m0 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9M17.9 6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M14 3h4v4h-3c-.5 0-1 .5-1 1.2V11h4l-.6 4H14v8h-4v-8H7v-4h3V7.8C10 5.1 11.8 3 14 3",
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com",
    path: "M12 2a10 10 0 0 0-3.6 19.3c0-.8 0-1.8.2-2.6l1.4-6s-.4-.8-.4-1.9c0-1.8 1-3.1 2.3-3.1 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1.1 4.3-.3 1.2.6 2.2 1.9 2.2 2.2 0 3.9-2.4 3.9-5.7 0-3-2.1-5.1-5.2-5.1-3.5 0-5.6 2.6-5.6 5.4 0 1 .4 2.1.9 2.7.1.1.1.2.1.3l-.4 1.5c0 .2-.2.3-.4.2-1.4-.7-2.3-2.8-2.3-4.6 0-3.7 2.7-7.2 7.8-7.2 4.1 0 7.3 2.9 7.3 6.8 0 4.1-2.5 7.3-6.1 7.3-1.2 0-2.3-.6-2.7-1.4l-.7 2.8c-.3 1-1 2.4-1.4 3.1A10 10 0 1 0 12 2",
  },
];

const shortcuts = ["Contact", "Shipping", "Returns", "FAQ"];

export default function Footer() {
  const { jewelleryCategories } = useCategories();

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* =========================================
            BRAND HEADER
        ========================================== */}

        <div className="footer-brand-header">
          <div className="footer-brand-content">
            <h2 className="footer-logo">Jwelles</h2>

            <p className="footer-brand-description">
              Fine jewellery crafted with precision and care — designed to be
              treasured for a lifetime and passed on for generations.
            </p>

            <div className="footer-socials">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="footer-social-icon"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================
            MAIN FOOTER CONTENT
        ========================================== */}

        <div className="footer-main-grid">

          {/* SHOP */}

          <div className="footer-col">
            <h4>Shop</h4>

            <Link to="/products">
              All Jewellery
            </Link>

            {jewelleryCategories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
              >
                {cat.name}
              </Link>
            ))}

            <Link to="/products?discount=true">
              Offers
            </Link>
          </div>

          {/* CUSTOMER SERVICE */}

          <div className="footer-col">
            <h4>Customer Service</h4>

            {shortcuts.map((label) => (
              <Link
                key={label}
                to={`/${label.toLowerCase()}`}
              >
                {label}
              </Link>
            ))}

            <Link to="/orders">
              Track Order
            </Link>
          </div>

          {/* ABOUT */}

          <div className="footer-col">
            <h4>About</h4>

            <Link to="/about">
              About Us
            </Link>

            <Link to="/privacy">
              Privacy Policy
            </Link>

            <Link to="/terms">
              Terms &amp; Conditions
            </Link>
          </div>

          {/* NEWSLETTER */}

          <div className="footer-col footer-newsletter">
            <h4>Newsletter</h4>

            <p className="footer-newsletter-text">
              Be the first to know about new arrivals, exclusive collections
              and offers.
            </p>

            {subscribed ? (
              <p className="footer-subscribed">
                <ShieldCheck size={16} />
                <span>Thank you — you're on the list.</span>
              </p>
            ) : (
              <form
                className="footer-subscribe-form"
                onSubmit={handleSubscribe}
              >
                <div className="footer-input-group">
                  <Mail
                    className="footer-mail-icon"
                    size={16}
                    aria-hidden="true"
                  />

                  <input
                    type="email"
                    required
                    className="input"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gold"
                >
                  <span>Subscribe</span>
                  <Send size={14} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* =========================================
            FOOTER BOTTOM
        ========================================== */}

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Jwelles Fine Jewellery.
            All rights reserved.
          </p>

          <div className="footer-payments">
            <span>
              <CreditCard size={15} />
              Cards
            </span>

            <span>
              <Smartphone size={15} />
              UPI
            </span>

            <span>
              <Wallet size={15} />
              Net Banking
            </span>

            <span>
              Cash on Delivery
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}