import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Heart, ArrowLeft, Lock } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../hooks/useToast";
import CreateCollectionModal from "./CreateCollectionModal";
import "./AddToCollectionModal.css";

export default function AddToCollectionModal({ productId, onClose, onAdded }) {
  const {
    collections,
    collectionsReady,
    addToCollection,
    removeFromCollection,
  } = useWishlist();

  const toast = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingCollections, setUpdatingCollections] = useState(new Set());
  const [collectionMembership, setCollectionMembership] = useState(new Set());
  const [isOpen, setIsOpen] = useState(false);

  // Check which collections already contain this product
  useEffect(() => {
    const memberships = new Set();

    collections.forEach((collection) => {
      if (
        collection.items &&
        collection.items.some(
          (item) => item.product?.id === productId
        )
      ) {
        memberships.add(collection.id);
      }
    });

    setCollectionMembership(memberships);
  }, [collections, productId]);

  // Open animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleCollectionToggle = async (collectionId) => {
    if (updatingCollections.has(collectionId)) {
      return;
    }

    setUpdatingCollections((prev) => {
      const next = new Set(prev);
      next.add(collectionId);
      return next;
    });

    try {
      if (collectionMembership.has(collectionId)) {
        await removeFromCollection(collectionId, productId);

        setCollectionMembership((prev) => {
          const next = new Set(prev);
          next.delete(collectionId);
          return next;
        });

        toast.success("Removed from collection");
      } else {
        await addToCollection(collectionId, productId);

        setCollectionMembership((prev) => {
          const next = new Set(prev);
          next.add(collectionId);
          return next;
        });

        toast.success("Added to collection");
      }

      if (onAdded) {
        onAdded();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update collection");
    } finally {
      setUpdatingCollections((prev) => {
        const next = new Set(prev);
        next.delete(collectionId);
        return next;
      });
    }
  };

  const handleCreateCollection = (newCollection) => {
    setShowCreateModal(false);

    if (newCollection?.id) {
      // New collection is already created.
      // Add current product to it.
      handleCollectionToggle(newCollection.id);
    }
  };

  const publicCollections = collections.filter(c => c.visibility === "public");
  const privateCollections = collections.filter(c => c.visibility === "private");

  const drawerContent = (
    <>
      {/* Overlay */}
      <div
        className={`collection-drawer-overlay ${isOpen ? "open" : ""
          }`}
        onClick={handleClose}
      />

      {/* Right-side drawer */}
      <div
        className={`collection-drawer ${isOpen ? "open" : ""
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="collection-drawer-header">
          {showCreateModal ? (
            <>
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowCreateModal(false)}
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <h2>Create Collection</h2>

              <button
                type="button"
                className="close-btn"
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="close-btn"
                onClick={handleClose}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <h2>Save item to...</h2>
            </>
          )}
        </div>

        {/* Content */}
        <div className="collection-drawer-content">
          {showCreateModal ? (
            <CreateCollectionModal
              onClose={() => setShowCreateModal(false)}
              onCreated={handleCreateCollection}
            />
          ) : (
            <>
              {/* Create collection */}
              <button
                type="button"
                className="create-collection-btn"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus size={20} />
                Create a new collection
              </button>

              {/* Collections */}
              {!collectionsReady ? (
                <div className="loading">
                  Loading collections...
                </div>
              ) : collections.length === 0 ? (
                <div className="no-collections">
                  <p>
                    No collections yet. Create one to get started!
                  </p>
                </div>
              ) : (
                <>
                  {publicCollections.length > 0 && (
                    <div className="collection-section">
                      <h3 className="collection-section-header">Public Collections</h3>
                      <div className="collections-list">
                        {publicCollections.map((collection) => {
                          const isSelected = collectionMembership.has(
                            collection.id
                          );

                          const isUpdating =
                            updatingCollections.has(collection.id);

                          return (
                            <div
                              key={collection.id}
                              className={`collection-card ${isSelected ? "selected" : ""
                                }`}
                              onClick={() =>
                                handleCollectionToggle(collection.id)
                              }
                            >
                              <div className="collection-thumbnail">
                                {collection.preview_image ? (
                                  <img
                                    src={collection.preview_image}
                                    alt={collection.name}
                                  />
                                ) : (
                                  <Heart size={24} />
                                )}
                              </div>

                              <div className="collection-info">
                                <h3>{collection.name}</h3>

                                <p className="collection-meta">
                                  {collection.visibility} ·{" "}
                                  {collection.item_count || 0}{" "}
                                  {collection.item_count === 1
                                    ? "item"
                                    : "items"}
                                </p>
                              </div>

                              <div
                                className={`checkbox ${isSelected ? "checked" : ""
                                  }`}
                              >
                                {isUpdating ? (
                                  <span className="loading-spinner">
                                    ...
                                  </span>
                                ) : isSelected ? (
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <rect
                                      x="1"
                                      y="1"
                                      width="18"
                                      height="18"
                                      rx="4"
                                      fill="#d4af37"
                                      stroke="#d4af37"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M5.5 10.5L8.5 13.5L14.5 7.5"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <rect
                                      x="1"
                                      y="1"
                                      width="18"
                                      height="18"
                                      rx="4"
                                      fill="white"
                                      stroke="#ccc"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {privateCollections.length > 0 && (
                    <div className="collection-section">
                      <h3 className="collection-section-header">Private Collections 🔒</h3>
                      <div className="collections-list">
                        {privateCollections.map((collection) => {
                          const isSelected = collectionMembership.has(
                            collection.id
                          );

                          const isUpdating =
                            updatingCollections.has(collection.id);

                          return (
                            <div
                              key={collection.id}
                              className={`collection-card ${isSelected ? "selected" : ""
                                }`}
                              onClick={() =>
                                handleCollectionToggle(collection.id)
                              }
                            >
                              <div className="collection-thumbnail private-thumbnail">
                                <Lock size={22} />
                              </div>

                              <div className="collection-info">
                                <h3>
                                  {collection.name}
                                  {collection.is_private && <Lock size={12} className="lock-icon" />}
                                </h3>

                                <p className="collection-meta">
                                  private ·{" "}
                                  {collection.item_count || 0}{" "}
                                  {collection.item_count === 1
                                    ? "item"
                                    : "items"}
                                </p>
                              </div>

                              <div
                                className={`checkbox ${isSelected ? "checked" : ""
                                  }`}
                              >
                                {isUpdating ? (
                                  <span className="loading-spinner">
                                    ...
                                  </span>
                                ) : isSelected ? (
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <rect
                                      x="1"
                                      y="1"
                                      width="18"
                                      height="18"
                                      rx="4"
                                      fill="#d4af37"
                                      stroke="#d4af37"
                                      strokeWidth="2"
                                    />
                                    <path
                                      d="M5.5 10.5L8.5 13.5L14.5 7.5"
                                      stroke="white"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <rect
                                      x="1"
                                      y="1"
                                      width="18"
                                      height="18"
                                      rx="4"
                                      fill="white"
                                      stroke="#ccc"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer only on collection list */}
        {!showCreateModal && (
          <div className="collection-drawer-footer">
            <button
              type="button"
              className="done-btn"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
