import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

export default function CollectionsMegaMenu() {
  const { primaryCategories, loading } = useCategories();

  return (
    <div className="mega-menu" role="menu">
      <div className="mega-menu-inner">
        <div className="mega-menu-col">
          <p className="mega-menu-title">Shop by Category</p>
          <ul>
            {loading && <li className="mega-menu-empty">Loading…</li>}
            {!loading && primaryCategories.length === 0 && <li className="mega-menu-empty">Categories coming soon</li>}
            {primaryCategories.map((cat) => (
              <li key={cat.id}>
<<<<<<< HEAD
                <Link to={`/products?category=${encodeURIComponent(cat.slug)}`}>{cat.name}</Link>
=======
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
              </li>
            ))}
          </ul>
        </div>

        <div className="mega-menu-col">
          <p className="mega-menu-title">Shop for</p>
          <ul>
            <li><Link to="/products?gender=women">Women</Link></li>
            <li><Link to="/products?gender=men">Men</Link></li>
            <li><Link to="/products?gender=kids">Kids</Link></li>
            <li><Link to="/products?gender=unisex">Unisex</Link></li>
          </ul>
          <Link to="/products?discount=true" className="mega-menu-offer-link">View Current Offers →</Link>
        </div>

        <div className="mega-menu-col">
          <p className="mega-menu-title">Popular Collections</p>
          <ul>
            <li><Link to="/products?sort=newest">New Arrivals</Link></li>
            <li><Link to="/products?discount=true">Special Offers</Link></li>
<<<<<<< HEAD
            <li><Link to="/products?best_seller=true">Best Sellers</Link></li>
            <li><Link to="/products?max_price=10000">Under Budget</Link></li>
=======
            <li><Link to="/products?sort=popular">Best Sellers</Link></li>
            <li><Link to="/products?sort=price_asc">Under Budget</Link></li>
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
          </ul>
        </div>

        <div className="mega-menu-col">
          <p className="mega-menu-title">Custom Jewelry</p>
          <ul>
            <li><Link to="/custom-jewelry">Design Your Own</Link></li>
            <li><Link to="/custom-jewelry?type=engraving">Engraving Services</Link></li>
            <li><Link to="/custom-jewelry?type=birthstone">Birthstone Jewelry</Link></li>
            <li><Link to="/custom-jewelry?type=name">Name Necklaces</Link></li>
            <li><Link to="/custom-jewelry?type=photo">Photo Jewelry</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
