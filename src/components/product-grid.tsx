import { useQuery } from "@tanstack/react-query";
import { btn } from "@/components/ui-btn";
import { productsQuery } from "@/lib/data";
import { waLink } from "@/lib/site";
import { CATEGORIES, filterProducts, type Category } from "@/lib/catalog";

export function ProductGrid({ limit, showOrder, category }: { limit?: number; showOrder?: boolean; category?: Category | undefined }) {
  const { data, isLoading, isError } = useQuery(productsQuery());
  const products = filterProducts(data ?? [], category);
  const items = limit ? products.slice(0, limit) : products;

  if (isLoading)
    return (
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-card" />)}
      </div>
    );
  if (isError) return <p role="alert" className="mt-10 text-destructive">No se pudo cargar el catálogo. Intenta nuevamente.</p>;
  if (!items.length) return <p className="mt-10 text-muted-foreground">{category ? "Aún no hay productos publicados en esta categoría." : "Pronto agregaremos productos."}</p>;

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {items.map((p) => (
        <article key={p.id} className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card">
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="aspect-square w-full bg-muted" />
          )}
          <div className="flex flex-1 flex-col p-5">
            <h2 className="text-lg font-bold">{p.name}</h2>
            <span className="mt-2 font-mono text-xs text-primary">{CATEGORIES.find((c) => c.value === p.category)?.label}</span>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</p>
            {showOrder && (
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-sm text-primary">{p.price}</span>
                <a href={waLink(`Hola! Me interesa: ${p.name}`)} target="_blank" rel="noreferrer" className={btn({ variant: "outline" }) + " px-3 py-2 text-xs"}>Pedir</a>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
