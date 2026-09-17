
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Store,
  LogOut,
  Headphones,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextInstance";
import "./SupportDashboardLayout.css";

export default function SupportDashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="sd-shell">
      {/* Sidebar */}
      <aside className="sd-sidebar">
        <div className="sd-brand">
          <div className="sd-brand-title">Jwelles Support</div>
          <div className="sd-brand-subtitle">SUPPORT DESK</div>
        </div>

        <nav className="sd-nav">
          <NavLink
            to="/support-dashboard"
            end
            className="sd-nav-link"
          >
            <LayoutDashboard size={18} strokeWidth={1.8} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/support-dashboard/tickets"
            className="sd-nav-link"
          >
            <Ticket size={18} strokeWidth={1.8} />
            <span>Tickets</span>
          </NavLink>
        </nav>

        <div className="sd-nav-bottom">
          <NavLink to="/" className="sd-nav-link">
            <Store size={18} strokeWidth={1.8} />
            <span>Back to Store</span>
          </NavLink>

          <button
            type="button"
            className="sd-nav-link sd-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="sd-main">
        <header className="sd-topbar">
          <div className="sd-topbar-title">
            <Headphones size={20} strokeWidth={1.8} />
            <span>Customer Support</span>
          </div>

          <div className="sd-topbar-profile">
            <div className="sd-avatar">
              {(user?.name || user?.email || "S").charAt(0).toUpperCase()}
            </div>

            <div className="sd-profile-info">
              <div className="sd-profile-name">
                {user?.name || "Support Agent"}
              </div>

              <div className="sd-profile-badge">
                Support Team
              </div>
            </div>
          </div>
        </header>

        <main className="sd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

