import { useEffect, useMemo, useState } from "react";
import { CategoryContext } from "./CategoryContextInstance";
import { getCategories } from "../services/api";

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
    const jewelleryCategories = categories.filter((c) => c.kind === "jewellery");
    const metalCategories = categories.filter((c) => c.kind === "metal");
    const stoneCategories = categories.filter((c) => c.kind === "stone");

    const stoneOptions = stoneCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    }));

    return {
      categories,
      primaryCategories: jewelleryCategories,
      jewelleryCategories,
      metalCategories,
      stoneCategories,
      stoneOptions,
      loading,
      error,
      reload: load,
    };
  }, [categories, loading, error]);

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};