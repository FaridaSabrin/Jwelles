import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import "./Navbar.css";

// Static columns that don't depend on backend category rows.
const JEWELLERY_SECTIONS = [
  {
    title: "By Occasion",
    items: [
      { label: "Wedding Collection", path: "/products?occasion=wedding" },
      { label: "Engagement", path: "/products?occasion=engagement" },
      { label: "Anniversary", path: "/products?occasion=anniversary" },
      { label: "Birthday", path: "/products?occasion=birthday" },
      { label: "Valentine's Day", path: "/products?occasion=valentine" },
      { label: "Diwali Special", path: "/products?occasion=diwali" },
    ],
  },
  {
    title: "By Style",
    items: [
      { label: "Daily Wear", path: "/products?style=daily" },
      { label: "Office Wear", path: "/products?style=office" },
      { label: "Party Wear", path: "/products?style=party" },
      { label: "Traditional", path: "/products?style=traditional" },
      { label: "Modern", path: "/products?style=modern" },
      { label: "Minimalist", path: "/products?style=minimalist" },
    ],
  },
  {
    title: "Gift Ideas",
    items: [
      { label: "Gifts Under ₹5,000", path: "/products?max_price=5000" },
      { label: "Gifts Under ₹10,000", path: "/products?max_price=10000" },
      { label: "Gifts Under ₹25,000", path: "/products?max_price=25000" },
      { label: "Luxury Gifts", path: "/products?min_price=50000" },
      { label: "Corporate Gifts", path: "/products?tag=corporate" },
    ],
  },
  {
    title: "Trending",
    items: [
      { label: "Best Sellers", path: "/products?best_seller=true" },
      { label: "New Arrivals", path: "/products?sort=newest" },
      { label: "Special Offers", path: "/products?discount=true" },
      { label: "Limited Edition", path: "/products?tag=limited" },
      { label: "Customer Favorites", path: "/products?sort=best_rated" },
      { label: "Back in Stock", path: "/products?back_in_stock=true" },
    ],
  },
];

// Static metal list — matches backend /market-prices/ metals exactly.
// (Kept static so the mega-menu renders instantly without waiting for
// the market-prices fetch.)
const METAL_OPTIONS = [
  { label: "Gold", value: "Gold" },
  { label: "Silver", value: "Silver" },
  { label: "Platinum", value: "Platinum" },
  { label: "Palladium", value: "Palladium" },
];

export default function MegaMenu({ promoProduct }) {
  const { metalCategories, stoneOptions } = useCategories();

  // Prefer real backend metal categories when present; fall back to the
  // static list so the menu is never empty.
  const metals = metalCategories && metalCategories.length > 0
    ? metalCategories.map((c) => ({ label: c.name, value: c.name }))
    : METAL_OPTIONS;

  const stones = (stoneOptions || []).map((s) => ({
    label: s.name,
    value: s.name,
  }));

  return (
    <div className="mega-menu" role="menu">
      <div className="mega-menu-inner mega-menu-jewellery">
        {/* SHOP BY MATERIAL -------------------------------------------------
            Category = form of jewellery (Rings, Necklaces, ...).
            Material = what it's made from / contains (Gold, Diamond, ...).
            These are independent and combine cleanly in product filtering. */}
        <div className="mega-menu-col">
          <p className="mega-menu-title">Shop by Material</p>
          <div className="mega-menu-material-group">
            <p className="mega-menu-subtitle">Metals</p>
            <ul>
              {metals.map((m) => (
                <li key={`metal-${m.value}`}>
                  <Link to={`/products?metal_type=${encodeURIComponent(m.value)}`}>
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mega-menu-material-group">
            <p className="mega-menu-subtitle">Stones</p>
            <ul>
              {stones.map((s) => (
                <li key={`stone-${s.value}`}>
                  <Link to={`/products?stone_type=${encodeURIComponent(s.value)}`}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Existing sections preserved unchanged. */}
        {JEWELLERY_SECTIONS.map((section) => (
          <div className="mega-menu-col" key={section.title}>
            <p className="mega-menu-title">{section.title}</p>
            <ul>
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {promoProduct && (
          <div className="mega-menu-promo">
            <Link to={`/products/${promoProduct.id}`}>
              {promoProduct.image && (
                <img src={promoProduct.image} alt={promoProduct.name} />
              )}
              <p>{promoProduct.name}</p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}