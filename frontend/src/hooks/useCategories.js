import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContextInstance";

export const useCategories = () => {
  const context = useContext(CategoryContext);

  if (!context) {
    throw new Error("useCategories must be used within CategoryProvider");
  }

  return context;
};

