import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FestivePopup from "./components/FestivePopup";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOTP from "./pages/VerifyResetOTP";
import ResetPassword from "./pages/ResetPassword";
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

// Support Dashboard imports
import SupportStaffRoute from "./components/auth/SupportStaffRoute";
import SupportDashboardLayout from "./components/support/SupportDashboardLayout";
import SupportDashboard from "./pages/support-dashboard/SupportDashboard";
import SupportDashboardTickets from "./pages/support-dashboard/SupportDashboardTickets";
import SupportDashboardTicketDetail from "./pages/support-dashboard/SupportDashboardTicketDetail";

function AppShell() {
  const location = useLocation();
  const isSupportDashboard = location.pathname.startsWith("/support-dashboard");

  return (
    <>
      {!isSupportDashboard && <FestivePopup />}
      {!isSupportDashboard && <Navbar />}

      <main>
        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ---------- Password Reset ---------- */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />

          <Route path="/reset-password" element={<ResetPassword />} />

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

          {/* ---------- Support Dashboard (separate layout) ---------- */}
          <Route
            path="/support-dashboard"
            element={
              <SupportStaffRoute>
                <SupportDashboardLayout />
              </SupportStaffRoute>
            }
          >
            <Route index element={<SupportDashboard />} />
            <Route path="tickets" element={<SupportDashboardTickets />} />
            <Route
              path="tickets/:ticketId"
              element={<SupportDashboardTicketDetail />}
            />
          </Route>

          <Route path="/:slug" element={<InfoPage />} />

        </Routes>
      </main>

      {!isSupportDashboard && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}