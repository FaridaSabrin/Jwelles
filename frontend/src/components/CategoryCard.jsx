import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductImage from "./ProductImage";
import "./CategoryCard.css";

export default function CategoryCard({ category, queryKey = "category" }) {
  // Use the canonical slug (e.g. "rings", "earrings") rather than the
  // display name (e.g. "Rings"), because the backend filters on the
  // slug value stored in Product.category.
  //
  // Fallback to `name` keeps this component working if a legacy category
  // object without a slug ever reaches it.
  const identifier = category.slug || category.name;

  return (
    <Link
      to={`/products?${queryKey}=${encodeURIComponent(identifier)}`}
      className="category-card"
    >
      <div className="category-card-image">
        <ProductImage src={category.image} alt={category.name} />
      </div>
      <div className="category-card-label">
        <span>{category.name}</span>
        <ArrowRight size={15} aria-hidden="true" />
      </div>
    </Link>
  );
}