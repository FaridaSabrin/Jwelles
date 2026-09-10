import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductImage from "./ProductImage";
import "./CategoryCard.css";

export default function CategoryCard({ category, queryKey = "category" }) {
  return (
    <Link to={`/products?${queryKey}=${encodeURIComponent(category.name)}`} className="category-card">
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

