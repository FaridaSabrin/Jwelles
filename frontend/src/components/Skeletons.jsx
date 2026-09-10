import "./Skeletons.css";

export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-line" style={{ width: "50%" }} />
      <div className="skeleton skeleton-line" style={{ width: "80%" }} />
      <div className="skeleton skeleton-line" style={{ width: "40%" }} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="skeleton-category">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-line" style={{ width: "60%" }} />
    </div>
  );
}

export function CategoryGridSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-category-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="skeleton-details">
      <div className="skeleton skeleton-gallery" />
      <div className="skeleton-details-info">
        <div className="skeleton skeleton-line" style={{ width: "35%" }} />
        <div className="skeleton skeleton-line" style={{ width: "75%", height: 32 }} />
        <div className="skeleton skeleton-line" style={{ width: "45%" }} />
        <div className="skeleton skeleton-line" style={{ width: "90%" }} />
        <div className="skeleton skeleton-line" style={{ width: "90%" }} />
        <div className="skeleton skeleton-line" style={{ width: "60%" }} />
        <div className="skeleton skeleton-block" />
      </div>
    </div>
  );
}

export function ListRowSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton skeleton-row" key={i} />
      ))}
    </div>
  );
}

