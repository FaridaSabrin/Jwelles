import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  RefreshCw,
  TriangleAlert,
  ArrowLeft,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useToast } from "../hooks/useToast";
import { verifyResetOTP, resendResetOTP } from "../services/api";

import "./Auth.css";

export default function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
      return;
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((p) => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    if (error) setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
      const data = await verifyResetOTP(email, otpString);
      toast.success("OTP verified! Please set your new password.");

      navigate("/reset-password", {
        state: { resetToken: data.reset_token, email },
      });
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError(err?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    setError("");
    setResending(true);

    try {
      await resendResetOTP(email);
      toast.success("New OTP sent to your email.");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error("Resend OTP failed:", err);
      setError(err?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <div className="verify-icon">
          <ShieldCheck size={48} />
        </div>

        <h1 className="heading-lg">Verify Your Email</h1>

        <p className="text-muted">
          Enter the 6-digit verification code sent to{" "}
          <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div className="auth-alert">
          <TriangleAlert size={16} />
          {error}
        </div>
      )}

      <form className="auth-form" onSubmit={handleVerify} noValidate>
        <div className="field">
          <label htmlFor="otp-0">OTP</label>
          <div className="otp-input-group" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                className={`otp-input ${error ? "has-error" : ""}`}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-lg btn-block"
          type="submit"
          disabled={loading || resending}
        >
          {loading && <span className="btn-spinner" />}
          {loading ? "Verifying…" : "Verify OTP"}
        </button>
      </form>

      <div className="verify-resend">
        <p className="text-muted">Didn&apos;t receive the code?</p>
        <button
          className="btn btn-link"
          onClick={handleResend}
          disabled={cooldown > 0 || resending || loading}
          type="button"
        >
          {resending ? (
            <>
              <RefreshCw size={16} className="spin" /> Sending…
            </>
          ) : cooldown > 0 ? (
            <>
              <RefreshCw size={16} /> Resend OTP in {cooldown}s
            </>
          ) : (
            <>
              <RefreshCw size={16} /> Resend OTP
            </>
          )}
        </button>
      </div>

      <p className="auth-switch">
        <Link to="/forgot-password" className="btn-ghost auth-inline-link">
          <ArrowLeft size={14} /> Back
        </Link>
      </p>
    </AuthLayout>
  );
}