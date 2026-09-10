import { useState } from "react";
import { Gem } from "lucide-react";

// Renders a product image with a graceful placeholder for missing/broken
// images. Never falls back to a static local asset — only an icon glyph.
export default function ProductImage({ src, alt, className = "", loading = "lazy" }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt || "Image unavailable"}>
        <Gem aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      className={className}
      loading={loading}
      onError={() => setErrored(true)}
    />
  );
}

