import { TriangleAlert } from "lucide-react";

export default function ErrorState({ title = "Something went wrong", message = "We couldn't load this right now. Please try again.", onRetry }) {
  return (
    <div className="state-block state-error">
      <div className="state-icon">
        <TriangleAlert aria-hidden="true" />
      </div>

      <h3>{title}</h3>
      <p>{message}</p>

      {onRetry && (
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

