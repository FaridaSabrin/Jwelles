import { useEffect, useState } from "react";
import { CartContext } from "./CartContextInstance";
import { addCartItem, deleteCartItem, getCart, updateCartItem } from "../services/api";
import { useAuth } from "../hooks/useAuth";



export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [cartItems, setCartItems] = useState(() => JSON.parse(localStorage.getItem("guest_cart") || "[]"));
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      getCart()
        .then(({ items }) => setCartItems(items))
        .catch(() => setCartItems([]))
        .finally(() => setReady(true));
    } else {
      setCartItems(JSON.parse(localStorage.getItem("guest_cart") || "[]"));
      setReady(true);
    }
  }, [isAuthenticated, loading]);

  const saveGuest = (items) => {
    setCartItems(items);
    localStorage.setItem("guest_cart", JSON.stringify(items));
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Cart items come in two shapes: authenticated ones nest the product
  // (item.product.id), guest/localStorage ones spread it flat (item.id).
  const isInCart = (productId) => cartItems.some((item) => (item.product ? item.product.id : item.id) === productId);

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.product?.price ?? item.price) * item.quantity,
    0
  );

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      await addCartItem(product.id, quantity);
      const { items } = await getCart();
      setCartItems(items);
      openDrawer();
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let next;

      if (existing) {
        next = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      } else {
        next = [...prev, { ...product, quantity: Math.min(quantity, product.stock) }];
      }

      localStorage.setItem("guest_cart", JSON.stringify(next));
      return next;
    });
    openDrawer();
  };

  const removeFromCart = async (id) => {
    if (isAuthenticated) {
      await deleteCartItem(id);
      const { items } = await getCart();
      setCartItems(items);
    } else {
      saveGuest(cartItems.filter((item) => item.id !== id));
    }
  };

  const changeQuantity = async (item, quantity) => {
    const stock = item.product?.stock ?? item.stock;
    if (quantity < 1 || quantity > stock) return;

    if (isAuthenticated) {
      await updateCartItem(item.id, quantity);
      const { items } = await getCart();
      setCartItems(items);
    } else {
      saveGuest(cartItems.map((x) => (x.id === item.id ? { ...x, quantity } : x)));
    }
  };

  const increaseQuantity = (item) => changeQuantity(item, item.quantity + 1);
  const decreaseQuantity = (item) => changeQuantity(item, item.quantity - 1);

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("guest_cart");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        ready,
        totalItems,
        totalPrice,
        cartTotal: totalPrice,
        isInCart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        changeQuantity,
        clearCart,
        drawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};




