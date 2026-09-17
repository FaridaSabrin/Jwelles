import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import ProductImage from "./ProductImage";
import WishlistButton from "./WishlistButton";
import Rating from "./Rating";
import Price from "./Price";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { addToCart, isInCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);

  const primaryImage = product.images?.[0]?.image || product.image;
  const hoverImage = product.images?.[1]?.image;

  const inStock =
    product.stock > 0 && product.is_available !== false;

  const inCart = isInCart(product.id);

  const meta = [product.metal_type, product.purity]
    .filter(Boolean)
    .join(" · ");

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || adding || inCart) return;

    try {
      setAdding(true);

      await addToCart(product);

      toast.success(`${product.name} added to your bag.`);
    } catch (err) {
      toast.error(err.message || "Couldn't add this to your bag.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      {/* PRODUCT */}
      <Link
        to={`/products/${product.id}`}
        className="product-card-link"
        aria-label={`View ${product.name}`}
      >
        {/* IMAGE */}
        <div className="product-image">
          <ProductImage
            src={primaryImage}
            alt={product.name}
            className="product-image-primary"
          />

          {hoverImage && (
            <ProductImage
              src={hoverImage}
              alt=""
              className="product-image-hover"
            />
          )}

          {/* DISCOUNT */}
          {product.discount_percentage > 0 && (
            <span className="product-flag badge badge-gold">
              {Math.round(product.discount_percentage)}% Off
            </span>
          )}

          {/* STOCK */}
          {!inStock && (
            <span className="product-flag product-flag-stock badge badge-muted">
              Out of Stock
            </span>
          )}

          {/* WISHLIST */}
          <WishlistButton
            product={product}
            className="product-wishlist"
          />
        </div>

        {/* PRODUCT INFORMATION */}
        <div className="product-info">
          {product.category && (
            <p className="product-category">
              {product.category}
            </p>
          )}

          <h3>{product.name}</h3>

          <Rating
            value={product.average_rating}
            count={product.review_count}
          />

          <Price
            price={product.price}
            originalPrice={product.original_price}
            discountPercentage={product.discount_percentage}
          />

          {meta && (
            <p className="product-meta">
              {meta}
            </p>
          )}
        </div>
      </Link>

      {/* ACTIONS */}
      <div className="card-actions">
        <button
          type="button"
          className={`btn btn-sm add-to-cart ${
            inCart ? "btn-added" : "btn-primary"
          }`}
          disabled={!inStock || adding || inCart}
          onClick={handleAddToCart}
        >
          {adding ? (
            <span
              className="btn-spinner"
              aria-label="Adding to bag"
            />
          ) : inCart ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <ShoppingBag size={15} aria-hidden="true" />
          )}

          <span>
            {inCart
              ? "Added"
              : inStock
              ? "Add to Bag"
              : "Sold Out"}
          </span>
        </button>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() =>
            navigate(`/products/${product.id}`)
          }
        >
          Quick View
        </button>
      </div>
    </article>
  );
}