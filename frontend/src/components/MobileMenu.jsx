import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ChevronDown, User, Heart, Package, LogOut, LogIn, UserPlus } from "lucide-react";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../hooks/useAuth";
import SearchBar from "./SearchBar";
import "./MobileMenu.css";

const RECIPIENTS = [
  { label: "Women", value: "women" },
  { label: "Men", value: "men" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" },
];

export default function MobileMenu({ open, onClose }) {
  const { primaryCategories, metalCategories } = useCategories();
  const { isAuthenticated, user, logout } = useAuth();
  const [expanded, setExpanded] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.toggle("scroll-lock", open);
    return () => document.body.classList.remove("scroll-lock");
  }, [open]);

  if (!open) return null;

  const toggle = (key) => setExpanded((prev) => (prev === key ? "" : key));

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="mobile-menu" onClick={(e) => e.stopPropagation()} aria-label="Site menu">
        <header className="mobile-menu-header">
          <span className="navbar-logo">Jwelles</span>
          <button className="btn-icon" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </header>

        <div className="mobile-menu-search">
          <SearchBar onNavigate={onClose} />
        </div>

        <nav className="mobile-menu-nav">
          <Link to="/" onClick={onClose} className="mobile-menu-link">Home</Link>

          <div className="mobile-accordion">
            <button className="mobile-accordion-trigger" onClick={() => toggle("category")}>
              Jewellery
              <ChevronDown size={16} className={expanded === "category" ? "rotated" : ""} />
            </button>
            {expanded === "category" && (
              <div className="mobile-accordion-panel">
                {primaryCategories.map((cat) => (
                  <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={onClose}>
                    {cat.name}
                  </Link>
                ))}
                {primaryCategories.length === 0 && <span className="mega-menu-empty">Categories coming soon</span>}
              </div>
            )}
          </div>

          <div className="mobile-accordion">
            <button className="mobile-accordion-trigger" onClick={() => toggle("metal")}>
              Shop by Metal
              <ChevronDown size={16} className={expanded === "metal" ? "rotated" : ""} />
            </button>
            {expanded === "metal" && (
              <div className="mobile-accordion-panel">
                {metalCategories.map((cat) => (
                  <Link key={cat.id} to={`/products?metal_type=${encodeURIComponent(cat.name)}`} onClick={onClose}>
                    {cat.name}
                  </Link>
                ))}
                {metalCategories.length === 0 && <span className="mega-menu-empty">Coming soon</span>}
              </div>
            )}
          </div>

          <div className="mobile-accordion">
            <button className="mobile-accordion-trigger" onClick={() => toggle("gender")}>
              Shop for
              <ChevronDown size={16} className={expanded === "gender" ? "rotated" : ""} />
            </button>
            {expanded === "gender" && (
              <div className="mobile-accordion-panel">
                {RECIPIENTS.map((r) => (
                  <Link key={r.value} to={`/products?gender=${r.value}`} onClick={onClose}>{r.label}</Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/products?sort=newest" onClick={onClose} className="mobile-menu-link">New Arrivals</Link>
          <Link to="/products?discount=true" onClick={onClose} className="mobile-menu-link">Offers</Link>
        </nav>

        <div className="mobile-menu-account">
          {isAuthenticated ? (
            <>
              <p className="mobile-menu-greeting">Hello, {user?.name || "there"}</p>
              <Link to="/profile" onClick={onClose} className="mobile-menu-link"><User size={16} /> My Profile</Link>
              <Link to="/orders" onClick={onClose} className="mobile-menu-link"><Package size={16} /> My Orders</Link>
              <Link to="/wishlist" onClick={onClose} className="mobile-menu-link"><Heart size={16} /> Wishlist</Link>
              <button className="mobile-menu-link" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose} className="mobile-menu-link"><LogIn size={16} /> Login</Link>
              <Link to="/register" onClick={onClose} className="mobile-menu-link"><UserPlus size={16} /> Register</Link>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

