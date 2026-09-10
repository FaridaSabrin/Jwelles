import { Star, StarHalf } from "lucide-react";

export default function Rating({ value = 0, count, size = 14, showCount = true }) {
  const rounded = Math.round(Number(value) * 2) / 2;
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) stars.push(<Star key={i} size={size} fill="currentColor" strokeWidth={0} />);
    else if (rounded + 0.5 === i) stars.push(<StarHalf key={i} size={size} fill="currentColor" strokeWidth={0} />);
    else stars.push(<Star key={i} size={size} fill="none" strokeWidth={1.5} />);
  }

  if (!value && !count) {
    return (
      <span className="rating-stars rating-new" aria-label="No reviews yet">
        <span className="badge badge-muted">New</span>
      </span>
    );
  }

  return (
    <span className="rating-stars" aria-label={`Rated ${value} out of 5`}>
      {stars}
      {showCount && <span className="rating-count">({count ?? 0})</span>}
    </span>
  );
}

