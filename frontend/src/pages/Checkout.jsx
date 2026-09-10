import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, MapPin, Truck, CreditCard, ClipboardCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";
import { createOrder, checkPincode, getAvailableCoupons, validateCoupon, getAddresses } from "../services/api";
import ProductImage from "../components/ProductImage";
import { formatINR } from "../utils/formatINR";
import EmptyState from "../components/EmptyState";
import "./Checkout.css";

const STEPS = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: ClipboardCheck },
];

const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING = 199;

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    full_name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [payment, setPayment] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0 ? 0 : FLAT_SHIPPING;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const estimatedTotal = cartTotal + shipping - couponDiscount;

  useEffect(() => {
    // Load saved addresses
    getAddresses().then(setSavedAddresses).catch(() => {});
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          message="Add something to your bag before checking out."
          actionLabel="Shop Now"
          actionTo="/products"
        />
      </div>
    );
  }

  const setField = (key) => (e) => {
    setAddress(prev => ({
      ...prev,
      [key]: e.target.value || ""
    }));
  };

  const checkPincodeServiceability = async (pincode) => {
    const pincodeStr = String(pincode || "");
    if (pincodeStr.length !== 6) return;
    
    setPincodeLoading(true);
    setPincodeStatus(null);
    
    try {
      const result = await checkPincode(pincodeStr);
      setPincodeStatus(result);
      
      if (result.serviceable) {
        const subtotal = cartTotal || 0;
        const coupons = await getAvailableCoupons(pincodeStr, subtotal);
        setAvailableCoupons(coupons.coupons || []);
      }
    } catch {
      setPincodeStatus({ serviceable: false, message: "Unable to check pincode" });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value || "";
    setAddress(prev => ({ ...prev, pincode: value }));
    
    if (value.length === 6) {
      checkPincodeServiceability(value);
    } else {
      setPincodeStatus(null);
      setAvailableCoupons([]);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !address.pincode) return;
    
    setCouponError("");
    try {
      const result = await validateCoupon(couponCode, address.pincode, cartTotal || 0);
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponError("");
      } else {
        setCouponError(result.message);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError(err.message);
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const validateAddress = () => {
    const required = ["full_name", "email", "phone", "line1", "city", "state", "pincode"];
    const errors = {};
    required.forEach((key) => { 
      if (!address[key]?.trim()) errors[key] = "Required"; 
    });
    if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) errors.email = "Invalid email";
    if (address.pincode && !/^\d{4,10}$/.test(address.pincode)) errors.pincode = "Invalid pincode";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (step === 0) {
      if (!validateAddress()) return;
      if (pincodeStatus && !pincodeStatus.serviceable) {
        setPlaceError("Delivery not available at this pincode.");
        return;
      }
    }
    setPlaceError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    setPlaceError("");
    if (pincodeStatus && !pincodeStatus.serviceable) {
      setPlaceError("Delivery not available at this pincode.");
      return;
    }
    try {
      setPlacing(true);
      const order = await createOrder(address, appliedCoupon?.code || "");
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch {
      setPlaceError(err.message || "Couldn't place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container checkout-page">
      <h1 className="heading-lg">Checkout</h1>

      <ol className="checkout-steps">
        {STEPS.map(({ key, label, icon: Icon }, i) => (
          <li key={key} className={`checkout-step ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}>
            <span className="checkout-step-icon">{i < step ? <Check size={14} /> : <Icon size={14} />}</span>
            <span className="checkout-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="checkout-layout">
        <div className="checkout-main">
          {step === 0 && (
            <div className="checkout-panel">
              <h2 className="heading-sm">Shipping Address</h2>
              
              {savedAddresses.length > 0 && (
                <div className="saved-addresses">
                  <select 
                    className="input"
                    onChange={(e) => {
                      const selected = savedAddresses.find(a => a.id === parseInt(e.target.value));
                      if (selected) {
                        setAddress({
                          full_name: selected.full_name || "",
                          email: selected.email || "",
                          phone: selected.phone || "",
                          line1: selected.line1 || "",
                          line2: selected.line2 || "",
                          city: selected.city || "",
                          state: selected.state || "",
                          pincode: selected.pincode || "",
                          country: selected.country || "India",
                        });
                        if (selected.pincode) {
                          checkPincodeServiceability(selected.pincode);
                        }
                      }
                    }}
                  >
                    <option value="">Select saved address</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.full_name} - {addr.city}, {addr.pincode}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="checkout-grid">
                <div className="field">
                  <label>Full Name</label>
                  <input className={`input ${addressErrors.full_name ? "has-error" : ""}`} value={address.full_name || ""} onChange={setField("full_name")} placeholder="Full name" />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className={`input ${addressErrors.email ? "has-error" : ""}`} value={address.email || ""} onChange={setField("email")} placeholder="Email address" type="email" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className={`input ${addressErrors.phone ? "has-error" : ""}`} value={address.phone || ""} onChange={setField("phone")} placeholder="Phone number" type="tel" />
                </div>
                <div className="field">
                  <label>Pincode</label>
                  <input className={`input ${addressErrors.pincode ? "has-error" : ""}`} value={address.pincode || ""} onChange={handlePincodeChange} placeholder="Pincode" />
                  {pincodeLoading && <p className="field-hint">Checking availability...</p>}
                  {pincodeStatus && !pincodeLoading && (
                    <div className={pincodeStatus.serviceable ? "pincode-success" : "pincode-error"}>
                      {pincodeStatus.serviceable ? (
                        <>
                          <p>✓ Delivery available</p>
                          <p>location: {pincodeStatus.city}, {pincodeStatus.state}</p>
                        </>
                      ) : (
                        <p>✕ {pincodeStatus.message || "Delivery not available at this pincode."}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="field checkout-grid-full">
                  <label>Address Line 1</label>
                  <input className={`input ${addressErrors.line1 ? "has-error" : ""}`} value={address.line1 || ""} onChange={setField("line1")} placeholder="House no., street, area" />
                </div>
                <div className="field checkout-grid-full">
                  <label>Address Line 2 (optional)</label>
                  <input className="input" value={address.line2 || ""} onChange={setField("line2")} placeholder="Landmark, apartment, etc." />
                </div>
                <div className="field">
                  <label>City</label>
                  <input className={`input ${addressErrors.city ? "has-error" : ""}`} value={address.city || ""} onChange={setField("city")} placeholder="City" />
                </div>
                <div className="field">
                  <label>State</label>
                  <input className={`input ${addressErrors.state ? "has-error" : ""}`} value={address.state || ""} onChange={setField("state")} placeholder="State" />
                </div>
                <div className="field">
                  <label>Country</label>
                  <input className="input" value={address.country || "India"} onChange={setField("country")} placeholder="Country" />
                </div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={goNext}>Continue to Delivery</button>
            </div>
          )}

          {step === 1 && (
            <div className="checkout-panel">
              <h2 className="heading-sm">Delivery</h2>
              <div className="delivery-option is-active">
                <Truck size={20} />
                <div>
                  <strong>Standard Delivery</strong>
                  {pincodeStatus?.serviceable ? (
                    <span>Estimated arrival {pincodeStatus.delivery_start} – {pincodeStatus.delivery_end}</span>
                  ) : (
                    <span>Delivery estimate available after pincode validation</span>
                  )}
                </div>
                <span className="delivery-price">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
              </div>
              <p className="field-hint" style={{ marginTop: 8 }}>Free shipping is applied automatically on orders above {formatINR(FREE_SHIPPING_THRESHOLD)}.</p>
              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={goBack}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={goNext}>Continue to Payment</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="checkout-panel">
              <h2 className="heading-sm">Payment Method</h2>
              <label className={`payment-option ${payment === "cod" ? "is-active" : ""}`}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <div>
                  <strong>Cash on Delivery</strong>
                  <span>Pay with cash when your order arrives.</span>
                </div>
              </label>
              <label className="payment-option is-disabled">
                <input type="radio" name="payment" disabled />
                <div>
                  <strong>Online Payment</strong>
                  <span>Cards, UPI &amp; Net Banking — coming soon.</span>
                </div>
              </label>
              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={goBack}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={goNext}>Review Order</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="checkout-panel">
              <h2 className="heading-sm">Review Your Order</h2>
              <div className="review-block">
                <div className="review-block-head">
                  <strong>Shipping Address</strong>
                  <button className="btn-ghost" onClick={() => setStep(0)}>Edit</button>
                </div>
                <p>{address.full_name}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.pincode}<br />{address.phone} · {address.email}</p>
              </div>
              <div className="review-block">
                <div className="review-block-head">
                  <strong>Payment Method</strong>
                  <button className="btn-ghost" onClick={() => setStep(2)}>Edit</button>
                </div>
                <p>Cash on Delivery</p>
              </div>
              <div className="review-block">
                <strong>Items ({cartItems.length})</strong>
                <ul className="checkout-item-list">
                  {cartItems.map((raw) => {
                    const item = raw.product ? { ...raw.product, quantity: raw.quantity } : raw;
                    return (
                      <li key={item.id}>
                        <ProductImage src={item.images?.[0]?.image || item.image} alt={item.name} />
                        <span>{item.name} × {item.quantity}</span>
                        <strong>{formatINR(item.price * item.quantity)}</strong>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {placeError && <div className="auth-alert">{placeError}</div>}
              <div className="checkout-actions">
                <button className="btn btn-outline" onClick={goBack} disabled={placing}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={placeOrder} disabled={placing}>
                  {placing && <span className="btn-spinner" />} {placing ? "Placing Order…" : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="checkout-summary cart-summary">
          <h2 className="heading-sm">Order Summary</h2>
          <ul className="checkout-summary-items">
            {cartItems.map((raw) => {
              const item = raw.product ? { ...raw.product, quantity: raw.quantity } : raw;
              return (
                <li key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatINR(item.price * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <hr className="divider" />
          <div className="cart-summary-row"><span>Subtotal</span><span>{formatINR(cartTotal)}</span></div>
          
          <div className="coupon-section">
            <div className="coupon-input-row">
              <input 
                className="input" 
                placeholder="Coupon Code" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value || "")}
                disabled={!!appliedCoupon}
              />
              {!appliedCoupon ? (
                <button className="btn btn-outline" onClick={applyCoupon}>Apply</button>
              ) : (
                <button className="btn btn-outline" onClick={removeCoupon}>Remove</button>
              )}
            </div>
            {couponError && <p className="coupon-error">{couponError}</p>}
            {appliedCoupon && (
              <p className="coupon-success">
                Coupon Applied: {appliedCoupon.code} -{formatINR(appliedCoupon.discount_amount)}
              </p>
            )}
          </div>
          
          {appliedCoupon && (
            <div className="cart-summary-row"><span>Coupon Discount</span><span>-{formatINR(appliedCoupon.discount_amount)}</span></div>
          )}
          <div className="cart-summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          <p className="cart-summary-hint">Any applicable location discount is calculated when your order is placed.</p>
          <hr className="divider" />
          <div className="cart-summary-row cart-summary-total"><span>Estimated Total</span><strong>{formatINR(estimatedTotal)}</strong></div>
        </aside>
      </div>

      <p className="checkout-back-link"><Link to="/cart">← Back to bag</Link></p>
    </div>
  );
}


