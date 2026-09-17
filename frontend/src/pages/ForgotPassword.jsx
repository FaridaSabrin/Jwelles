import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, TriangleAlert, Send } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useToast } from "../hooks/useToast";
import { forgotPassword } from "../services/api";

import "./Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      setLoading(true);
      await forgotPassword(email.trim());
      toast.success(
        "If an account exists with this email, a verification code has been sent."
      );
      navigate("/verify-reset-otp", {
        state: { email: email.trim() },
      });
    } catch (err) {
      console.error("Forgot password failed:", err);
      // Even on error, show generic message to prevent enumeration
      toast.success(
        "If an account exists with this email, a verification code has been sent."
      );
      navigate("/verify-reset-otp", {
        state: { email: email.trim() },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="heading-lg">Forgot Password</h1>
        <p className="text-muted">
          Enter your registered email address and we&apos;ll send you a
          verification code.
        </p>
      </div>

      {error && (
        <div className="auth-alert">
          <TriangleAlert size={16} /> {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input-group">
            <Mail size={16} className="input-leading-icon" />
            <input
              id="email"
              type="email"
              className={`input has-icon ${
                fieldErrors.email ? "has-error" : ""
              }`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <span className="field-error">{fieldErrors.email}</span>
          )}
        </div>

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="btn-spinner" /> Sending…
            </>
          ) : (
            <>
              <Send size={16} /> Send OTP
            </>
          )}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Back to Sign In</Link>
      </p>
    </AuthLayout>
  );
}