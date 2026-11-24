import { describe, expect, it } from "vitest";
import { filterProducts, MATERIALS, MATERIAL_OPTIONS, parseCategory } from "@/lib/catalog";

const products = [
  { name: "Portada", category: "decoracion", is_category: true },
  { name: "Macetero", category: "decoracion", is_category: false },
  { name: "Dragón", category: "figuras", is_category: false },
  { name: "Soporte", category: "funcionales", is_category: false },
];

describe("Catálogo por categoría", () => {
  it.each([
    ["decoracion", "Macetero"], ["figuras", "Dragón"], ["funcionales", "Soporte"],
  ])("muestra solo productos con tag %s", (category, name) => {
    expect(filterProducts(products, parseCategory(category)).map((p) => p.name)).toEqual([name]);
  });
  it("no mezcla portadas con productos", () => {
    expect(filterProducts(products).map((p) => p.name)).toEqual(["Macetero", "Dragón", "Soporte"]);
  });
  it("descarta categorías desconocidas", () => {
    expect(parseCategory("otro")).toBeUndefined();
  });
  it("solo ofrece PLA; no ofrece resina, PETG ni TPU", () => {
    expect(MATERIALS).toEqual(["PLA"]);
    expect(MATERIAL_OPTIONS).toEqual(["No sé / recomiéndenme", "PLA"]);
  });
});