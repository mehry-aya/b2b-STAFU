"use client";

import { useState, useEffect } from "react";
import { fetchCategories } from "@/lib/api/products";

interface Category {
  title: string;
  handle: string;
  children: {
    title: string;
    handle: string;
  }[];
}

export function useShopifyCategories(currentCategory: string | null) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data);
      // Auto-expand parent if a child is active (only on initial load or data change)
      setOpenGroups((prev) => {
        const newOpen = { ...prev };
        data.forEach((cat: Category) => {
          if (
            cat.handle === currentCategory ||
            cat.children.some((c) => c.handle === currentCategory)
          ) {
            newOpen[cat.title] = true;
          }
        });
        return newOpen;
      });
    });
  }, []); // Only fetch on mount

  // Separate effect to handle auto-expansion when category changes via URL
  useEffect(() => {
    if (currentCategory && categories.length > 0) {
      setOpenGroups((prev) => {
        const newOpen = { ...prev };
        categories.forEach((cat) => {
          if (
            cat.handle === currentCategory ||
            cat.children.some((c) => c.handle === currentCategory)
          ) {
            newOpen[cat.title] = true;
          }
        });
        return newOpen;
      });
    }
  }, [currentCategory, categories]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return {
    categories,
    openGroups,
    toggleGroup,
  };
}
