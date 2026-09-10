import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gem, PersonStanding, Baby, Users } from "lucide-react";
import { getProducts } from "../services/api";
import { useCategories } from "../hooks/useCategories";
import HeroSlider from "../components/HeroSlider";
import ServiceFeatures from "../components/ServiceFeatures";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import { formatINR } from "../utils/formatINR";
import { ProductGridSkeleton, CategoryGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import "./Home.css";

const GENDER_TILES = [
  { label: "Women", value: "women", icon: Gem },
  { label: "Men", value: "men", icon: PersonStanding },
  { label: "Kids", value: "kids", icon: Baby },
  { label: "Unisex", value: "unisex", icon: Users },
];

export default function Home() {
  const { primaryCategories, metalCategories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getProducts({ sort: "newest", available: "true" })
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const featured = products.filter((p) => p.is_featured);
  const bestSellers = products.filter((p) => p.is_best_seller).slice(0, 8);
  const newArrivals = products.slice(0, 8);
  const onSale = products.filter((p) => p.discount_percentage > 0);
  const heroSlides = (featured.length ? featured : products).slice(0, 4);
  const promoProduct = onSale[0];

  return (
    <div className="home">
      <HeroSlider slides={heroSlides} />
      <ServiceFeatures />

      {/* SHOP BY CATEGORY */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Explore</span>
            <h2 className="heading-lg">Shop by Category</h2>
            <p className="section-sub">Find the perfect piece from our curated jewellery categories.</p>
          </div>

          {categoriesLoading && <CategoryGridSkeleton count={6} />}

          {!categoriesLoading && primaryCategories.length > 0 && (
            <div className="category-grid">
              {primaryCategories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
            </div>
          )}

          {!categoriesLoading && primaryCategories.length === 0 && (
            <EmptyState icon={Gem} title="Categories coming soon" message="Our category catalogue is being curated." />
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Collection</span>
            <h2 className="heading-lg">Featured Jewellery</h2>
            <p className="section-sub">Handpicked pieces, chosen for their exceptional craftsmanship.</p>
          </div>

          {loading && <ProductGridSkeleton />}
          {!loading && error && <ErrorState onRetry={load} title="Unable to load products" />}

          {!loading && !error && featured.length > 0 && (
            <div className="product-grid">
              {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {!loading && !error && featured.length === 0 && (
            <EmptyState icon={Gem} title="No featured products yet" message="Check back soon for handpicked favourites." />
          )}

          <div className="section-cta">
            <Link to="/products" className="btn btn-secondary">
              View All Jewellery <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      {!error && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Just In</span>
              <h2 className="heading-lg">New Arrivals</h2>
            </div>

            {loading && <ProductGridSkeleton />}
            {!loading && !error && newArrivals.length > 0 && (
              <div className="product-grid">
                {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
            {!loading && !error && newArrivals.length === 0 && (
              <EmptyState icon={Gem} title="No products available yet" message="New pieces will appear here as soon as they're added." />
            )}
          </div>
        </section>
      )}

      {/* SHOP BY METAL */}
      {!categoriesLoading && metalCategories.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Precious Materials</span>
              <h2 className="heading-lg">Shop by Metal</h2>
            </div>

            <div className="metal-grid">
              {metalCategories.map((cat) => (
                <Link key={cat.id} to={`/products?metal_type=${encodeURIComponent(cat.name)}`} className="metal-tile">
                  <ProductImage src={cat.image} alt={cat.name} />
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {!loading && !error && bestSellers.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">Curated For You</span>
              <h2 className="heading-lg">Best Sellers</h2>
            </div>

            <div className="product-grid">
              {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* SHOP FOR */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Made For You</span>
            <h2 className="heading-lg">Shop For</h2>
          </div>

          <div className="gender-grid">
            {GENDER_TILES.map(({ label, value, icon: Icon }) => (
              <Link key={value} to={`/products?gender=${value}`} className="gender-tile">
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTIONAL BANNER */}
      {promoProduct && (
        <section className="promo-banner">
          <div className="promo-banner-media">
            <ProductImage src={promoProduct.images?.[0]?.image || promoProduct.image} alt={promoProduct.name} />
          </div>
          <div className="promo-banner-content">
            <span className="eyebrow">Limited Time</span>
            <h2 className="heading-lg">Up to {Math.round(promoProduct.discount_percentage)}% Off Selected Pieces</h2>
            <p>Starting from {formatINR(promoProduct.price)} — while stocks last.</p>
            <Link to="/products?discount=true" className="btn btn-gold btn-lg">Shop the Sale</Link>
          </div>
        </section>
      )}
    </div>
  );
}


