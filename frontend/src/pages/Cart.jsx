import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../hooks/useCart";
import ProductImage from "../components/ProductImage";
import { formatINR } from "../utils/formatINR";
import EmptyState from "../components/EmptyState";
import Breadcrumbs from "../components/Breadcrumbs";
import "./Cart.css";

const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING = 199;

export default function Cart() {
  const { cartItems, removeFromCart, increaseQuantity, decreaseQuantity, cartTotal } = useCart();

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : FLAT_SHIPPING;
  const estimatedTotal = cartTotal + shipping;

  return (
    <div className="container cart-page">
      <Breadcrumbs items={[{ label: "Shopping Bag" }]} />
      <h1 className="heading-lg">Your Shopping Bag</h1>

      {cartItems.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="Looks like you haven't added anything yet. Explore our collections to find something beautiful."
          actionLabel="Continue Shopping"
          actionTo="/products"
        />
      ) : (
        <div className="cart-layout">
          <ul className="cart-list">
            {cartItems.map((raw) => {
              const item = raw.product ? { ...raw.product, cartItemId: raw.id, quantity: raw.quantity } : raw;
              const image = item.images?.[0]?.image || item.image;
              const meta = [item.metal_type, item.purity].filter(Boolean).join(" · ");

              return (
                <li className="cart-row" key={item.cartItemId || item.id}>
                  <Link to={`/products/${item.id}`} className="cart-row-image">
                    <ProductImage src={image} alt={item.name} />
                  </Link>

                  <div className="cart-row-info">
                    <Link to={`/products/${item.id}`} className="cart-row-name">{item.name}</Link>
                    {meta && <span className="cart-row-meta">{meta}</span>}

                    <div className="cart-row-price-mobile">{formatINR(item.price)}</div>

                    <div className="cart-row-bottom">
                      <div className="cart-drawer-qty">
                        <button onClick={() => decreaseQuantity(raw)} disabled={item.quantity <= 1} aria-label="Decrease quantity">
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(raw)} disabled={item.quantity >= (item.stock ?? Infinity)} aria-label="Increase quantity">
                          <Plus size={13} />
                        </button>
                      </div>

                      <button className="cart-row-remove" onClick={() => removeFromCart(item.cartItemId || item.id)}>
                        <X size={13} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-row-price">
                    <strong>{formatINR(item.price * item.quantity)}</strong>
                    {item.quantity > 1 && <span>{formatINR(item.price)} each</span>}
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="cart-summary">
            <h2 className="heading-sm">Order Summary</h2>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatINR(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
            </div>
            <p className="cart-summary-hint">Discounts &amp; tax, if applicable, are calculated at checkout.</p>

            <hr className="divider" />

            <div className="cart-summary-row cart-summary-total">
              <span>Estimated Total</span>
              <strong>{formatINR(estimatedTotal)}</strong>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-block btn-lg">Proceed to Checkout</Link>
            <Link to="/products" className="btn btn-ghost cart-continue"><ArrowLeft size={14} /> Continue Shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}


