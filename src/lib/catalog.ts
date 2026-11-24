export const CATEGORIES = [
  { value: "decoracion", label: "Decoración" },
  { value: "figuras", label: "Figuras y coleccionables" },
  { value: "funcionales", label: "Piezas funcionales" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function parseCategory(value: unknown): Category | undefined {
  return CATEGORIES.find((category) => category.value === value)?.value;
}

export function filterProducts<T extends { category: string; is_category: boolean }>(products: T[], category?: Category) {
  return products.filter((product) => !product.is_category && (!category || product.category === category));
}

export const MATERIALS = ["PLA"] as const;
export const MATERIAL_OPTIONS = ["No sé / recomiéndenme", ...MATERIALS];