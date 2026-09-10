import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { getOrders } from "../services/api";
import Breadcrumbs from "../components/Breadcrumbs";
import OrderStatusBadge from "../components/OrderStatusBadge";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { ListRowSkeleton } from "../components/Skeletons";
import { formatINR } from "../utils/formatINR";
import "./Orders.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getOrders().then(setOrders).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container orders-page">
      <Breadcrumbs items={[{ label: "My Orders" }]} />

      <div className="section-heading align-left">
        <span className="eyebrow">Your Account</span>
        <h1 className="heading-lg">My Orders</h1>
      </div>

      {loading && <ListRowSkeleton count={4} />}

      {!loading && error && <ErrorState onRetry={load} title="Unable to load your orders" />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="When you place an order, it will show up here."
          actionLabel="Start Shopping"
          actionTo="/products"
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="order-list">
          {orders.map((order) => (
            <li key={order.id}>
              <Link to={`/orders/${order.id}`} className="order-card">
                <div className="order-card-top">
                  <div>
                    <strong>Order #{order.order_id}</strong>
                    <span className="text-muted">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                {/* Product items section - ADD, DON'T REDESIGN */}
                {order.items && order.items.length > 0 && (
                  <div className="order-products-list">
                    {order.items.map((item) => (
                      <div key={item.id} className="order-product-row">
                        <div className="order-product-img">
                          {item.product?.images?.[0]?.image || item.product?.image ? (
                            <img 
                              src={item.product?.images?.[0]?.image || item.product?.image} 
                              alt={item.product_name}
                            />
                          ) : (
                            <div className="placeholder"></div>
                          )}
                        </div>
                        <div className="order-product-info">
                          <p className="product-name">{item.product_name}</p>
                          <p className="product-meta">Qty: {item.quantity}</p>
                        </div>
                        <div className="order-product-price">
                          {formatINR(item.price_at_purchase)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-card-bottom">
                  <span>{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}</span>
                  <strong>{formatINR(order.total)}</strong>
                  <ChevronRight size={16} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


