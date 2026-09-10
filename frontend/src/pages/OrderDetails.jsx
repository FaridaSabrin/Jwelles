import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PartyPopper, MapPin, Calendar } from "lucide-react";
import { getOrder } from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import OrderStatusBadge from "../components/OrderStatusBadge";
import ProductImage from "../components/ProductImage";
import ErrorState from "../components/ErrorState";
import { ProductDetailsSkeleton } from "../components/Skeletons";
import { formatINR } from "../utils/formatINR";
import "./OrderDetails.css";

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced = Boolean(location.state?.justPlaced);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOrder(id).then(setOrder).catch(() => setError(true)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  if (loading) return <div className="container"><ProductDetailsSkeleton /></div>;
  if (error || !order) return <div className="container"><ErrorState title="Order not found" onRetry={load} /></div>;

  const addr = order.shipping_address;

  return (
    <div className="container order-details-page">
      <Breadcrumbs items={[{ label: "My Orders", to: "/orders" }, { label: `#${order.order_id}` }]} />

      {justPlaced && (
        <div className="order-success-banner">
          <PartyPopper size={26} aria-hidden="true" />
          <div>
            <h1 className="heading-lg">Thank You for Your Order!</h1>
            <p>Your order has been placed successfully. A confirmation has been sent to {order.shipping_address?.email}.</p>
          </div>
        </div>
      )}

      <div className="order-details-head">
        <div>
          {!justPlaced && <h1 className="heading-lg">Order #{order.order_id}</h1>}
          <p className="text-muted">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="order-details-layout">
        <div className="order-details-main">
          <div className="checkout-panel">
            <h2 className="heading-sm">Items</h2>
            <ul className="checkout-item-list order-items-list">
              {order.items.map((item) => (
                <li key={item.id}>
                  <ProductImage src={item.product?.images?.[0]?.image || item.product?.image} alt={item.product_name} />
                  <span>{item.product_name} × {item.quantity}</span>
                  <strong>{formatINR(item.subtotal)}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="checkout-panel">
            <h2 className="heading-sm"><MapPin size={16} /> Shipping Address</h2>
            <div className="review-block">
              <p>{addr?.full_name}<br />{addr?.line1}{addr?.line2 ? `, ${addr.line2}` : ""}<br />{addr?.city}, {addr?.state} {addr?.pincode}<br />{addr?.phone} · {addr?.email}</p>
            </div>
          </div>

          <div className="checkout-panel">
            <h2 className="heading-sm"><Calendar size={16} /> Delivery Estimate</h2>
            <p>
              {new Date(order.estimated_delivery_start).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {" – "}
              {new Date(order.estimated_delivery_end).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>
          </div>
        </div>

        <aside className="checkout-summary cart-summary">
          <h2 className="heading-sm">Payment Summary</h2>
          <div className="cart-summary-row"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          {Number(order.discount) > 0 && <div className="cart-summary-row"><span>Discount</span><span>-{formatINR(order.discount)}</span></div>}
          <div className="cart-summary-row"><span>Shipping</span><span>{Number(order.shipping) === 0 ? "Free" : formatINR(order.shipping)}</span></div>
          <div className="cart-summary-row"><span>Tax</span><span>{formatINR(order.tax)}</span></div>
          <hr className="divider" />
          <div className="cart-summary-row cart-summary-total"><span>Total</span><strong>{formatINR(order.total)}</strong></div>
          <p className="cart-summary-hint" style={{ marginTop: 4 }}>Payment status: <strong className="text-muted">{order.payment_status}</strong></p>

          <Link to="/orders" className="btn btn-outline btn-block" style={{ marginTop: 12 }}>View All Orders</Link>
          <Link to="/products" className="btn btn-primary btn-block">Continue Shopping</Link>
        </aside>
      </div>
    </div>
  );
}


