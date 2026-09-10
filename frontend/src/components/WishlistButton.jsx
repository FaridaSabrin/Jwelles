import { useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../hooks/useToast";
import AddToCollectionModal from "./AddToCollectionModal";

export default function WishlistButton({ product, className = "" }) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showCollectionDrawer, setShowCollectionDrawer] = useState(false);

  const active = isAuthenticated && isWishlisted(product.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Please sign in to save favourites.");
      navigate("/login");
      return;
    }

    try {
      setBusy(true);
      
      if (!active) {
        // Add to wishlist
        await toggleWishlist(product);
        toast.success("Added to wishlist");
        setShowCollectionDrawer(true);
      } else {
        // Remove from wishlist
        await toggleWishlist(product);
        toast.success("Removed from wishlist");
        // Don't open drawer when removing
      }
    } catch (err) {
      toast.error(err.message || "Couldn't update your wishlist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`btn-icon wishlist-toggle ${active ? "is-active" : ""} ${className}`}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={active}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart size={18} fill={active ? "currentColor" : "none"} strokeWidth={1.75} />
      </button>

      {showCollectionDrawer && (
        <AddToCollectionModal
          productId={product.id}
          onClose={() => setShowCollectionDrawer(false)}
          onAdded={() => {}}
        />
      )}
    </>
  );
}
