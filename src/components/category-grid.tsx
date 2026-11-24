import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/catalog";
import { productsQuery } from "@/lib/data";
import deco from "@/assets/p-deco.jpg";
import figuras from "@/assets/p-figuras.jpg";
import funcional from "@/assets/p-funcional.jpg";

const images = { decoracion: deco, figuras, funcionales: funcional };

export function CategoryGrid({ selected }: { selected?: Category | undefined }) {
  const { data = [] } = useQuery(productsQuery());
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {CATEGORIES.map((category) => {
        const cover = data.find((product) => product.is_category && product.category === category.value);
        return (
          <Link key={category.value} to="/productos" search={{ categoria: category.value }}
            aria-label={`Ver ${category.label}`} aria-current={selected === category.value ? "page" : undefined}
            className={`group overflow-hidden rounded-sm border bg-card transition-colors focus-visible:outline-2 focus-visible:outline-primary ${selected === category.value ? "border-primary" : "border-border hover:border-primary"}`}>
            <div className="aspect-[4/3] overflow-hidden">
              <img src={cover?.image_url || images[category.value]} alt={category.label} className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" />
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <h2 className="text-lg font-bold">{category.label}</h2>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}