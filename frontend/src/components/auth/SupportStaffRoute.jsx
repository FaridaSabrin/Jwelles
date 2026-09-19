import { Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContextInstance";

/**
 * Frontend route guard for the Support Dashboard.
 * This is a UX layer only — the real authorization is enforced by
 * `IsSupportStaff` on every staff endpoint on the backend.
 */
export default function SupportStaffRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="support-guard-loading">Checking access…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user.is_support_staff) {
    // Do NOT silently drop the user into the customer area.
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}