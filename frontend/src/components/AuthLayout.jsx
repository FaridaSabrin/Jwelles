import { Gem } from "lucide-react";
import "./AuthLayout.css";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <Gem size={34} aria-hidden="true" />
          <blockquote>
            "Jewellery has the power to be that one little thing that makes you feel unique."
          </blockquote>
          <span className="auth-visual-brand">Jwelles — Fine Jewellery</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-wrap">{children}</div>
      </div>
    </div>
  );
}

