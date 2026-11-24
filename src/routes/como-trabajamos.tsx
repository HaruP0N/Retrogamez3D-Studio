import { createFileRoute } from "@tanstack/react-router";
import { MATERIALS } from "@/lib/catalog";

export const Route = createFileRoute("/como-trabajamos")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Cómo trabajamos y materiales — RetroGamez3D" },
      { name: "description", content: "Nuestro proceso de impresión 3D, materiales disponibles y preguntas frecuentes." },
      { property: "og:title", content: "Cómo trabajamos — RetroGamez3D" },
      { property: "og:description", content: "Proceso, materiales y preguntas frecuentes de impresión 3D." },
    ],
  }),
  component: Como,
});

const PASOS = [
  ["01", "Nos cuentas", "Envías tu archivo o idea por el formulario o WhatsApp."],
  ["02", "Revisamos", "Evaluamos si tu modelo se puede imprimir en PLA."],
  ["03", "Cotizamos", "Te enviamos precio y plazo sin compromiso."],
  ["04", "Imprimimos", "Fabricamos, terminamos y coordinamos la entrega."],
];

const MATERIALES = MATERIALS.map((material) => [material, "Versátil y económico. Ideal para decoración y prototipos."]);

const FAQ = [
  ["¿No tengo archivo, igual pueden ayudarme?", "Sí. Con fotos, medidas o un boceto podemos modelarlo por ti."],
  ["¿Qué tamaño máximo imprimen?", "Hasta aprox. 25 × 25 × 25 cm por pieza; más grande se imprime por partes."],
  ["¿Hacen envíos?", "Sí, coordinamos envío o retiro según tu ubicación."],
];

function Como() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Proceso</p>
      <h1 className="mt-3 text-4xl font-bold md:text-6xl">Cómo trabajamos</h1>
      <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
        {PASOS.map(([n, t, d]) => (
          <div key={n} className="bg-background p-6">
            <div className="font-mono text-3xl text-primary">{n}</div>
            <h2 className="mt-4 font-bold">{t}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-20 text-3xl font-bold">Materiales</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MATERIALES.map(([m, d]) => (
          <div key={m} className="layer-grid rounded-sm border border-border p-6">
            <div className="font-mono text-lg text-primary">{m}</div>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-20 text-3xl font-bold">Preguntas frecuentes</h2>
      <div className="mt-8 divide-y divide-border border-y border-border">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="cursor-pointer list-none font-bold group-open:text-primary">{q}</summary>
            <p className="mt-2 text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
