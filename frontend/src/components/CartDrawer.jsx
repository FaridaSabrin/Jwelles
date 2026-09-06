import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "../hooks/useCart";
import ProductImage from "./ProductImage";
import { formatINR } from "../utils/formatINR";
import EmptyState from "./EmptyState";
import "./CartDrawer.css";

export default function CartDrawer() {
  const { cartItems, drawerOpen, closeDrawer, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  useEffect(() => {
    document.body.classList.toggle("scroll-lock", drawerOpen);
    return () => document.body.classList.remove("scroll-lock");
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  return (
    <div className="drawer-overlay" onClick={closeDrawer}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()} aria-label="Shopping bag">
        <header className="cart-drawer-header">
          <h2>Your Bag ({cartItems.length})</h2>
          <button className="btn-icon" onClick={closeDrawer} aria-label="Close bag">
            <X size={20} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your bag is empty"
            message="Explore our collections and add something beautiful."
            actionLabel="Shop Now"
            actionTo="/products"
            onAction={closeDrawer}
          />
        ) : (
          <>
            <ul className="cart-drawer-list">
              {cartItems.map((raw) => {
                const item = raw.product ? { ...raw.product, cartItemId: raw.id, quantity: raw.quantity } : raw;
                const image = item.images?.[0]?.image || item.image;

                return (
                  <li className="cart-drawer-item" key={item.cartItemId || item.id}>
                    <div className="cart-drawer-image">
                      <ProductImage src={image} alt={item.name} />
                    </div>

                    <div className="cart-drawer-info">
                      <span className="cart-drawer-name">{item.name}</span>
                      <span className="cart-drawer-price">{formatINR(item.price)}</span>

                      <div className="cart-drawer-qty">
                        <button onClick={() => decreaseQuantity(raw)} aria-label="Decrease quantity" disabled={item.quantity <= 1}>
                          <Minus size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(raw)} aria-label="Increase quantity" disabled={item.quantity >= (item.stock ?? Infinity)}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <button className="cart-drawer-remove" onClick={() => removeFromCart(item.cartItemId || item.id)} aria-label={`Remove ${item.name}`}>
                      <X size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <footer className="cart-drawer-footer">
              <div className="cart-drawer-subtotal">
                <span>Subtotal</span>
                <strong>{formatINR(cartTotal)}</strong>
              </div>
              <p className="cart-drawer-note">Shipping, discounts & tax are calculated at checkout.</p>

              <Link to="/cart" className="btn btn-outline btn-block" onClick={closeDrawer}>View Bag</Link>
              <Link to="/checkout" className="btn btn-primary btn-block" onClick={closeDrawer}>Checkout</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}


