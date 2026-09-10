import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, PackageSearch } from "lucide-react";
import { getProducts } from "../services/api";
<<<<<<< HEAD
import { useCategories } from "../hooks/useCategories";
=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/Skeletons";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Breadcrumbs from "../components/Breadcrumbs";
import FilterSidebar from "../components/FilterSidebar";
import MobileFilterDrawer from "../components/MobileFilterDrawer";
import SortDropdown from "../components/SortDropdown";
import Pagination from "../components/Pagination";
import "./Products.css";

<<<<<<< HEAD
const FILTER_KEYS = ["search", "category", "metal_type", "purity", "gender", "min_price", "max_price", "rating", "discount", "min_discount", "available", "best_seller"];
=======
const FILTER_KEYS = ["search", "category", "metal_type", "purity", "gender", "min_price", "max_price", "rating", "discount", "min_discount", "available"];
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
const PAGE_SIZE = 12;

const SERVER_SORT = { newest: "newest", price_asc: "price_asc", price_desc: "price_desc", popular: "popular", best_rated: "best_rated" };

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
<<<<<<< HEAD
  const { categories } = useCategories();
=======
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
  const [allProducts, setAllProducts] = useState([]);
  const [purityOptions, setPurityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => {
    const obj = {};
    FILTER_KEYS.forEach((key) => { obj[key] = searchParams.get(key) || ""; });
    return obj;
  }, [searchParams]);

  const sort = searchParams.get("sort") || "featured";
  const page = Number(searchParams.get("page")) || 1;

  const updateParams = useCallback((updates, resetPage = true) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (resetPage) next.delete("page");
      return next;
    });
  }, [setSearchParams]);

  const setFilter = (key, value) => updateParams({ [key]: value });
  const setSort = (value) => updateParams({ sort: value === "featured" ? "" : value });
  const setPage = (value) => { updateParams({ page: value > 1 ? String(value) : "" }, false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const clearAll = () => setSearchParams({});

  const load = useCallback(() => {
    setLoading(true);
    setError(false);

    const params = { available: filters.available || undefined };
    FILTER_KEYS.forEach((key) => { if (filters[key] && key !== "available") params[key] = filters[key]; });
    params.sort = SERVER_SORT[sort] || "newest";

    getProducts(params)
      .then((data) => setAllProducts(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { load(); }, [load]);

  // Fetched once to build a stable purity facet list, independent of the
  // active filters (the API has no dedicated facet endpoint).
  useEffect(() => {
    getProducts({ available: "true" })
      .then((data) => {
        const values = [...new Set(data.map((p) => p.purity).filter(Boolean))].sort();
        setPurityOptions(values);
      })
      .catch(() => {});
  }, []);

  const processed = useMemo(() => {
    let list = [...allProducts];

    if (filters.min_discount) {
      const threshold = Number(filters.min_discount);
      list = list.filter((p) => Number(p.discount_percentage) >= threshold);
    }

    if (sort === "featured") {
      list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    } else if (sort === "discount_desc") {
      list.sort((a, b) => Number(b.discount_percentage) - Number(a.discount_percentage));
    }

    return list;
  }, [allProducts, filters.min_discount, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = processed.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

<<<<<<< HEAD
  // The category filter travels as a slug (e.g. "gold") so it matches the
  // backend/category data; look up the friendly display name for the
  // heading/breadcrumb, falling back to a capitalized slug if unmatched.
  const categoryLabel = useMemo(() => {
    if (!filters.category) return "";
    const match = categories.find(
      (c) => c.slug?.toLowerCase() === filters.category.toLowerCase() || c.name?.toLowerCase() === filters.category.toLowerCase()
    );
    if (match) return match.name;
    return filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
  }, [categories, filters.category]);

  const activeChips = FILTER_KEYS.filter((k) => filters[k] && k !== "available" && k !== "min_discount")
    .map((k) => ({ key: k, label: k === "category" ? categoryLabel : filters[k] }))
=======
  const activeChips = FILTER_KEYS.filter((k) => filters[k] && k !== "available" && k !== "min_discount")
    .map((k) => ({ key: k, label: filters[k] }))
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
    .concat(filters.available === "true" ? [{ key: "available", label: "In Stock" }] : [])
    .concat(filters.min_discount ? [{ key: "min_discount", label: `${filters.min_discount}%+ Off` }] : []);

  const title = filters.category || filters.search
<<<<<<< HEAD
    ? (filters.search ? `Results for "${filters.search}"` : categoryLabel)
=======
    ? (filters.search ? `Results for "${filters.search}"` : filters.category)
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440
    : "Our Jewellery";

  const filterProps = { filters, onChange: setFilter, onClear: clearAll, purityOptions };

  return (
    <div className="container products-page">
<<<<<<< HEAD
      <Breadcrumbs items={[{ label: "Jewellery", to: "/products" }, ...(filters.category ? [{ label: categoryLabel }] : [])]} />
=======
      <Breadcrumbs items={[{ label: "Jewellery", to: "/products" }, ...(filters.category ? [{ label: filters.category }] : [])]} />
>>>>>>> 44b3f4f25f8dec5b5792013489c733fe2dfd9440

      <div className="products-header">
        <h1 className="heading-lg">{title}</h1>
        {!loading && <p className="products-count">{processed.length} {processed.length === 1 ? "piece" : "pieces"}</p>}
      </div>

      {activeChips.length > 0 && (
        <div className="active-chips">
          {activeChips.map((chip) => (
            <button key={chip.key} className="active-chip" onClick={() => setFilter(chip.key, "")}>
              {chip.label} <X size={12} />
            </button>
          ))}
          <button className="active-chip active-chip-clear" onClick={clearAll}>Clear All</button>
        </div>
      )}

      <div className="products-toolbar">
        <button className="btn btn-outline btn-sm products-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
          <SlidersHorizontal size={14} /> Filters
        </button>

        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <div className="products-layout">
        <FilterSidebar {...filterProps} />

        <div className="products-results">
          {loading && <ProductGridSkeleton count={PAGE_SIZE} />}

          {!loading && error && <ErrorState onRetry={load} title="Unable to load products" />}

          {!loading && !error && pageItems.length === 0 && (
            <EmptyState
              icon={PackageSearch}
              title="No products found"
              message="Try adjusting or clearing your filters to see more results."
              actionLabel="Clear All Filters"
              onAction={clearAll}
            />
          )}

          {!loading && !error && pageItems.length > 0 && (
            <>
              <div className="product-grid">
                {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      <MobileFilterDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        resultCount={processed.length}
        {...filterProps}
      />
    </div>
  );
}

