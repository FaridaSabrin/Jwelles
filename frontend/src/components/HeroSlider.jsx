import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage";
import "./HeroSlider.css";

const AUTO_MS = 6000;

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, slides.length]);

  if (!slides.length) {
    return (
      <section className="hero hero-empty">
        <div className="hero-content">
          <p className="hero-eyebrow">Timeless Elegance</p>
          <h1>Jewellery Crafted for<br />Every Story</h1>
          <p className="hero-sub">New pieces are on their way. Explore the full collection in the meantime.</p>
          <Link to="/products" className="btn btn-gold btn-lg">Shop Collection</Link>
        </div>
      </section>
    );
  }

  const slide = slides[index];
  const image = slide.images?.[0]?.image || slide.image;

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-media">
        <ProductImage src={image} alt={slide.name} className="hero-image" loading="eager" />
        <div className="hero-scrim" />
      </div>

      <div className="hero-content">
        <p className="hero-eyebrow">{slide.category || "Featured"}</p>
        <h1>
          Timeless Elegance,<br />Crafted for You
        </h1>
        <p className="hero-sub">
          Discover {slide.name} and other pieces designed to celebrate every unforgettable moment.
        </p>
        <div className="hero-cta-row">
          <Link to={`/products/${slide.id}`} className="btn btn-gold btn-lg">Shop Collection</Link>
          <Link to="/products?sort=newest" className="btn btn-outline btn-lg hero-outline">Explore New Arrivals</Link>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-left" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button className="hero-arrow hero-arrow-right" onClick={() => setIndex((i) => (i + 1) % slides.length)} aria-label="Next slide">
            <ChevronRight size={20} />
          </button>

          <div className="hero-dots" role="tablist" aria-label="Slides">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`hero-dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-selected={i === index}
                role="tab"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

