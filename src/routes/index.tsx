import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { btn } from "@/components/ui-btn";
import { CategoryGrid } from "@/components/category-grid";
import { MATERIALS } from "@/lib/catalog";
import { igLink } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "RetroGamez3D — Impresión 3D a pedido" },
      { name: "description", content: "Productos impresos en 3D y fabricación de tus propios modelos. Cotiza por WhatsApp." },
      { property: "og:title", content: "RetroGamez3D — Impresión 3D a pedido" },
      { property: "og:description", content: "Productos impresos en 3D y fabricación de tus propios modelos." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Impresora 3D imprimiendo una pieza naranja" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-36">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14">
            {/* Logo Emblem on the left with glowing aura */}
            <div className="relative shrink-0 group">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-amber-500/35 via-orange-600/30 to-red-600/20 blur-2xl opacity-80 group-hover:opacity-100 transition duration-700 pointer-events-none" />
              <img
                src="/hero-badge.png"
                alt="RetroGamez3D"
                width={320}
                height={320}
                className="relative h-44 w-44 sm:h-56 sm:w-56 md:h-72 md:w-72 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Main Hero Text */}
            <div className="max-w-2xl text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Estudio de Impresión 3D</p>
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-card"
                >
                  <Instagram size={12} strokeWidth={2.2} />
                  <span>@retrogamez3d</span>
                </a>
              </div>
              <h1 className="mt-4 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                Tus ideas, <br />capa por capa.
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Vendemos piezas impresas y fabricamos tus propios modelos. Del archivo a tus manos.
              </p>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
                <Link to="/tu-proyecto" className={btn()}>Envía tu modelo</Link>
                <Link to="/productos" className={btn({ variant: "outline" })}>Ver productos</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="layer-grid border-y border-border">
        <div className="mx-auto grid max-w-6xl gap-px px-5 py-16 sm:grid-cols-3">
          {[
            [MATERIALS.join(" · "), "Material"],
            ["Hasta 0.05 mm", "Resolución por capa"],
            ["3 a 7 días", "Entrega habitual"],
          ].map(([v, l]) => (
            <div key={l} className="p-6">
              <div className="text-2xl font-bold">{v}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold md:text-4xl">Lo que vendemos</h2>
          <Link to="/productos" className="font-mono text-xs uppercase tracking-wider text-primary">Ver todo →</Link>
        </div>
        <CategoryGrid />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="rounded-sm border border-primary/40 bg-accent p-10 md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">¿Tienes un modelo o una idea?</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">Envíanos tu archivo STL/OBJ o cuéntanos qué necesitas y te decimos si podemos imprimirlo.</p>
          <Link to="/tu-proyecto" className={btn() + " mt-6"}>Cotizar mi proyecto</Link>
        </div>
      </section>
    </>
  );
}
