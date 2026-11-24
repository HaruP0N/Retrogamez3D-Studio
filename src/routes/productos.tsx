import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductGrid } from "@/components/product-grid";
import { CategoryGrid } from "@/components/category-grid";
import { CATEGORIES, parseCategory, type Category } from "@/lib/catalog";
import { btn } from "@/components/ui-btn";

export const Route = createFileRoute("/productos")({
  validateSearch: (search: Record<string, unknown>): { categoria?: Category | undefined } => ({ categoria: parseCategory(search["categoria"]) }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Productos impresos en 3D — RetroGamez3D" },
      { name: "description", content: "Decoración, figuras y piezas funcionales impresas en 3D." },
      { property: "og:title", content: "Productos impresos en 3D — RetroGamez3D" },
      { property: "og:description", content: "Decoración, figuras y piezas funcionales impresas en 3D." },
    ],
  }),
  component: Productos,
});

function Productos() {
  const { categoria } = Route.useSearch();
  const label = CATEGORIES.find((c) => c.value === categoria)?.label;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Catálogo</p>
      <h1 className="mt-3 text-4xl font-bold md:text-6xl">Productos</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Todos se pueden pedir en el color y tamaño que prefieras.</p>
      <CategoryGrid selected={categoria} />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <h2 className="text-2xl font-bold">{label || "Todos los productos"}</h2>
        {categoria && <Link to="/productos" search={{ categoria: undefined }} className={btn({ variant: "outline" })}>Ver todos</Link>}
      </div>
      <ProductGrid showOrder category={categoria} />
    </section>
  );
}
