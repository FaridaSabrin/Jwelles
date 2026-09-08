const API_URL = import.meta.env.VITE_API_URL || "https://jwelles.onrender.com/api/v1";

async function request(path, options = {}) { 
  const token = localStorage.getItem("auth_token"); 
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, { 
    ...options, 
    headers: { 
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Token ${token}` } : {}), 
      ...options.headers 
    }, 
  }); 
  if (!response.ok) { 
    const body = await response.json().catch(() => ({})); 
    throw new Error(body.detail || Object.values(body).flat().join(" ") || "Request failed."); 
  } 
  return response.status === 204 ? null : response.json(); 
} 

function toQuery(params = {}) { 
  const cleaned = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""); 
  return new URLSearchParams(cleaned).toString(); 
} 

// PRODUCTS & CATEGORIES 
export const getProducts = (params = {}) => request(`/products/?${toQuery(params)}`); 
export const getProduct = (id) => request(`/products/${id}/`); 
export const getCategories = () => request("/categories/"); 

// AUTH 
export const loginUser = (data) => request("/auth/login/", { method: "POST", body: JSON.stringify(data) }); 
export const registerUser = (data) => request("/auth/register/", { method: "POST", body: JSON.stringify(data) }); 
export const getProfile = () => request("/profile/"); 
export const logoutUser = () => request("/auth/logout/", { method: "POST" }); 

// CART 
export const getCart = () => request("/cart/"); 
export const addCartItem = (product_id, quantity = 1) => request("/cart/items/", { method: "POST", body: JSON.stringify({ product_id, quantity }) }); 
export const updateCartItem = (id, quantity) => request(`/cart/items/${id}/`, { method: "PATCH", body: JSON.stringify({ quantity }) }); 
export const deleteCartItem = (id) => request(`/cart/items/${id}/`, { method: "DELETE" }); 

// WISHLIST 
export const getWishlist = () => request("/wishlist/"); 
export const addWishlistItem = (product_id) => request("/wishlist/", { method: "POST", body: JSON.stringify({ product_id }) }); 
export const deleteWishlistItem = (id) => request(`/wishlist/${id}/`, { method: "DELETE" }); 

// WISHLIST COLLECTIONS 
export const getWishlistCollections = () => request("/wishlist/collections/"); 
export const createWishlistCollection = (data) => request("/wishlist/collections/", { method: "POST", body: JSON.stringify(data) }); 
export const getWishlistCollection = (id) => request(`/wishlist/collections/${id}/`); 
export const updateWishlistCollection = (id, data) => request(`/wishlist/collections/${id}/`, { method: "PATCH", body: JSON.stringify(data) }); 
export const deleteWishlistCollection = (id) => request(`/wishlist/collections/${id}/`, { method: "DELETE" }); 
export const addProductToCollection = (collectionId, productId) => request(`/wishlist/collections/${collectionId}/items/`, { method: "POST", body: JSON.stringify({ product_id: productId }) }); 
export const removeProductFromCollection = (collectionId, productId) => request(`/wishlist/collections/${collectionId}/items/${productId}/`, { method: "DELETE" }); 
export const getSharedCollection = (token) => request(`/wishlist/shared/${token}/`, { headers: {} }); 
export const getPublicCollection = (id) => request(`/wishlist/public/${id}/`, { headers: {} }); 
export const unlockPrivateCollections = (password) => request("/wishlist/collections/unlock/", { method: "POST", body: JSON.stringify({ password }) }); 

// ADDRESSES 
export const getAddresses = () => request("/addresses/"); 
export const createAddress = (data) => request("/addresses/", { method: "POST", body: JSON.stringify(data) }); 
export const updateAddress = (id, data) => request(`/addresses/${id}/`, { method: "PATCH", body: JSON.stringify(data) }); 
export const deleteAddress = (id) => request(`/addresses/${id}/`, { method: "DELETE" }); 

// ORDERS 
export const createOrder = (address, couponCode = "") => request("/orders/", { method: "POST", body: JSON.stringify({ address, coupon_code: couponCode }) }); 
export const getOrders = () => request("/orders/"); 
export const getOrder = (id) => request(`/orders/${id}/`); 

// REVIEWS 
export const submitReview = (data) => request("/reviews/", { method: "POST", body: JSON.stringify(data) }); 

// CUSTOMIZATION 
export const submitCustomization = (data) => request("/customization/", { method: "POST", body: data }); 
export const getCustomizations = () => request("/customization/"); 
export const getCustomization = (id) => request(`/customization/${id}/`); 

// PINCODE SERVICEABILITY 
export const checkPincode = (pincode) => request(`/serviceability/pincode/?pincode=${encodeURIComponent(pincode)}`); 
export const getServiceability = (pincode) => request(`/serviceability/pincode/?pincode=${encodeURIComponent(pincode)}`); 
export const lookupPincode = (pincode) => request(`/serviceability/pincode/?pincode=${encodeURIComponent(pincode)}`); 
export const validatePincode = (pincode) => request(`/serviceability/pincode/?pincode=${encodeURIComponent(pincode)}`); 

// COUPONS 
export const getAvailableCoupons = (pincode, subtotal) => request(`/coupons/available/?pincode=${encodeURIComponent(pincode)}&subtotal=${subtotal || 0}`); 
export const getCoupons = (pincode, subtotal) => request(`/coupons/available/?pincode=${encodeURIComponent(pincode)}&subtotal=${subtotal || 0}`); 
export const validateCoupon = (code, pincode, subtotal) => request("/coupons/validate/", { method: "POST", body: JSON.stringify({ code, pincode: String(pincode), subtotal: subtotal || 0 }) }); 
export const applyCoupon = (code, pincode, subtotal) => request("/coupons/validate/", { method: "POST", body: JSON.stringify({ code, pincode: String(pincode), subtotal: subtotal || 0 }) }); 
export const checkCoupon = (code, pincode, subtotal) => request("/coupons/validate/", { method: "POST", body: JSON.stringify({ code, pincode: String(pincode), subtotal: subtotal || 0 }) }); 

// SUPPORT TICKETS 
export const getMySupportTickets = (params = {}) => request(`/support/tickets/?${toQuery(params)}`); 
export const createSupportTicket = (data) => request("/support/tickets/", { method: "POST", body: JSON.stringify(data) }); 
export const getSupportTicket = (ticketId) => request(`/support/tickets/${ticketId}/`); 
export const sendSupportMessage = (ticketId, message) => request(`/support/tickets/${ticketId}/messages/`, { method: "POST", body: JSON.stringify({ message }) }); 
export const closeSupportTicket = (ticketId) => request(`/support/tickets/${ticketId}/close/`, { method: "POST" }); 

export default API_URL; 