<<<<<<< HEAD
import { useEffect, useState, useCallback, useMemo } from "react";
=======
import { useEffect, useState, useCallback } from "react";
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
import { WishlistContext } from "./WishlistContextInstance";
import { 
  addWishlistItem, 
  deleteWishlistItem, 
  getWishlist,
  getWishlistCollections,
  createWishlistCollection,
  deleteWishlistCollection,
  updateWishlistCollection,
  addProductToCollection,
  removeProductFromCollection,
  getWishlistCollection
} from "../services/api";
import { useAuth } from "../hooks/useAuth";



export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [ready, setReady] = useState(false);
  const [collectionsReady, setCollectionsReady] = useState(false);

  // Load wishlist items
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setItems([]);
      setReady(true);
      return;
    }
    getWishlist()
      .then((data) => {
        console.log("Wishlist loaded:", data);
        setItems(data);
      })
      .catch((error) => {
        console.error("Failed to load wishlist:", error);
        setItems([]);
      })
      .finally(() => setReady(true));
  }, [isAuthenticated, loading]);

  // Load collections
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setCollections([]);
      setCollectionsReady(true);
      return;
    }
    getWishlistCollections()
      .then((data) => {
        console.log("Collections loaded:", data);
        setCollections(data);
      })
      .catch((error) => {
        console.error("Failed to load collections:", error);
        setCollections([]);
      })
      .finally(() => setCollectionsReady(true));
  }, [isAuthenticated, loading]);

<<<<<<< HEAD
  // Products that live ONLY inside one of this user's PRIVATE collections.
  // The backend already excludes these from the /wishlist/ response, but we
  // re-derive the same rule here from `collections` (which the owner already
  // has loaded) as a second, frontend-side guard. This keeps optimistic
  // updates - e.g. re-adding an item right after toggling it into a private
  // collection, before the next refetch lands - from ever flashing a public
  // heart/badge for a privately-saved product.
  const privateOnlyProductIds = useMemo(() => {
    const privateIds = new Set();
    const publicIds = new Set();
    collections.forEach((collection) => {
      const bucket = collection.visibility === "private" ? privateIds : publicIds;
      (collection.items || []).forEach((item) => {
        if (item.product?.id != null) bucket.add(item.product.id);
      });
    });
    const onlyPrivate = new Set();
    privateIds.forEach((id) => {
      if (!publicIds.has(id)) onlyPrivate.add(id);
    });
    return onlyPrivate;
  }, [collections]);

  // Public-safe wishlist items: what the navbar badge, product-card hearts,
  // PDP wishlist state and the profile "Wishlist Items" summary are allowed
  // to read. Anything that exists only inside a private collection is
  // stripped out here so it can never leak into general/public UI.
  const visibleItems = useMemo(
    () => items.filter((item) => !privateOnlyProductIds.has(item.product.id)),
    [items, privateOnlyProductIds]
  );

  const isWishlisted = useCallback((productId) => {
    return visibleItems.some((item) => item.product.id === productId);
  }, [visibleItems]);
=======
  const isWishlisted = useCallback((productId) => {
    return items.some((item) => item.product.id === productId);
  }, [items]);
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440

  const wishlistEntryId = useCallback((productId) => {
    const item = items.find((item) => item.product.id === productId);
    return item?.id;
  }, [items]);

  const addToWishlist = async (product) => {
    try {
      const created = await addWishlistItem(product.id);
      setItems((prev) => {
        if (prev.some((i) => i.product.id === product.id)) {
          return prev;
        }
        return [...prev, created];
      });
      return created;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    const entryId = wishlistEntryId(productId);
    if (!entryId) {
      console.warn("No wishlist entry found for product:", productId);
      return;
    }
    
    try {
      await deleteWishlistItem(entryId);
      setItems((prev) => prev.filter((i) => i.id !== entryId));
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      throw error;
    }
  };

  const toggleWishlist = async (product) => {
    if (isWishlisted(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  // Collection operations
  const createCollection = async (collectionData) => {
    try {
      const newCollection = await createWishlistCollection(collectionData);
      setCollections((prev) => [newCollection, ...prev]);
      return newCollection;
    } catch (error) {
      console.error("Failed to create collection:", error);
      throw error;
    }
  };

  const deleteCollection = async (collectionId) => {
    try {
      await deleteWishlistCollection(collectionId);
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    } catch (error) {
      console.error("Failed to delete collection:", error);
      throw error;
    }
  };

  const updateCollection = async (collectionId, collectionData) => {
    try {
      const updated = await updateWishlistCollection(collectionId, collectionData);
      setCollections((prev) => prev.map((c) => c.id === collectionId ? updated : c));
      return updated;
    } catch (error) {
      console.error("Failed to update collection:", error);
      throw error;
    }
  };

  const addToCollection = async (collectionId, productId) => {
    try {
      await addProductToCollection(collectionId, productId);
<<<<<<< HEAD
      // Refresh collections *and* the flat wishlist so public visibility
      // (isWishlisted/totalItems) is immediately re-derived - e.g. a product
      // that just became private-collection-only stops looking wishlisted
      // in general UI without needing a page refresh.
      const [updatedCollections, updatedItems] = await Promise.all([
        getWishlistCollections(),
        getWishlist(),
      ]);
      setCollections(updatedCollections);
      setItems(updatedItems);
=======
      // Refresh collections
      const updated = await getWishlistCollections();
      setCollections(updated);
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
    } catch (error) {
      console.error("Failed to add to collection:", error);
      throw error;
    }
  };

  const removeFromCollection = async (collectionId, productId) => {
    try {
      await removeProductFromCollection(collectionId, productId);
<<<<<<< HEAD
      // Refresh collections *and* the flat wishlist - see addToCollection.
      const [updatedCollections, updatedItems] = await Promise.all([
        getWishlistCollections(),
        getWishlist(),
      ]);
      setCollections(updatedCollections);
      setItems(updatedItems);
=======
      // Refresh collections
      const updated = await getWishlistCollections();
      setCollections(updated);
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
    } catch (error) {
      console.error("Failed to remove from collection:", error);
      throw error;
    }
  };

  const getCollectionWithItems = async (collectionId) => {
    try {
      const collection = await getWishlistCollection(collectionId);
      return collection;
    } catch (error) {
      console.error("Failed to get collection:", error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
<<<<<<< HEAD
        items: visibleItems,
        ready,
        collections,
        collectionsReady,
        totalItems: visibleItems.length,
=======
        items,
        ready,
        collections,
        collectionsReady,
        totalItems: items.length,
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        createCollection,
        deleteCollection,
        updateCollection,
        addToCollection,
        removeFromCollection,
        getCollectionWithItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};




