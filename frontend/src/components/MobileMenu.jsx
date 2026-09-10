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

<<<<<<< HEAD
const POPULAR_COLLECTIONS = [
  { label: "New Arrivals", path: "/products?sort=newest" },
  { label: "Special Offers", path: "/products?discount=true" },
  { label: "Best Sellers", path: "/products?best_seller=true" },
  { label: "Under Budget", path: "/products?max_price=10000" },
];

const CUSTOM_JEWELRY = [
  { label: "Design Your Own", path: "/custom-jewelry" },
  { label: "Engraving Services", path: "/custom-jewelry?type=engraving" },
  { label: "Birthstone Jewelry", path: "/custom-jewelry?type=birthstone" },
  { label: "Name Necklaces", path: "/custom-jewelry?type=name" },
  { label: "Photo Jewelry", path: "/custom-jewelry?type=photo" },
];

=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
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
<<<<<<< HEAD
                  <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.slug)}`} onClick={onClose}>
=======
                  <Link key={cat.id} to={`/products?category=${encodeURIComponent(cat.name)}`} onClick={onClose}>
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
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
<<<<<<< HEAD
                <Link to="/products?discount=true" onClick={onClose} className="mega-menu-offer-link">View Current Offers →</Link>
              </div>
            )}
          </div>

          <div className="mobile-accordion">
            <button className="mobile-accordion-trigger" onClick={() => toggle("popular")}>
              Popular Collections
              <ChevronDown size={16} className={expanded === "popular" ? "rotated" : ""} />
            </button>
            {expanded === "popular" && (
              <div className="mobile-accordion-panel">
                {POPULAR_COLLECTIONS.map((item) => (
                  <Link key={item.label} to={item.path} onClick={onClose}>{item.label}</Link>
                ))}
              </div>
            )}
          </div>

          <div className="mobile-accordion">
            <button className="mobile-accordion-trigger" onClick={() => toggle("custom")}>
              Custom Jewelry
              <ChevronDown size={16} className={expanded === "custom" ? "rotated" : ""} />
            </button>
            {expanded === "custom" && (
              <div className="mobile-accordion-panel">
                {CUSTOM_JEWELRY.map((item) => (
                  <Link key={item.label} to={item.path} onClick={onClose}>{item.label}</Link>
                ))}
=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
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

