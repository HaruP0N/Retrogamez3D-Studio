import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { btn } from "@/components/ui-btn";
import { galleryQuery, productsQuery, uploadImage, utilizables } from "@/lib/data";
import { CATEGORIES, parseCategory, type Category } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Panel de administración — RetroGamez3D" },
      { name: "description", content: "Gestiona productos, inventario, galería y proyectos." },
      { property: "og:title", content: "Panel de administración — RetroGamez3D" },
      { property: "og:description", content: "Gestiona productos, inventario, galería y proyectos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const field = "w-full rounded-sm border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary";
const TABS = ["Inventario PLA", "Productos", "Galería", "Proyectos"] as const;

function Admin() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Inventario PLA");
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data === true,
  });

  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Panel</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Administración</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={logout} className={btn({ variant: "outline" }) + " px-3 py-2 text-xs"}>Cerrar sesión</button>
      </div>

      {role.isLoading ? null : !role.data ? (
        <p className="mt-10 rounded-sm border border-border bg-card p-6 text-muted-foreground">
          Tu cuenta no tiene permisos de administración. Solo las 2 primeras cuentas creadas son administradoras.
        </p>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-wider ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="mt-8">
            {tab === "Inventario PLA" && <Inventario />}
            {tab === "Productos" && <Productos />}
            {tab === "Galería" && <Galeria />}
            {tab === "Proyectos" && <Proyectos />}
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- Inventario ---------- */
type Fil = { id: string; color: string; material: string; nuevo: number; medio: number; pichintun: number; comprar: number };

function Inventario() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["filaments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("filaments").select("*").order("color");
      if (error) throw error;
      return data as Fil[];
    },
  });
  const [color, setColor] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["filaments"] });

  const update = async (id: string, patch: Partial<Fil>) => {
    qc.setQueryData<Fil[]>(["filaments"], (old) => old?.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    const { error } = await supabase.from("filaments").update(patch).eq("id", id);
    if (error) { toast.error("No se pudo guardar"); refresh(); }
  };
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.trim()) return;
    const { error } = await supabase.from("filaments").insert({ color: color.trim() });
    if (error) { toast.error("No se pudo agregar"); return; }
    setColor(""); refresh();
  };
  const remove = async (f: Fil) => {
    if (!confirm(`¿Borrar ${f.color}?`)) return;
    await supabase.from("filaments").delete().eq("id", f.id); refresh();
  };

  const tot = data.reduce((a, f) => ({ rollos: a.rollos + f.nuevo + f.medio + f.pichintun, util: a.util + utilizables(f), comprar: a.comprar + f.comprar }), { rollos: 0, util: 0, comprar: 0 });
  const num = (f: Fil, k: "nuevo" | "medio" | "pichintun" | "comprar") => (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => update(f.id, { [k]: Math.max(0, f[k] - 1) })} className="h-7 w-7 rounded-sm border border-border hover:border-primary">−</button>
      <span className="w-6 text-center">{f[k]}</span>
      <button onClick={() => update(f.id, { [k]: f[k] + 1 })} className="h-7 w-7 rounded-sm border border-border hover:border-primary">+</button>
    </div>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Rollos en total", tot.rollos], ["Utilizables", tot.util], ["Por comprar", tot.comprar]].map(([l, v]) => (
          <div key={l} className="rounded-sm border border-border bg-card p-4">
            <p className="font-mono text-xs uppercase text-muted-foreground">{l}</p>
            <p className="mt-1 text-3xl font-bold text-primary">{v}</p>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-6 flex gap-2">
        <input placeholder="Nuevo color (ej: verde menta)" className={field} value={color} onChange={(e) => setColor(e.target.value)} />
        <button className={btn() + " px-4 py-2 text-xs"}>Agregar</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-sm border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card font-mono text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Color</th><th className="p-3">Nuevo</th><th className="p-3">Medio</th>
              <th className="p-3">Pichintún</th><th className="p-3">Utilizables</th><th className="p-3">Comprar</th><th />
            </tr>
          </thead>
          <tbody>
            {data.map((f) => {
              const u = utilizables(f);
              return (
                <tr key={f.id} className="border-t border-border">
                  <td className="p-3 font-medium">{f.color}</td>
                  <td className="p-2">{num(f, "nuevo")}</td>
                  <td className="p-2">{num(f, "medio")}</td>
                  <td className="p-2">{num(f, "pichintun")}</td>
                  <td className={`p-3 text-center font-bold ${u === 0 ? "text-destructive" : u === 1 ? "text-primary" : ""}`}>{u}</td>
                  <td className="p-2">{num(f, "comprar")}</td>
                  <td className="p-2 text-right"><button onClick={() => remove(f)} className="font-mono text-xs text-muted-foreground hover:text-destructive">borrar</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">Utilizables = nuevos + a medias. En rojo los colores que se acabaron.</p>
    </div>
  );
}

/* ---------- Productos ---------- */
function Productos() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(productsQuery(true));
  const empty = { name: "", description: "", price: "", category: "decoracion" as Category, is_category: false };
  const [f, setF] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const image_path = file ? await uploadImage(file, "products") : null;
      const { error } = await supabase.from("products").insert({ ...f, image_path, sort_order: data.length + 1 });
      if (error) throw error;
      setF(empty); setFile(null); (e.target as HTMLFormElement).reset();
      toast.success("Producto agregado"); refresh();
    } catch { toast.error("No se pudo agregar"); }
    setBusy(false);
  };
  const save = async (id: string, patch: TablesUpdate<"products">) => {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) toast.error("No se pudo guardar"); else refresh();
  };
  const changeImg = async (id: string, file?: File) => {
    if (!file) return;
    try { await save(id, { image_path: await uploadImage(file, "products") }); } catch { toast.error("No se pudo subir la imagen"); }
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`¿Borrar ${name}?`)) return;
    await supabase.from("products").delete().eq("id", id); refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <form onSubmit={add} className="space-y-3 rounded-sm border border-border bg-card/50 p-5">
        <h2 className="font-bold">Nuevo producto</h2>
        <input required placeholder="Nombre" className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <textarea placeholder="Descripción" rows={3} className={field} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <input placeholder="Precio (ej: Desde $5.000)" className={field} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <select aria-label="Categoría del nuevo producto" className={field} value={f.category} onChange={(e) => setF({ ...f, category: parseCategory(e.target.value) ?? "decoracion" })}>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input type="file" accept="image/*" className={field} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button disabled={busy} className={btn() + " w-full py-2 text-xs"}>{busy ? "Subiendo..." : "Agregar"}</button>
      </form>
      <div className="space-y-4">
        {data.map((p) => (
          <div key={p.id} className="flex gap-4 rounded-sm border border-border bg-card p-4">
            <label className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-sm bg-muted" title="Cambiar imagen">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
              <span className="absolute inset-x-0 bottom-0 bg-background/80 text-center font-mono text-[10px]">cambiar</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => changeImg(p.id, e.target.files?.[0])} />
            </label>
            <div className="flex-1 space-y-2">
              <input defaultValue={p.name} className={field} onBlur={(e) => e.target.value !== p.name && save(p.id, { name: e.target.value })} />
              <input defaultValue={p.description} className={field} onBlur={(e) => e.target.value !== p.description && save(p.id, { description: e.target.value })} />
              <select aria-label={`Categoría de ${p.name}`} className={field} value={p.category} onChange={(e) => save(p.id, { category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <label className="flex items-center gap-2 font-mono text-xs">
                <input type="checkbox" checked={p.is_category} onChange={(e) => save(p.id, { is_category: e.target.checked })} /> Portada de categoría
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input defaultValue={p.price} className={field + " max-w-[12rem]"} onBlur={(e) => e.target.value !== p.price && save(p.id, { price: e.target.value })} />
                <label className="flex items-center gap-2 font-mono text-xs">
                  <input type="checkbox" checked={p.visible} onChange={(e) => save(p.id, { visible: e.target.checked })} /> Visible
                </label>
                <button onClick={() => remove(p.id, p.name)} className="ml-auto font-mono text-xs text-muted-foreground hover:text-destructive">borrar</button>
              </div>
            </div>
          </div>
        ))}
        <p className="font-mono text-xs text-muted-foreground">Los cambios de texto se guardan al salir del campo.</p>
      </div>
    </div>
  );
}

