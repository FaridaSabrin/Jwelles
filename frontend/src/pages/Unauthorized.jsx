import { Link } from "react-router-dom";
import "./Unauthorized.css";

export default function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <h1>Access denied</h1>
      <p>You don't have permission to view this page.</p>
      <Link to="/" className="unauthorized-link">
        Back to store
      </Link>
    </div>
  );
}