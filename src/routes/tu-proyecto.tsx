import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { btn } from "@/components/ui-btn";
import { SITE, waLink } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { MATERIAL_OPTIONS } from "@/lib/catalog";

export const Route = createFileRoute("/tu-proyecto")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Envía tu modelo 3D — RetroGamez3D" },
      { name: "description", content: "Mándanos tu proyecto o archivo STL y te decimos si podemos imprimirlo." },
      { property: "og:title", content: "Envía tu modelo 3D — RetroGamez3D" },
      { property: "og:description", content: "Mándanos tu proyecto o archivo STL y te decimos si podemos imprimirlo." },
    ],
  }),
  component: TuProyecto,
});

const field = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary";

function TuProyecto() {
  const [f, setF] = useState({ nombre: "", contacto: "", material: "No sé / recomiéndenme", tamano: "", cantidad: "1", detalle: "", archivo: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const mensaje = `Hola! Quiero cotizar una impresión 3D.
Nombre: ${f.nombre}
Contacto: ${f.contacto || "-"}
Material: ${f.material}
Tamaño aprox.: ${f.tamano || "-"}
Cantidad: ${f.cantidad}
Archivo: ${f.archivo || "Sin archivo (solo idea)"}
Detalle: ${f.detalle}`;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = window.open(waLink(mensaje), "_blank");
    void supabase.from("project_requests").insert({
      nombre: f.nombre.slice(0, 120), contacto: f.contacto, material: f.material, tamano: f.tamano,
      cantidad: Math.max(1, Number(f.cantidad) || 1), detalle: f.detalle.slice(0, 4000), archivo_nombre: f.archivo,
    });
    if (!w) window.location.href = waLink(mensaje);
  };

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.2fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Cotización</p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Mándanos tu proyecto</h1>
        <p className="mt-4 text-muted-foreground">
          ¿Tienes un archivo (STL, OBJ, 3MF) o solo una idea? Completa el formulario y te llegará la consulta lista por WhatsApp.
          Luego adjunta ahí tu archivo, o envíalo a <a className="text-primary" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>
        <ul className="mt-8 space-y-3 font-mono text-sm text-muted-foreground">
          <li>→ Revisamos si es imprimible</li>
          <li>→ Te enviamos precio y plazo</li>
          <li>→ Imprimimos y entregamos</li>
        </ul>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-sm border border-border bg-card/50 p-6 md:p-8">
        <input required placeholder="Tu nombre" className={field} value={f.nombre} onChange={set("nombre")} />
        <input placeholder="Tu WhatsApp o correo" className={field} value={f.contacto} onChange={set("contacto")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <select className={field} value={f.material} onChange={set("material")}>
            {MATERIAL_OPTIONS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <input type="number" min={1} placeholder="Cantidad" className={field} value={f.cantidad} onChange={set("cantidad")} />
        </div>
        <input placeholder="Tamaño aproximado (ej: 10 x 5 x 5 cm)" className={field} value={f.tamano} onChange={set("tamano")} />
        <label className="block">
          <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Archivo (opcional)</span>
          <input type="file" accept=".stl,.obj,.3mf,.step,.stp" className={field}
            onChange={(e) => setF({ ...f, archivo: e.target.files?.[0]?.name ?? "" })} />
        </label>
        <textarea required rows={5} placeholder="Cuéntanos tu proyecto: para qué es, colores, detalles…" className={field} value={f.detalle} onChange={set("detalle")} />
        <button type="submit" className={btn() + " w-full"}>Enviar por WhatsApp</button>
      </form>
    </section>
  );
}
