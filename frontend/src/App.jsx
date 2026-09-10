import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FestivePopup from "./components/FestivePopup";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
<<<<<<< HEAD
import VerifyEmail from "./pages/VerifyEmail";
=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import InfoPage from "./pages/InfoPage";
import CustomJewelry from "./pages/CustomJewelry";
import CustomerSupport from "./pages/CustomerSupport";
import SupportTicketDetails from "./pages/SupportTicketDetails";

export default function App() {
  return (
    <BrowserRouter>
      <FestivePopup />
      <Navbar />

      <main>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

<<<<<<< HEAD
          <Route path="/verify-email" element={<VerifyEmail />} />

=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
          <Route path="/products" element={<Products />} />

          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route path="/cart" element={<Cart />} />

          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/custom-jewelry" element={<CustomJewelry />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-support"
            element={
              <ProtectedRoute>
                <CustomerSupport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customer-support/:ticketId"
            element={
              <ProtectedRoute>
                <SupportTicketDetails />
              </ProtectedRoute>
            }
          />

          <Route path="/:slug" element={<InfoPage />} />

        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
