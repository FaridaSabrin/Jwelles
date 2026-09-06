import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  TriangleAlert,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

import "./Auth.css";

function passwordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return score;
}

const STRENGTH_LABEL = [
  "Too Short",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];

export default function Register() {
  const navigate = useNavigate();

  const { register } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));

    // Remove field error while typing
    setFieldErrors((current) => ({
      ...current,
      [key]: "",
    }));
  };

  const strength = passwordStrength(form.password);

  const validate = () => {
    const errors = {};

    if (!form.firstName.trim()) {
      errors.firstName = "First name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (form.password.length < 8) {
      errors.password =
        "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword =
        "Please confirm your password.";
    } else if (
      form.confirmPassword !== form.password
    ) {
      errors.confirmPassword =
        "Passwords do not match.";
    }

    if (!agreed) {
      errors.agreed =
        "Please accept the Terms & Conditions.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validate()) {
      return;
    }

    const fullName =
      `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    try {
      setLoading(true);

      await register(
        fullName,
        form.email.trim(),
        form.password
      );

      toast.success(
        "Welcome to Jwelles — your account is ready."
      );

      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err?.message ||
          "Couldn't create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <h1 className="heading-lg">
          Create Account
        </h1>

        <p className="text-muted">
          Join Jwelles for a personalised jewellery
          journey.
        </p>
      </div>

      {error && (
        <div className="auth-alert">
          <TriangleAlert size={16} />
          {error}
        </div>
      )}

      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* NAME */}

        <div className="auth-name-row">
          <div className="field">
            <label htmlFor="firstName">
              First Name
            </label>

            <div className="input-group">
              <User
                size={16}
                className="input-leading-icon"
              />

              <input
                id="firstName"
                className={`input has-icon ${
                  fieldErrors.firstName
                    ? "has-error"
                    : ""
                }`}
                placeholder="First Name"
                value={form.firstName}
                onChange={set("firstName")}
                autoComplete="given-name"
              />
            </div>

            {fieldErrors.firstName && (
              <span className="field-error">
                {fieldErrors.firstName}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="lastName">
              Last Name
            </label>

            <input
              id="lastName"
              className="input"
              placeholder="Last Name"
              value={form.lastName}
              onChange={set("lastName")}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* EMAIL */}

        <div className="field">
          <label htmlFor="email">
            Email
          </label>

          <div className="input-group">
            <Mail
              size={16}
              className="input-leading-icon"
            />

            <input
              id="email"
              type="email"
              className={`input has-icon ${
                fieldErrors.email
                  ? "has-error"
                  : ""
              }`}
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />
          </div>

          {fieldErrors.email && (
            <span className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* PASSWORD */}

        <div className="field">
          <label htmlFor="password">
            Password
          </label>

          <div className="input-group">
            <Lock
              size={16}
              className="input-leading-icon"
            />

            <input
              id="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              className={`input has-icon ${
                fieldErrors.password
                  ? "has-error"
                  : ""
              }`}
              placeholder="Create a password"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />

            <button
              type="button"
              className="input-adorn"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {form.password && (
            <div className="password-strength">
              <div className="password-strength-track">
                <span
                  style={{
                    width: `${
                      (strength / 4) * 100
                    }%`,
                  }}
                  data-level={strength}
                />
              </div>

              <small>
                {STRENGTH_LABEL[strength]}
              </small>
            </div>
          )}

          {fieldErrors.password && (
            <span className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </div>

        {/* CONFIRM PASSWORD */}

        <div className="field">
          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            type={
              showPassword
                ? "text"
                : "password"
            }
            className={`input ${
              fieldErrors.confirmPassword
                ? "has-error"
                : ""
            }`}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            autoComplete="new-password"
          />

          {fieldErrors.confirmPassword && (
            <span className="field-error">
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        {/* TERMS */}

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) =>
              setAgreed(e.target.checked)
            }
          />

          <span>
            I agree to the{" "}
            <Link to="/terms">
              Terms &amp; Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {fieldErrors.agreed && (
          <span className="field-error">
            {fieldErrors.agreed}
          </span>
        )}

        {/* SUBMIT */}

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={loading}
        >
          {loading && (
            <span className="btn-spinner" />
          )}

          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account?{" "}
        <Link to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
