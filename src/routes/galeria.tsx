import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { galleryQuery } from "@/lib/data";

export const Route = createFileRoute("/galeria")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Galería de impresiones — RetroGamez3D" },
      { name: "description", content: "Trabajos que ya imprimimos en 3D para nuestros clientes." },
      { property: "og:title", content: "Galería de impresiones — RetroGamez3D" },
      { property: "og:description", content: "Trabajos que ya imprimimos en 3D para nuestros clientes." },
    ],
  }),
  component: Galeria,
});

function Galeria() {
  const { data, isLoading } = useQuery(galleryQuery());
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Trabajos</p>
      <h1 className="mt-3 text-4xl font-bold md:text-6xl">Galería</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Algunas impresiones que ya salieron de nuestras máquinas.</p>
      {isLoading ? null : !data?.length ? (
        <p className="mt-10 text-muted-foreground">Muy pronto subiremos fotos de nuestros trabajos.</p>
      ) : (
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {data.map((g) => (
            <figure key={g.id} className="mb-5 break-inside-avoid overflow-hidden rounded-sm border border-border bg-card">
              {g.image_url && <img src={g.image_url} alt={g.title || "Impresión 3D"} loading="lazy" className="w-full" />}
              {(g.title || g.description) && (
                <figcaption className="p-4">
                  {g.title && <p className="font-bold">{g.title}</p>}
                  {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
