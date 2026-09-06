import { useEffect, useMemo, useState } from "react";
import { CategoryContext } from "./CategoryContextInstance";
import { getCategories } from "../services/api";


const PRIMARY_CATEGORY_SLUGS = ["gold", "silver", "platinum", "rose-gold", "white-gold", "diamond", "gemstones"];

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getCategories()
      .then(setCategories)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const value = useMemo(() => {
    const slugOrder = new Map(PRIMARY_CATEGORY_SLUGS.map((slug, index) => [slug, index]));
    const primaryCategories = categories
      .filter((c) => slugOrder.has(c.slug))
      .sort((a, b) => slugOrder.get(a.slug) - slugOrder.get(b.slug));

    return {
      categories,
      primaryCategories,
      jewelleryCategories: categories.filter((c) => c.kind === "jewellery"),
      metalCategories: categories.filter((c) => c.kind === "metal"),
      loading,
      error,
      reload: load,
    };
  }, [categories, loading, error]);

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};



