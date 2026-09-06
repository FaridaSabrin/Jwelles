import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./FestivePopup.css";

// Dynamic Promotion Configuration
const PROMOTION_CONFIG = {
  enabled: true,
  title: "FESTIVE SEASON SPECIAL",
  subtitle: "Celebrate the Festive Season with Jwelles",
  occasion: "Janmashtami & Ganesh Chaturthi",
  discount: "UP TO 20% OFF",
  buttonText: "SHOP NOW",
  buttonLink: "/products",
  autoMinimizeSeconds: 6,
  floatingText: "🎈 FESTIVE SPECIAL",
  floatingBadge: "UP TO 20% OFF"
};

export default function FestivePopup() {
  const [isOpen, setIsOpen] = useState(false); // Large popup open/closed
  const [isMinimized, setIsMinimized] = useState(false); // Floating badge visible

  useEffect(() => {
    if (!PROMOTION_CONFIG.enabled) return;

    // Show popup after a short delay
    const showTimer = setTimeout(() => {
      setIsOpen(true);
    }, 500);

    // Auto-minimize after configured duration
    const minimizeTimer = setTimeout(() => {
      setIsOpen(false);
      setIsMinimized(true);
    }, PROMOTION_CONFIG.autoMinimizeSeconds * 1000 + 500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(minimizeTimer);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true); // Show floating badge when user closes
  };

  const handleMinimizedClick = () => {
    setIsMinimized(false);
    setIsOpen(true); // Reopen the large popup
  };

  if (!PROMOTION_CONFIG.enabled) return null;

  return (
    <>
      {/* Large Center Popup */}
      {isOpen && (
        <div className="promotion-overlay">
          <div className="promotion-popup">
            {/* Decorative elements */}
            <div className="promotion-decorations">
              <div className="balloon balloon-1"></div>
              <div className="balloon balloon-2"></div>
              <div className="balloon balloon-3"></div>
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
              <div className="sparkle sparkle-4"></div>
            </div>

            {/* Close button */}
            <button
              className="promotion-close-btn"
              onClick={handleClose}
              aria-label="Close promotion"
              title="Close"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="promotion-content">
              <div className="promotion-header">
                <span className="sparkle-text">✨</span>
                <h2 className="promotion-title">{PROMOTION_CONFIG.title}</h2>
                <span className="sparkle-text">✨</span>
              </div>

              <div className="promotion-subtitle">
                {PROMOTION_CONFIG.subtitle}
              </div>

              <div className="promotion-occasion">
                <div className="occasion-text">{PROMOTION_CONFIG.occasion}</div>
              </div>

              <div className="promotion-discount">
                <span className="discount-label">UP TO</span>
                <span className="discount-value">
                  {PROMOTION_CONFIG.discount.replace("UP TO ", "")}
                </span>
                <span className="discount-label">OFF</span>
              </div>

              <div className="promotion-cta-text">
                Shop Our Premium Collection
              </div>

              <a href={PROMOTION_CONFIG.buttonLink} className="promotion-cta-button">
                {PROMOTION_CONFIG.buttonText}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Minimized Badge */}
      {isMinimized && !isOpen && (
        <button
          className="floating-promotion-badge"
          onClick={handleMinimizedClick}
          aria-label="Open promotion"
          title="Click to view promotion"
        >
          <div className="badge-icon">🎈</div>
          <div className="badge-content">
            <div className="badge-title">{PROMOTION_CONFIG.floatingText}</div>
            <div className="badge-subtitle">{PROMOTION_CONFIG.floatingBadge}</div>
          </div>
          <div className="badge-indicator">→</div>
        </button>
      )}
    </>
  );
}