/* ---------- Galería ---------- */
function Galeria() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(galleryQuery());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error("Elige una foto"); return; }
    setBusy(true);
    try {
      const image_path = await uploadImage(file, "gallery");
      const { error } = await supabase.from("gallery").insert({ title, description, image_path });
      if (error) throw error;
      setTitle(""); setDescription(""); setFile(null); (e.target as HTMLFormElement).reset();
      toast.success("Foto agregada"); qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch { toast.error("No se pudo subir"); }
    setBusy(false);
  };
  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta foto?")) return;
    await supabase.from("gallery").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      <form onSubmit={add} className="space-y-3 rounded-sm border border-border bg-card/50 p-5">
        <h2 className="font-bold">Subir impresión</h2>
        <input type="file" accept="image/*" required className={field} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <input placeholder="Título (opcional)" className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Descripción (opcional)" rows={3} className={field} value={description} onChange={(e) => setDescription(e.target.value)} />
        <button disabled={busy} className={btn() + " w-full py-2 text-xs"}>{busy ? "Subiendo..." : "Subir"}</button>
      </form>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {!data.length && <p className="col-span-full text-muted-foreground">Aún no hay fotos.</p>}
        {data.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-sm border border-border bg-card">
            {g.image_url && <img src={g.image_url} alt={g.title} className="aspect-square w-full object-cover" />}
            <div className="flex items-center justify-between gap-2 p-2">
              <span className="truncate text-xs">{g.title || "Sin título"}</span>
              <button onClick={() => remove(g.id)} className="font-mono text-xs text-muted-foreground hover:text-destructive">borrar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Proyectos ---------- */
const STATUS = ["nuevo", "cotizado", "en impresión", "entregado", "descartado"];

function Proyectos() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const setStatus = async (id: string, status: string) => {
    await supabase.from("project_requests").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["requests"] });
  };
  const remove = async (id: string) => {
    if (!confirm("¿Borrar esta solicitud?")) return;
    await supabase.from("project_requests").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  if (!data.length) return <p className="text-muted-foreground">Todavía no llegan proyectos desde el formulario.</p>;
  return (
    <div className="space-y-4">
      {data.map((r) => (
        <article key={r.id} className="rounded-sm border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">{r.nombre}</h3>
              <p className="font-mono text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString("es-CL")} · {r.contacto || "sin contacto"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select value={r.status} onChange={(e) => setStatus(r.id, e.target.value)} className={field + " w-auto"}>
                {STATUS.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => remove(r.id)} className="font-mono text-xs text-muted-foreground hover:text-destructive">borrar</button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm">{r.detalle}</p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            {r.material} · Cantidad {r.cantidad}{r.tamano && ` · ${r.tamano}`}{r.archivo_nombre && ` · Archivo: ${r.archivo_nombre}`}
          </p>
        </article>
      ))}
    </div>
  );
}
