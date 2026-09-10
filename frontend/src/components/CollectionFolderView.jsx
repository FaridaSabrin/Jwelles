import { useEffect, useState } from "react";
import {
  Lock,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  X,
  ArrowLeft,
} from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../hooks/useToast";
import { unlockPrivateCollections } from "../services/api";
import ProductCard from "./ProductCard";
import "./CollectionFolderView.css";

export default function CollectionFolderView({ folderType, onClose }) {
  const { collections, collectionsReady, getCollectionWithItems } =
    useWishlist();

  const toast = useToast();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(folderType === "public");

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedCollectionData, setSelectedCollectionData] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  /*
   * Reset folder state whenever user switches
   * between PUBLIC and PRIVATE.
   */
  useEffect(() => {
    setPassword("");
    setPasswordError("");
    setIsUnlocking(false);

    setUnlocked(folderType === "public");

    setSelectedCollection(null);
    setSelectedCollectionData(null);
    setLoadingProducts(false);
  }, [folderType]);

  /*
   * Only show collections belonging to the
   * currently opened folder.
   */
  const filteredCollections = collections.filter((collection) => {
    if (folderType === "public") {
      return collection.visibility === "public";
    }

    return collection.visibility === "private";
  });

  /*
   * PRIVATE PASSWORD
   */
  const handleUnlock = async (event) => {
    event.preventDefault();

    setPasswordError("");

    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      setPasswordError("Password is required.");
      return;
    }

    setIsUnlocking(true);

    try {
      const result = await unlockPrivateCollections(trimmedPassword);

      if (result?.valid) {
        setUnlocked(true);
        setPassword("");
        setPasswordError("");

        toast.success("Private collections unlocked.");
      } else {
        setPasswordError("Invalid password.");
        toast.error("Invalid password.");
      }
    } catch (error) {
      console.error("Failed to unlock private collections:", error);

      setPasswordError(
        error?.message || "Invalid password. Please try again."
      );

      toast.error("Invalid password.");
    } finally {
      setIsUnlocking(false);
    }
  };

  /*
   * Open one collection.
   *
   * Important:
   * We fetch the complete collection from backend
   * instead of assuming collection.items is always
   * present in the initial collections response.
   */
  const handleOpenCollection = async (collection) => {
    /*
     * Clicking the same collection closes it.
     */
    if (selectedCollection === collection.id) {
      setSelectedCollection(null);
      setSelectedCollectionData(null);
      return;
    }

    setSelectedCollection(collection.id);
    setSelectedCollectionData(null);
    setLoadingProducts(true);

    try {
      const fullCollection = await getCollectionWithItems(collection.id);

      setSelectedCollectionData(fullCollection);
    } catch (error) {
      console.error("Failed to load collection products:", error);

      toast.error(
        error?.message || "Unable to load products from this collection."
      );

      setSelectedCollection(null);
      setSelectedCollectionData(null);
    } finally {
      setLoadingProducts(false);
    }
  };

  /*
   * PRIVATE folder password screen
   */
  if (folderType === "private" && !unlocked) {
    return (
      <section className="folder-view">
        <div className="folder-header">
          <div className="folder-header-left">
            <div className="folder-header-icon">
              <Lock size={22} />
            </div>

            <div>
              <h3>Private Collections</h3>
              <p>Password protected</p>
            </div>
          </div>

          <button
            type="button"
            className="folder-close-btn"
            onClick={onClose}
            aria-label="Close private collections"
          >
            <X size={20} />
          </button>
        </div>

        <div className="password-gate">
          <div className="password-icon">
            <Lock size={34} />
          </div>

          <h3>Private Collections</h3>

          <p>
            Enter your password to access your private collections.
          </p>

          <form onSubmit={handleUnlock} className="password-form">
            <label htmlFor="private-collection-password">
              Password
            </label>

            <input
              id="private-collection-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
              }}
              placeholder="Enter your password"
              className={passwordError ? "error" : ""}
              disabled={isUnlocking}
              autoFocus
              autoComplete="current-password"
            />

            {passwordError && (
              <p className="password-error">{passwordError}</p>
            )}

            <button
              type="submit"
              className="unlock-btn"
              disabled={isUnlocking || !password.trim()}
            >
              {isUnlocking ? "Unlocking..." : "Unlock Private Collections"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  /*
   * Collection list
   */
  return (
    <section className="folder-view">
      <div className="folder-header">
        <div className="folder-header-left">
          <div className="folder-header-icon">
            {folderType === "public" ? (
              <FolderOpen size={22} />
            ) : (
              <Lock size={22} />
            )}
          </div>

          <div>
            <h3>
              {folderType === "public"
                ? "Public Collections"
                : "Private Collections"}
            </h3>

            <p>
              {filteredCollections.length === 0
                ? "No collections available"
                : `${filteredCollections.length} ${
                    filteredCollections.length === 1
                      ? "collection"
                      : "collections"
                  }`}
            </p>
          </div>
        </div>

        <div className="folder-header-actions">
          {folderType === "private" && unlocked && (
            <span className="unlocked-badge">
              <Lock size={13} />
              Unlocked
            </span>
          )}

          <button
            type="button"
            className="folder-close-btn"
            onClick={onClose}
            aria-label="Close collections"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!collectionsReady ? (
        <div className="folder-loading">
          <div className="folder-spinner" />
          <p>Loading collections...</p>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="empty-folder">
          <div className="empty-folder-icon">
            {folderType === "public" ? (
              <FolderOpen size={34} />
            ) : (
              <Lock size={34} />
            )}
          </div>

          <h4>
            No {folderType} collections yet
          </h4>

          <p>
            Create a {folderType} collection to organize your
            favourite jewellery pieces.
          </p>
        </div>
      ) : (
        <div className="folder-collections">
          {filteredCollections.map((collection) => {
            const isSelected =
              selectedCollection === collection.id;

            return (
              <div
                key={collection.id}
                className={`folder-collection-item ${
                  isSelected ? "expanded" : ""
                }`}
              >
                <button
                  type="button"
                  className="folder-collection-header"
                  onClick={() => handleOpenCollection(collection)}
                  aria-expanded={isSelected}
                >
                  <span className="collection-arrow">
                    {isSelected ? (
                      <ChevronDown size={19} />
                    ) : (
                      <ChevronRight size={19} />
                    )}
                  </span>

                  <span className="folder-collection-info">
                    <span className="folder-collection-name">
                      {collection.name}
                    </span>

                    <span className="collection-count">
                      {collection.item_count || 0}{" "}
                      {collection.item_count === 1 ? "item" : "items"}
                    </span>
                  </span>
                </button>

                {isSelected && (
                  <div className="folder-collection-products">
                    {loadingProducts ? (
                      <div className="collection-products-loading">
                        <div className="folder-spinner" />
                        <span>Loading products...</span>
                      </div>
                    ) : (
                      <>
                        <div className="collection-products-header">
                          <button
                            type="button"
                            className="collection-back-btn"
                            onClick={() => {
                              setSelectedCollection(null);
                              setSelectedCollectionData(null);
                            }}
                          >
                            <ArrowLeft size={16} />
                            Back to collections
                          </button>

                          <h4>
                            {selectedCollectionData?.name ||
                              collection.name}
                          </h4>
                        </div>

                        {selectedCollectionData?.items &&
                        selectedCollectionData.items.length > 0 ? (
                          <div className="collection-product-grid">
                            {selectedCollectionData.items.map((item) => (
                              <ProductCard
                                key={item.id}
                                product={item.product}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="no-products">
                            <p>No products in this collection yet.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
