const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000/api/v1";

// ==================== COOKIE HELPERS ====================

const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split("; ") : [];

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

// ==================== API REQUEST ====================

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const config = {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type");

    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

// ==================== QUERY HELPER ====================

const toQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== false
    ) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
};

// ==================== PRODUCTS ====================

export const getProducts = (params = {}) =>
  request(`/products/${toQuery(params)}`);

export const getProduct = (id) =>
  request(`/products/${id}/`);

export const getProductBySlug = (slug) =>
  request(`/products/slug/${slug}/`);

export const searchProducts = (query) =>
  request(`/products/search/${toQuery({ q: query })}`);

// ==================== CATEGORIES ====================

export const getCategories = () =>
  request("/categories/");

export const getCategory = (id) =>
  request(`/categories/${id}/`);

export const getCategoryProducts = (category, params = {}) =>
  request(`/products/${toQuery({ category, ...params })}`);

// ==================== AUTH ====================

export const register = (userData) =>
  request("/auth/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const login = (credentials) =>
  request("/auth/login/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const logout = () =>
  request("/auth/logout/", {
    method: "POST",
  });

export const getCurrentUser = () =>
  request("/auth/me/");

export const sendOTP = (email) =>
  request("/auth/send-otp/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const verifyOTP = (email, otp) =>
  request("/auth/verify-otp/", {
    method: "POST",
    body: JSON.stringify({
      email,
      otp,
    }),
  });

export const resendOTP = (email) =>
  request("/auth/resend-otp/", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

export const forgotPassword = (email) =>
  request("/auth/forgot-password/", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (data) =>
  request("/auth/reset-password/", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ==================== CART ====================

export const getCart = () =>
  request("/cart/");

export const addToCart = (productId, quantity = 1, size = null) =>
  request("/cart/add/", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
      size,
    }),
  });

export const updateCartItem = (itemId, quantity) =>
  request(`/cart/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
    }),
  });

export const removeFromCart = (itemId) =>
  request(`/cart/${itemId}/`, {
    method: "DELETE",
  });

export const clearCart = () =>
  request("/cart/clear/", {
    method: "DELETE",
  });

// ==================== WISHLIST ====================

export const getWishlist = () =>
  request("/wishlist/");

export const addToWishlist = (productId) =>
  request("/wishlist/add/", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
    }),
  });

export const removeFromWishlist = (productId) =>
  request(`/wishlist/${productId}/`, {
    method: "DELETE",
  });

// ==================== WISHLIST COLLECTIONS ====================

export const getCollections = () =>
  request("/wishlist/collections/");

export const getCollection = (id) =>
  request(`/wishlist/collections/${id}/`);

export const createCollection = (data) =>
  request("/wishlist/collections/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCollection = (id, data) =>
  request(`/wishlist/collections/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteCollection = (id) =>
  request(`/wishlist/collections/${id}/`, {
    method: "DELETE",
  });

export const addProductToCollection = (collectionId, productId) =>
  request(`/wishlist/collections/${collectionId}/products/`, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
    }),
  });

export const removeProductFromCollection = (
  collectionId,
  productId
) =>
  request(
    `/wishlist/collections/${collectionId}/products/${productId}/`,
    {
      method: "DELETE",
    }
  );

export const verifyCollectionPassword = (
  collectionId,
  password
) =>
  request(
    `/wishlist/collections/${collectionId}/verify-password/`,
    {
      method: "POST",
      body: JSON.stringify({
        password,
      }),
    }
  );

// ==================== ADDRESSES ====================

export const getAddresses = () =>
  request("/addresses/");

export const getAddress = (id) =>
  request(`/addresses/${id}/`);

export const createAddress = (data) =>
  request("/addresses/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAddress = (id, data) =>
  request(`/addresses/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAddress = (id) =>
  request(`/addresses/${id}/`, {
    method: "DELETE",
  });

// ==================== ORDERS ====================

export const getOrders = () =>
  request("/orders/");

export const getOrder = (id) =>
  request(`/orders/${id}/`);

export const createOrder = (data) =>
  request("/orders/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const cancelOrder = (id) =>
  request(`/orders/${id}/cancel/`, {
    method: "POST",
  });

// ==================== REVIEWS ====================

export const getProductReviews = (productId) =>
  request(`/products/${productId}/reviews/`);

export const createReview = (productId, data) =>
  request(`/products/${productId}/reviews/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ==================== CUSTOMIZATION ====================

export const createCustomization = (data) =>
  request("/customizations/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCustomizations = () =>
  request("/customizations/");

export const getCustomization = (id) =>
  request(`/customizations/${id}/`);

// ==================== PINCODE / SERVICEABILITY ====================

export const checkServiceability = (pincode) =>
  request(`/serviceability/${pincode}/`);

export const checkPincode = (pincode) =>
  request(`/pincode/?pincode=${encodeURIComponent(pincode)}`);

// ==================== COUPONS ====================

export const validateCoupon = (code, cartTotal = 0) =>
  request("/coupons/validate/", {
    method: "POST",
    body: JSON.stringify({
      code,
      cart_total: cartTotal,
    }),
  });

// ==================== SUPPORT / HELP DESK ====================

export const createSupportTicket = (data) =>
  request("/support/tickets/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getSupportTickets = () =>
  request("/support/tickets/");

export const getSupportTicket = (id) =>
  request(`/support/tickets/${id}/`);

export const addSupportMessage = (ticketId, message) =>
  request(`/support/tickets/${ticketId}/messages/`, {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });

// ==================== DEFAULT EXPORT ====================

export default API_URL;