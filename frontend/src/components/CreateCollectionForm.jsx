import { useState } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../hooks/useToast";

export default function CreateCollectionModal({ onClose, onCreated }) {
  const { createCollection } = useWishlist();
  const toast = useToast();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name.trim()) {
      setError("Collection name is required.");
      toast.error("Collection name is required.");
      return;
    }

    if (visibility === "private" && !password.trim()) {
      setPasswordError("Password is required for private collections.");
      toast.error("Password is required for private collections.");
      return;
    }

    if (visibility === "private" && password.length < 4) {
      setPasswordError("Password must be at least 4 characters long.");
      toast.error("Password must be at least 4 characters long.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPasswordError("");
    
    try {
      const collectionData = {
        name: name.trim(),
        visibility: visibility,
      };

      if (visibility === "private") {
        collectionData.password = password;
      }

      const newCollection = await createCollection(collectionData);
      
      setName("");
      setVisibility("public");
      setPassword("");
      setError("");
      setPasswordError("");
      
      onCreated(newCollection);
    } catch (error) {
      setError(error.message || "Failed to create collection.");
      toast.error(error.message || "Failed to create collection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility);
    setPasswordError("");
    if (newVisibility === "public") {
      setPassword("");
    }
  };

  return (
    <div className="create-collection-form-container">
      <form onSubmit={handleSubmit} className="create-collection-form">
        <div className="form-group">
          <label htmlFor="collection-name">Collection name</label>
          <input
            type="text"
            id="collection-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="e.g., Wedding Jewellery"
            disabled={isLoading}
            autoFocus
            className={error ? "error" : ""}
          />
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="form-group">
          <label>Visibility</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="public"
                checked={visibility === "public"}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                disabled={isLoading}
              />
              <div className="radio-content">
                <span className="radio-title">Public</span>
                <span className="radio-desc">Anyone can view this collection</span>
              </div>
            </label>

            <label className="radio-label">
              <input
                type="radio"
                value="private"
                checked={visibility === "private"}
                onChange={(e) => handleVisibilityChange(e.target.value)}
                disabled={isLoading}
              />
              <div className="radio-content">
                <span className="radio-title">Private 🔒</span>
                <span className="radio-desc">Only you can view this collection</span>
              </div>
            </label>
          </div>
        </div>

        {visibility === "private" && (
          <div className="form-group">
            <label htmlFor="collection-password">Password</label>
            <input
              type="password"
              id="collection-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              placeholder="Enter password for private collection"
              disabled={isLoading}
              className={passwordError ? "error" : ""}
            />
            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !name.trim() || (visibility === "private" && !password.trim())}
          >
            {isLoading ? "Creating..." : "Create collection"}
          </button>
        </div>
      </form>
    </div>
  );
}
