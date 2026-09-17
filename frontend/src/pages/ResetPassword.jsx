import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  TriangleAlert,
  CheckCircle,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useToast } from "../hooks/useToast";
import { resetPassword } from "../services/api";

import "./Auth.css";

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABEL = ["Too Short", "Weak", "Fair", "Good", "Strong"];

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const resetToken = location.state?.resetToken || "";
  const email = location.state?.email || "";

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const strength = passwordStrength(form.newPassword);

  const validate = () => {
    const errors = {};
    if (!form.newPassword) {
      errors.newPassword = "Password is required.";
    } else if (form.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);

    try {
      await resetPassword({
        reset_token: resetToken,
        new_password: form.newPassword,
        confirm_password: form.confirmPassword,
      });

      setSuccess(true);
      toast.success("Password reset successfully.");
    } catch (err) {
      console.error("Password reset failed:", err);
      setError(err?.message || "Couldn't reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="auth-header">
          <div className="verify-success-icon">
            <CheckCircle size={48} />
          </div>
          <h1 className="heading-lg">Password Reset Successfully</h1>
          <p className="text-muted">
            Your password has been changed. You can now sign in with your new
            password.
          </p>
        </div>

        <Link
          to="/login"
          className="btn btn-primary btn-lg btn-block"
          style={{ marginTop: "var(--sp-4)" }}
        >
          Go to Login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="heading-lg">Create New Password</h1>
        <p className="text-muted">
          Choose a strong password for {email || "your account"}.
        </p>
      </div>

      {error && (
        <div className="auth-alert">
          <TriangleAlert size={16} /> {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="newPassword">New Password</label>
          <div className="input-group">
            <Lock size={16} className="input-leading-icon" />
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              className={`input has-icon ${
                fieldErrors.newPassword ? "has-error" : ""
              }`}
              placeholder="Enter new password"
              value={form.newPassword}
              onChange={set("newPassword")}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-adorn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {form.newPassword && (
            <div className="password-strength">
              <div className="password-strength-track">
                <span
                  style={{ width: `${(strength / 4) * 100}%` }}
                  data-level={strength}
                />
              </div>
              <small>{STRENGTH_LABEL[strength]}</small>
            </div>
          )}

          {fieldErrors.newPassword && (
            <span className="field-error">{fieldErrors.newPassword}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-group">
            <Lock size={16} className="input-leading-icon" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`input has-icon ${
                fieldErrors.confirmPassword ? "has-error" : ""
              }`}
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              autoComplete="new-password"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <span className="field-error">{fieldErrors.confirmPassword}</span>
          )}
        </div>

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={loading}
        >
          {loading && <span className="btn-spinner" />}
          {loading ? "Resetting…" : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}