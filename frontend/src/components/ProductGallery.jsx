import { useRef, useState } from "react";
import ProductImage from "./ProductImage";
import "./ProductGallery.css";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({});
  const [zooming, setZooming] = useState(false);
  const frameRef = useRef(null);

  const list = images.length ? images : [null];

  const handleMouseMove = (e) => {
    const rect = frameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  return (
    <div className="product-gallery">
      <div
        className="gallery-main"
        ref={frameRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
      >
        <ProductImage
          src={list[active]}
          alt={name}
          className={`gallery-main-image ${zooming ? "is-zoomed" : ""}`}
          loading="eager"
        />
        {zooming && list[active] && <div className="gallery-main-image gallery-zoom-layer" style={{ backgroundImage: `url(${list[active]})`, ...zoomStyle }} />}
      </div>

      {list.length > 1 && (
        <div className="gallery-thumbs">
          {list.map((src, i) => (
            <button
              key={src || i}
              className={`gallery-thumb ${i === active ? "is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
            >
              <ProductImage src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

