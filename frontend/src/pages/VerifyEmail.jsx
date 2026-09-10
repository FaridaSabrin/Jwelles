import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  RefreshCw,
  TriangleAlert,
  CheckCircle,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useToast } from "../hooks/useToast";
import { verifyEmail, resendOTP } from "../services/api";

import "./Auth.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verified, setVerified] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      // If no email in state, redirect to register
      navigate("/register", { replace: true });
      return;
    }

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    // Cooldown timer
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Clear error when user types
    if (error) {
      setError("");
    }

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle left/right arrows
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus last filled input
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyEmail(email, otpString);

      setVerified(true);
      toast.success("Email verified successfully!");

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login", {
          state: { email, verified: true },
        });
      }, 1500);
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(
        err?.message || "Invalid OTP. Please try again."
      );
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) {
      return;
    }

    setError("");
    setResending(true);

    try {
      await resendOTP(email);

      toast.success("New OTP sent to your email.");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError(
        err?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <AuthLayout>
        <div className="auth-header">
          <div className="verify-success-icon">
            <CheckCircle size={48} />
          </div>

          <h1 className="heading-lg">
            Email Verified!
          </h1>

          <p className="text-muted">
            Your email has been successfully verified.
            Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-header">
        <div className="verify-icon">
          <ShieldCheck size={48} />
        </div>

        <h1 className="heading-lg">
          Verify Your Email
        </h1>

        <p className="text-muted">
          We sent a 6-digit verification code to{" "}
          <strong>{email}</strong>
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
        onSubmit={handleVerify}
        noValidate
      >
        {/* OTP INPUT */}

        <div className="field">
          <label htmlFor="otp-0">
            Enter Verification Code
          </label>

          <div
            className="otp-input-group"
            onPaste={handleOtpPaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                className={`otp-input ${
                  error ? "has-error" : ""
                }`}
                value={digit}
                onChange={(e) =>
                  handleOtpChange(index, e.target.value)
                }
                onKeyDown={(e) =>
                  handleOtpKeyDown(index, e)
                }
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* VERIFY BUTTON */}

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={loading || resending}
        >
          {loading && (
            <span className="btn-spinner" />
          )}

          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>
      </form>

      {/* RESEND OTP */}

      <div className="verify-resend">
        <p className="text-muted">
          Didn't receive the code?
        </p>

        <button
          className="btn btn-link"
          onClick={handleResend}
          disabled={cooldown > 0 || resending || loading}
        >
          {resending ? (
            <>
              <RefreshCw
                size={16}
                className="spin"
              />
              Sending...
            </>
          ) : cooldown > 0 ? (
            <>
              <RefreshCw size={16} />
              Resend OTP in {cooldown}s
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Resend OTP
            </>
          )}
        </button>
      </div>

      <p className="auth-switch">
        Wrong email?{" "}
        <Link to="/register">
          Create a new account
        </Link>
      </p>
    </AuthLayout>
  );
}