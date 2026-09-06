import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag, User, ChevronDown, Package, LogOut, MapPin, LifeBuoy } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { getProducts } from "../services/api";
import TopBar from "./TopBar";
import SearchBar from "./SearchBar";
import MegaMenu from "./MegaMenu";
import CollectionsMegaMenu from "./CollectionsMegaMenu";
import MobileMenu from "./MobileMenu";
import CartDrawer from "./CartDrawer";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, openDrawer } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [promoProduct, setPromoProduct] = useState(null);
  const accountRef = useRef(null);
  const megaRef = useRef(null);
  const collectionsRef = useRef(null);

  useEffect(() => {
    getProducts({ sort: "popular", available: "true" })
      .then((data) => setPromoProduct(data.find((p) => p.is_featured) || data[0] || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (megaRef.current && !megaRef.current.contains(e.target)) setMegaOpen(false);
      if (collectionsRef.current && !collectionsRef.current.contains(e.target)) setCollectionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdowns when location changes
  useEffect(() => {
    setMegaOpen(false);
    setCollectionsOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Check if Jewellery tab should be active
  const isJewelleryActive = () => {
    if (location.pathname !== "/products") return false;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has("gender") || searchParams.has("metal_type") || 
           (!searchParams.has("category") && !searchParams.has("sort") && !searchParams.has("discount"));
  };

  // Check if Collections tab should be active
  const isCollectionsActive = () => {
    if (location.pathname !== "/products") return false;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.has("collection") || searchParams.has("category");
  };

  // Check if New Arrivals is active
  const isNewArrivalsActive = () => {
    if (location.pathname !== "/products") return false;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("sort") === "newest";
  };

  // Check if Offers is active
  const isOffersActive = () => {
    if (location.pathname !== "/products") return false;
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("discount") === "true";
  };

  return (
    <>
      <TopBar />

      <header className="navbar">
        <div className="navbar-main container">
          <button className="navbar-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>

          <Link to="/" className="navbar-logo">
            Jwelles
            <span className="navbar-tagline">Fine Jewellery</span>
          </Link>

          <div className="navbar-search-desktop">
            <SearchBar />
          </div>

          <div className="navbar-actions">
            <button className="btn-icon navbar-search-btn" onClick={() => setMobileSearchOpen((v) => !v)} aria-label="Search">
              <Search size={20} />
            </button>

            <div className="navbar-account" ref={accountRef}>
              {isAuthenticated ? (
                <>
                  <button
                    className="btn-icon"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={accountOpen}
                    aria-label="Account menu"
                  >
                    <User size={20} />
                  </button>

                  {accountOpen && (
                    <div className="account-dropdown">
                      <p className="account-dropdown-greeting">Hello, {user?.name || "there"}</p>
                      <Link to="/profile" onClick={() => setAccountOpen(false)}><User size={15} /> My Profile</Link>
                      <Link to="/orders" onClick={() => setAccountOpen(false)}><Package size={15} /> My Orders</Link>
                      <Link to="/wishlist" onClick={() => setAccountOpen(false)}><Heart size={15} /> Wishlist</Link>
                      <Link to="/profile#addresses" onClick={() => setAccountOpen(false)}><MapPin size={15} /> Addresses</Link>
                      <Link to="/customer-support" onClick={() => setAccountOpen(false)}><LifeBuoy size={15} /> Customer Support</Link>
                      <button onClick={handleLogout}><LogOut size={15} /> Logout</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="navbar-guest-actions">
                  <Link to="/login" className="navbar-text-link">Login</Link>
                  <Link to="/register" className="navbar-text-link navbar-text-link-accent">Register</Link>
                </div>
              )}
            </div>

            <Link to="/wishlist" className="btn-icon navbar-icon-count" aria-label={`Wishlist, ${wishlistCount} items`}>
              <Heart size={20} />
              {wishlistCount > 0 && <span className="navbar-count">{wishlistCount}</span>}
            </Link>

            <button className="btn-icon navbar-icon-count" onClick={openDrawer} aria-label={`Shopping bag, ${totalItems} items`}>
              <ShoppingBag size={20} />
              {totalItems > 0 && <span className="navbar-count">{totalItems}</span>}
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="navbar-search-mobile container">
            <SearchBar autoFocus onNavigate={() => setMobileSearchOpen(false)} />
          </div>
        )}

        <nav className="navbar-links-row">
          <div className="container navbar-links">
            <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>

            <div
              className="navbar-mega-trigger"
              ref={megaRef}
              onMouseEnter={() => {
                setMegaOpen(true);
                setCollectionsOpen(false);
              }}
            >
              <button
                className={`navbar-mega-btn ${isJewelleryActive() ? "active" : ""}`}
                aria-haspopup="true"
                aria-expanded={megaOpen}
                onClick={() => {
                  setMegaOpen((prev) => !prev);
                  setCollectionsOpen(false);
                }}
              >
                Jewellery <ChevronDown size={14} />
              </button>
              {megaOpen && <MegaMenu promoProduct={promoProduct} />}
            </div>

            <div
              className="navbar-mega-trigger"
              ref={collectionsRef}
              onMouseEnter={() => {
                setCollectionsOpen(true);
                setMegaOpen(false);
              }}
            >
              <button
                className={`navbar-mega-btn ${isCollectionsActive() ? "active" : ""}`}
                aria-haspopup="true"
                aria-expanded={collectionsOpen}
                onClick={() => {
                  setCollectionsOpen((prev) => !prev);
                  setMegaOpen(false);
                }}
              >
                Collections <ChevronDown size={14} />
              </button>
              {collectionsOpen && <CollectionsMegaMenu />}
            </div>

            <Link 
              to="/products?sort=newest" 
              className={isNewArrivalsActive() ? "active" : ""}
            >
              New Arrivals
            </Link>
            <Link 
              to="/products?discount=true" 
              className={`navbar-offer-link ${isOffersActive() ? "active" : ""}`}
            >
              Offers
            </Link>
          </div>
        </nav>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CartDrawer />
    </>
  );
}

