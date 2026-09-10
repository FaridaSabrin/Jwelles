import { Folder, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
import Breadcrumbs from "../components/Breadcrumbs";
import CollectionFolderView from "../components/CollectionFolderView";
import "./Products.css";
import "./Wishlist.css";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { collectionsReady } = useWishlist();

  const [activeFolder, setActiveFolder] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="container products-page">
        <Breadcrumbs items={[{ label: "Wishlist" }]} />

        <div className="wishlist-page">
          <div className="wishlist-header">
            <h1 className="heading-lg">My Wishlist</h1>
          </div>

          <div className="wishlist-login-state">
            <LogIn size={32} />
            <h2>Sign in to view your wishlist</h2>
            <p>
              Please sign in to access your wishlist collections.
            </p>

            <a href="/login" className="wishlist-login-btn">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container products-page">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />

      <div className="wishlist-page">
        <div className="wishlist-header">
          <h1 className="heading-lg">My Wishlist</h1>
        </div>

        {!collectionsReady ? (
          <div className="wishlist-loading">
            Loading collections...
          </div>
        ) : (
          <>
            <div className="wishlist-folder-grid">

              {/* PUBLIC FOLDER */}
              <button
                type="button"
                className={`wishlist-folder-card ${
                  activeFolder === "public" ? "active" : ""
                }`}
                onClick={() =>
                  setActiveFolder(
                    activeFolder === "public" ? null : "public"
                  )
                }
              >
                <div className="wishlist-folder-icon">
                  <Folder size={42} strokeWidth={1.5} />
                </div>

                <div className="wishlist-folder-content">
                  <h2>PUBLIC</h2>
                  <p>Public Collections</p>
                </div>
              </button>

              {/* PRIVATE FOLDER */}
              <button
                type="button"
                className={`wishlist-folder-card ${
                  activeFolder === "private" ? "active" : ""
                }`}
                onClick={() =>
                  setActiveFolder(
                    activeFolder === "private" ? null : "private"
                  )
                }
              >
                <div className="wishlist-folder-icon">
                  <Lock size={42} strokeWidth={1.5} />
                </div>

                <div className="wishlist-folder-content">
                  <h2>PRIVATE</h2>
                  <p>Password Protected</p>
                </div>
              </button>

            </div>

            {activeFolder && (
              <CollectionFolderView
                folderType={activeFolder}
                onClose={() => setActiveFolder(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
