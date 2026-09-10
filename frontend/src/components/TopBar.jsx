import "./TopBar.css";

const MESSAGES = [
  "FREE SHIPPING ON ORDERS ABOVE ₹5,000",
  "100% CERTIFIED & HALLMARKED JEWELLERY",
  "EASY 15-DAY RETURNS",
];

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-track">
        {MESSAGES.map((message, i) => (
          <span className="topbar-item" key={message}>
            {i > 0 && <span className="topbar-dot" aria-hidden="true">•</span>}
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}

