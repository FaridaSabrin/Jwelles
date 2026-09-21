import { useEffect, useRef, useState } from "react";
import {
  Share2,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Mail,
  Check,
} from "lucide-react";

export default function ShareButton({ product, className = "" }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef(null);

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${product.id}`
      : "";

  const shareText = `Check out ${product.name} on JWELLES`;

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Reset "copied" indicator after 2s
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleShareClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch (err) {
        // User cancelled native share — do nothing
        if (err && err.name === "AbortError") return;
        // Any other native-share failure: fall back to menu
        setOpen((v) => !v);
      }
      return;
    }

    setOpen((v) => !v);
  };

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(productUrl);
        setCopied(true);
        return;
      }

      // Legacy fallback
      const textarea = document.createElement("textarea");
      textarea.value = productUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (ok) setCopied(true);
    } catch {
      // Silent failure — user can still copy manually
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://wa.me/?text=${encodeURIComponent(
      `${shareText} ${productUrl}`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleFacebook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      productUrl
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleTwitter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(productUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const handleEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const subject = encodeURIComponent(`Check out ${product.name} on JWELLES`);
    const body = encodeURIComponent(
      `I thought you might like this:\n\n${product.name}\n${productUrl}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  return (
    <div className={`share-wrapper ${className}`} ref={wrapperRef}>
      <button
        type="button"
        className="share-btn"
        aria-label="Share product"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleShareClick}
      >
        <Share2 size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="share-menu" role="menu" aria-label="Share options">
          <button
            type="button"
            className="share-option"
            role="menuitem"
            onClick={handleCopyLink}
          >
            {copied ? (
              <Check size={14} aria-hidden="true" />
            ) : (
              <LinkIcon size={14} aria-hidden="true" />
            )}
            <span>{copied ? "Link copied" : "Copy Link"}</span>
          </button>

          <button
            type="button"
            className="share-option"
            role="menuitem"
            onClick={handleWhatsApp}
          >
            <MessageCircle size={14} aria-hidden="true" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            className="share-option"
            role="menuitem"
            onClick={handleFacebook}
          >
            <Share2 size={14} aria-hidden="true" />
            <span>Facebook</span>
          </button>

          <button
            type="button"
            className="share-option"
            role="menuitem"
            onClick={handleTwitter}
          >
            <Send size={14} aria-hidden="true" />
            <span>X / Twitter</span>
          </button>

          <button
            type="button"
            className="share-option"
            role="menuitem"
            onClick={handleEmail}
          >
            <Mail size={14} aria-hidden="true" />
            <span>Email</span>
          </button>
        </div>
      )}
    </div>
  );
}