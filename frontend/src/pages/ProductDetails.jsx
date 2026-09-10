import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, ChevronDown, Minus, Plus, ShoppingBag, Zap, Star } from "lucide-react";
import { getProduct, getProducts, submitReview } from "../services/api";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductGallery from "../components/ProductGallery";
import Rating from "../components/Rating";
import Price from "../components/Price";
import WishlistButton from "../components/WishlistButton";
import ProductCard from "../components/ProductCard";
import { ProductDetailsSkeleton } from "../components/Skeletons";
import ErrorState from "../components/ErrorState";
import "./ProductDetails.css";

function Accordion({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pd-accordion">
      <button className="pd-accordion-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {title}
        <ChevronDown size={16} className={open ? "rotated" : ""} />
      </button>
      {open && <div className="pd-accordion-body">{children}</div>}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [related, setRelated] = useState([]);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [review, setReview] = useState({ rating: 5, title: "", comment: "" });
  const [reviewState, setReviewState] = useState({ submitting: false, message: "", success: false });

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    setQuantity(1);
    setSize("");

    getProduct(id)
      .then((data) => {
        setProduct(data);
        if (data.sizes?.length) setSize(data.sizes[0]);
        return getProducts({ category: data.category, available: "true" });
      })
      .then((list) => { if (list) setRelated(list.filter((p) => p.id !== Number(id)).slice(0, 4)); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  if (loading) {
    return (
      <div className="container pd-page">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return <div className="container"><ErrorState title="Product not found" message="This product may have been removed or is unavailable." onRetry={load} /></div>;
  }

  const inStock = product.stock > 0 && product.is_available !== false;
  const inCart = isInCart(product.id);
  const images = [product.images?.length ? product.images.map((i) => i.image) : [product.image]].flat().filter(Boolean);

  const handleAddToCart = async () => {
    if (!inStock || inCart) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      toast.success(`${product.name} added to your bag.`);
    } catch (err) {
      toast.error(err.message || "Couldn't add this to your bag.");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!inStock) return;
    try {
      setAdding(true);
      await addToCart(product, quantity);
      navigate("/checkout");
    } catch (err) {
      toast.error(err.message || "Couldn't proceed to checkout.");
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewState({ submitting: true, message: "", success: false });
    try {
      await submitReview({ product_id: product.id, ...review });
      setReviewState({ submitting: false, message: "Thank you — your review has been submitted.", success: true });
      setReview({ rating: 5, title: "", comment: "" });
    } catch (err) {
      setReviewState({ submitting: false, message: err.message || "Couldn't submit your review.", success: false });
    }
  };

  const specs = [
    ["Metal", product.metal_type],
    ["Purity", product.purity],
    ["Weight", product.weight ? `${product.weight} g` : ""],
    ["Material", product.material],
    ["Stone", product.stone_type],
    ["Gender", product.gender],
  ].filter(([, v]) => v);

  return (
    <div className="container pd-page">
      <Breadcrumbs items={[
        { label: "Jewellery", to: "/products" },
        ...(product.category ? [{ label: product.category, to: `/products?category=${encodeURIComponent(product.category)}` }] : []),
        { label: product.name },
      ]} />

      <div className="pd-layout">
        <ProductGallery images={images} name={product.name} />

        <div className="pd-info">
          {product.category && <p className="product-category">{product.category}</p>}
          <h1 className="heading-lg">{product.name}</h1>

          <div className="pd-rating-row">
            <Rating value={product.average_rating} count={product.review_count} />
            <span className="pd-sku">SKU: #{product.id}</span>
          </div>

          <Price price={product.price} originalPrice={product.original_price} discountPercentage={product.discount_percentage} size="lg" />

          <p className={`pd-stock ${inStock ? "in" : "out"}`}>
            {inStock ? `In Stock — ${product.stock} available` : "Out of Stock"}
          </p>

          {product.description && <p className="pd-description">{product.description}</p>}

          {product.sizes?.length > 0 && (
            <div className="pd-sizes">
              <span className="pd-field-label">Size</span>
              <div className="pd-size-options">
                {product.sizes.map((s) => (
                  <button key={s} className={`pd-size-option ${size === s ? "is-active" : ""}`} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-qty-row">
            <span className="pd-field-label">Quantity</span>
            <div className="cart-drawer-qty pd-qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="pd-actions">
            <button className={`btn btn-lg ${inCart ? "btn-added" : "btn-primary"}`} disabled={!inStock || adding || inCart} onClick={handleAddToCart}>
              {adding ? <span className="btn-spinner" /> : inCart ? <Check size={16} /> : <ShoppingBag size={16} />} {inCart ? "Added" : "Add to Cart"}
            </button>
            <button className="btn btn-gold btn-lg" disabled={!inStock || adding} onClick={handleBuyNow}>
              <Zap size={16} /> Buy Now
            </button>
            <WishlistButton product={product} className="pd-wishlist-btn" />
          </div>

          <div className="pd-accordions">
            <Accordion title="Description" defaultOpen>
              <p>{product.description || "No description provided for this piece."}</p>
            </Accordion>

            {specs.length > 0 && (
              <Accordion title="Specifications">
                <dl className="pd-spec-list">
                  {specs.map(([label, val]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              </Accordion>
            )}

            <Accordion title="Material & Care">
              <p>Store your jewellery in a dry place, away from direct sunlight and moisture. Avoid contact with perfumes and lotions. Clean gently with a soft, lint-free cloth to preserve shine.</p>
            </Accordion>

            <Accordion title="Shipping">
              <p>Free shipping on orders above ₹5,000. Orders are dispatched within 24–48 hours and typically arrive within 3–6 business days.</p>
            </Accordion>

            <Accordion title="Returns">
              <p>Unworn, undamaged items may be returned within 15 days of delivery in their original packaging.</p>
            </Accordion>

            <Accordion title={`Reviews (${product.review_count || 0})`}>
              <div className="pd-reviews-summary">
                <Rating value={product.average_rating} count={product.review_count} size={16} />
                <span>{product.average_rating ? `${product.average_rating} out of 5` : "No ratings yet"}</span>
              </div>

              {isAuthenticated ? (
                <form className="pd-review-form" onSubmit={handleReviewSubmit}>
                  <div className="pd-review-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => setReview((r) => ({ ...r, rating: n }))} aria-label={`${n} stars`}>
                        <Star size={20} fill={n <= review.rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder="Review title (optional)"
                    value={review.title}
                    onChange={(e) => setReview((r) => ({ ...r, title: e.target.value }))}
                  />
                  <textarea
                    className="textarea"
                    placeholder="Share your experience with this product…"
                    value={review.comment}
                    onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                  />
                  <button className="btn btn-secondary btn-sm" type="submit" disabled={reviewState.submitting}>
                    {reviewState.submitting ? "Submitting…" : "Submit Review"}
                  </button>
                  {reviewState.message && (
                    <p className={reviewState.success ? "field-hint" : "field-error"}>{reviewState.message}</p>
                  )}
                </form>
              ) : (
                <p className="text-muted">Sign in to write a review for this product.</p>
              )}
            </Accordion>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pd-related">
          <div className="section-heading align-left">
            <span className="eyebrow">You May Also Like</span>
            <h2 className="heading-md">Related Pieces</h2>
          </div>
          <div className="product-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

