import { Link } from "react-router-dom";
import "./Navbar.css";

const COLLECTIONS = [
  {
    title: "By Occasion",
    items: [
      { label: "Wedding Collection", path: "/products?collection=wedding" },
      { label: "Engagement", path: "/products?collection=engagement" },
      { label: "Anniversary", path: "/products?collection=anniversary" },
      { label: "Birthday", path: "/products?collection=birthday" },
      { label: "Valentine's Day", path: "/products?collection=valentine" },
      { label: "Diwali Special", path: "/products?collection=diwali" },
    ]
  },
  {
    title: "By Style",
    items: [
      { label: "Daily Wear", path: "/products?collection=daily" },
      { label: "Office Wear", path: "/products?collection=office" },
      { label: "Party Wear", path: "/products?collection=party" },
      { label: "Traditional", path: "/products?collection=traditional" },
      { label: "Modern", path: "/products?collection=modern" },
      { label: "Minimalist", path: "/products?collection=minimalist" },
    ]
  },
  {
    title: "Gift Ideas",
    items: [
      { label: "Gifts Under ₹5,000", path: "/products?price_max=5000" },
      { label: "Gifts Under ₹10,000", path: "/products?price_max=10000" },
      { label: "Gifts Under ₹25,000", path: "/products?price_max=25000" },
      { label: "Luxury Gifts", path: "/products?price_min=50000" },
      { label: "Corporate Gifts", path: "/products?collection=corporate" },
    ]
  },
  {
    title: "Trending",
    items: [
      { label: "Best Sellers", path: "/products?sort=popular" },
      { label: "New Arrivals", path: "/products?sort=newest" },
      { label: "Special Offers", path: "/products?discount=true" },
      { label: "Limited Edition", path: "/products?collection=limited" },
      { label: "Customer Favorites", path: "/products?sort=rating" },
      { label: "Back in Stock", path: "/products?collection=back-in-stock" },
    ]
  }
];

export default function CollectionsMegaMenu() {
  return (
    <div className="mega-menu" role="menu">
      <div className="mega-menu-inner mega-menu-collections">
        {COLLECTIONS.map((section) => (
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
      </div>
    </div>
  );
}
