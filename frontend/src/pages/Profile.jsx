import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { getOrders } from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { formatINR } from "../utils/formatINR";
import { ListRowSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import "./Profile.css";

const TABS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "orders", label: "Orders", icon: Package },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState(() => (location.hash ? location.hash.replace("#", "") : "overview"));
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  const addresses = useMemo(() => {
    const seen = new Set();
    return orders
      .map((o) => o.shipping_address)
      .filter((a) => {
        if (!a) return false;
        const key = `${a.line1}-${a.pincode}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [orders]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container profile-page">
      <Breadcrumbs items={[{ label: "My Account" }]} />

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-identity">
            <div className="profile-avatar">{(user?.name || user?.email || "?").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user?.name || "Customer"}</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <nav className="profile-nav">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button key={key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>
                <Icon size={16} /> {label}
              </button>
            ))}
            <button onClick={handleLogout} className="profile-nav-logout">
              <LogOut size={16} /> Logout
            </button>
          </nav>
        </aside>

        <div className="profile-content">
          {tab === "overview" && (
            <div className="profile-panel">
              <h1 className="heading-lg">Welcome, {user?.name?.split(" ")[0] || "there"}</h1>
              <p className="text-muted">Here's a quick look at your account.</p>

              <div className="profile-stats">
                <div className="profile-stat">
                  <strong>{orders.length}</strong>
                  <span>Orders</span>
                </div>
                <div className="profile-stat">
                  <strong>{wishlistItems.length}</strong>
                  <span>Wishlist Items</span>
                </div>
                <div className="profile-stat">
                  <strong>{addresses.length}</strong>
                  <span>Saved Addresses</span>
                </div>
              </div>

              <div className="profile-quick-links">
                <button onClick={() => setTab("orders")} className="profile-quick-link">
                  <span><Package size={16} /> View Recent Orders</span>
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => setTab("wishlist")} className="profile-quick-link">
                  <span><Heart size={16} /> View Wishlist</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="profile-panel">
              <h2 className="heading-md">My Orders</h2>
              {loading && <ListRowSkeleton count={3} />}
              {!loading && orders.length === 0 && (
                <EmptyState icon={Package} title="No orders yet" actionLabel="Start Shopping" actionTo="/products" />
              )}
              {!loading && orders.length > 0 && (
                <ul className="order-list">
                  {orders.slice(0, 6).map((order) => (
                    <li key={order.id}>
                      <Link to={`/orders/${order.id}`} className="order-card">
                        <div className="order-card-top">
                          <div>
                            <strong>Order #{order.order_id}</strong>
                            <span className="text-muted">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
                          </div>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <div className="order-card-bottom">
                          <span>{order.items?.length || 0} items</span>
                          <strong>{formatINR(order.total)}</strong>
                          <ChevronRight size={16} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {orders.length > 6 && <Link to="/orders" className="btn btn-outline" style={{ marginTop: 16 }}>View All Orders</Link>}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="profile-panel">
              <h2 className="heading-md">My Wishlist</h2>
              {wishlistItems.length === 0 ? (
                <EmptyState icon={Heart} title="Your wishlist is empty" actionLabel="Explore Jewellery" actionTo="/products" />
              ) : (
                <ul className="profile-wishlist-list">
                  {wishlistItems.map((item) => (
                    <li key={item.id}>
                      <Link to={`/products/${item.product.id}`}>{item.product.name}</Link>
                      <span>{formatINR(item.product.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/wishlist" className="btn btn-outline" style={{ marginTop: 16 }}>Open Wishlist</Link>
            </div>
          )}

          {tab === "addresses" && (
            <div className="profile-panel">
              <h2 className="heading-md">Saved Addresses</h2>
              <p className="text-muted" style={{ marginBottom: 16 }}>Addresses used on your previous orders.</p>

              {addresses.length === 0 ? (
                <EmptyState icon={MapPin} title="No addresses yet" message="Addresses you use at checkout will appear here." />
              ) : (
                <div className="address-grid">
                  {addresses.map((a) => (
                    <div className="address-card" key={`${a.line1}-${a.pincode}`}>
                      <strong>{a.full_name}</strong>
                      <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.state} {a.pincode}<br />{a.country}</p>
                      <span className="text-muted">{a.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


