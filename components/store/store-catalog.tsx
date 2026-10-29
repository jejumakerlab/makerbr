"use client";

import { useState } from "react";
import type { Product } from "@/types/database";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { ProductGrid } from "@/components/store/product-card";
import { FILTER_CHIP_GROUP_CLASS, filterChipClass } from "@/components/shared/filter-chips";

type CategoryValue = (typeof PRODUCT_CATEGORIES)[number]["value"];

function isCategoryValue(value: string): value is CategoryValue {
  return PRODUCT_CATEGORIES.some((option) => option.value === value);
}

export function StoreCatalog({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory: string;
}) {
  const [selected, setSelected] = useState<CategoryValue>(
    isCategoryValue(initialCategory) ? initialCategory : "all",
  );

  const label = PRODUCT_CATEGORIES.find((option) => option.value === selected)?.label;
  const visible =
    selected === "all" ? products : products.filter((item) => item.category === label);

  function select(value: CategoryValue) {
    setSelected(value);
    const url = value === "all" ? "/store" : `/store?category=${value}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <>
      <div role="group" aria-label="카테고리 필터" className={FILTER_CHIP_GROUP_CLASS}>
        {PRODUCT_CATEGORIES.map((option) => {
          const active = selected === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => select(option.value)}
              className={filterChipClass(active)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <ProductGrid products={visible} />
    </>
  );
}
