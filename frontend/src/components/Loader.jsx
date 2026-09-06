import "./Loader.css";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="loader-container" role="status" aria-live="polite">
      <span className="loader-ring" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

