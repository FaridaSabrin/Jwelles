import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, TriangleAlert } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email address.";
    if (!form.password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="heading-lg">Welcome Back</h1>
        <p className="text-muted">Sign in to continue your jewellery journey.</p>
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
              className={`input has-icon ${fieldErrors.email ? "has-error" : ""}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-group">
            <Lock size={16} className="input-leading-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`input has-icon ${fieldErrors.password ? "has-error" : ""}`}
              placeholder="Enter your password"
              value={form.password}
              onChange={set("password")}
              autoComplete="current-password"
            />
            <button type="button" className="input-adorn" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
        </div>

        <div className="auth-row auth-row-end">
          <Link to="/contact" className="btn-ghost auth-inline-link">Forgot password?</Link>
        </div>

        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
          {loading && <span className="btn-spinner" />} {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </AuthLayout>
  );
}

