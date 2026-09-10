import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="state-block">
      {Icon && (
        <div className="state-icon">
          <Icon aria-hidden="true" />
        </div>
      )}

      <h3>{title}</h3>
      {message && <p>{message}</p>}

      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

