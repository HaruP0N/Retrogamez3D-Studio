import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { btn } from "@/components/ui-btn";
import { galleryQuery, productsQuery, uploadImage, utilizables } from "@/lib/data";
import { CATEGORIES, parseCategory, type Category } from "@/lib/catalog";
import {
  Boxes,
  ShoppingBag,
  Image as ImageIcon,
  ClipboardList,
  ExternalLink,
  LogOut,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  MessageSquare,
  Mail,
  FileCode,
  Upload,
  X,
  Sparkles,
  Layers,
  ArrowUpRight,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Panel de administración — RetroGamez3D" },
      { name: "description", content: "Gestiona productos, inventario, galería y proyectos de RetroGamez3D." },
      { property: "og:title", content: "Panel de administración — RetroGamez3D" },
      { property: "og:description", content: "Gestiona productos, inventario, galería y proyectos de RetroGamez3D." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const field =
  "w-full rounded-sm border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/60";

const TABS = [
  { id: "inventario", label: "Inventario PLA", icon: Boxes },
  { id: "productos", label: "Productos", icon: ShoppingBag },
  { id: "galeria", label: "Galería", icon: ImageIcon },
  { id: "proyectos", label: "Proyectos", icon: ClipboardList },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Admin() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>("inventario");

  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data === true,
  });

  // Queries for badges and summary counters
  const { data: filaments = [] } = useQuery({
    queryKey: ["filaments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("filaments").select("*").order("color");
      if (error) throw error;
      return data;
    },
    enabled: role.data === true,
  });

  const { data: products = [] } = useQuery({
    ...productsQuery(true),
    enabled: role.data === true,
  });

  const { data: gallery = [] } = useQuery({
    ...galleryQuery(),
    enabled: role.data === true,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: role.data === true,
  });

  const pendingRequestsCount = useMemo(() => requests.filter((r) => r.status === "nuevo").length, [requests]);
  const filamentsToBuyCount = useMemo(() => filaments.filter((f) => f.comprar > 0).length, [filaments]);

  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <img src="/hero-badge.png" alt="RetroGamez3D" className="h-10 w-10 object-contain drop-shadow" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">// Panel de Control</span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                RetroGamez3D
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Administración</h1>
            <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            target="_blank"
            className={btn({ variant: "outline" }) + " flex items-center gap-1.5 px-3 py-2 text-xs"}
            title="Abrir la tienda en una pestaña nueva"
          >
            <ExternalLink size={13} />
            <span>Ver tienda</span>
          </Link>
          <button
            onClick={logout}
            className={btn({ variant: "outline" }) + " flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground hover:text-destructive"}
          >
            <LogOut size={13} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {role.isLoading ? (
        <div className="mt-16 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : !role.data ? (
        <div className="mt-10 rounded-sm border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          <p className="font-bold">Acceso restringido</p>
          <p className="mt-1 text-muted-foreground">
            Tu cuenta no tiene permisos de administración. Solo los administradores autorizados pueden acceder a este panel.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Metrics Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              onClick={() => setTab("proyectos")}
              className={`cursor-pointer rounded-sm border p-3 transition-colors ${
                pendingRequestsCount > 0
                  ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                  : "border-border bg-card/60 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] uppercase tracking-wider">Nuevos Proyectos</span>
                <ClipboardList size={14} className={pendingRequestsCount > 0 ? "text-amber-400" : ""} />
              </div>
              <p className={`mt-1.5 text-2xl font-bold ${pendingRequestsCount > 0 ? "text-amber-400" : "text-foreground"}`}>
                {pendingRequestsCount}
              </p>
            </div>

            <div
              onClick={() => setTab("productos")}
              className="cursor-pointer rounded-sm border border-border bg-card/60 p-3 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] uppercase tracking-wider">Productos</span>
                <ShoppingBag size={14} />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{products.length}</p>
            </div>

            <div
              onClick={() => setTab("inventario")}
              className="cursor-pointer rounded-sm border border-border bg-card/60 p-3 transition-colors hover:border-primary/50"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] uppercase tracking-wider">Colores PLA</span>
                <Boxes size={14} />
              </div>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{filaments.length}</p>
            </div>

            <div
              onClick={() => setTab("inventario")}
              className={`cursor-pointer rounded-sm border p-3 transition-colors ${
                filamentsToBuyCount > 0
                  ? "border-primary/40 bg-primary/5 hover:border-primary"
                  : "border-border bg-card/60 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono text-[11px] uppercase tracking-wider">Por comprar</span>
                <AlertTriangle size={14} className={filamentsToBuyCount > 0 ? "text-primary" : ""} />
              </div>
              <p className={`mt-1.5 text-2xl font-bold ${filamentsToBuyCount > 0 ? "text-primary" : "text-foreground"}`}>
                {filamentsToBuyCount}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-border">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              const count =
                t.id === "proyectos"
                  ? pendingRequestsCount
                  : t.id === "inventario" && filamentsToBuyCount > 0
                    ? filamentsToBuyCount
                    : null;

              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                    isActive ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={15} />
                  <span>{t.label}</span>
                  {count !== null && count > 0 && (
                    <span
                      className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold ${
                        t.id === "proyectos" ? "bg-amber-500 text-black animate-pulse" : "bg-primary text-black"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="mt-8">
            {tab === "inventario" && <Inventario />}
            {tab === "productos" && <Productos />}
            {tab === "galeria" && <Galeria />}
            {tab === "proyectos" && <Proyectos />}
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================================
   1. INVENTARIO PLA
   ========================================================================= */
type Fil = {
  id: string;
  color: string;
  material: string;
  nuevo: number;
  medio: number;
  pichintun: number;
  comprar: number;
};

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
  const [material, setMaterial] = useState("PLA");
  const [search, setSearch] = useState("");
  const [onlyToBuy, setOnlyToBuy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["filaments"] });

  const update = async (id: string, patch: Partial<Fil>) => {
    qc.setQueryData<Fil[]>(["filaments"], (old) => old?.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    const { error } = await supabase.from("filaments").update(patch).eq("id", id);
    if (error) {
      toast.error("No se pudo guardar el cambio");
      refresh();
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!color.trim()) return;
    const { error } = await supabase.from("filaments").insert({
      color: color.trim(),
      material: material.trim() || "PLA",
      nuevo: 1,
      medio: 0,
      pichintun: 0,
      comprar: 0,
    });
    if (error) {
      toast.error("No se pudo agregar el filamento");
      return;
    }
    toast.success(`Color "${color.trim()}" agregado`);
    setColor("");
    refresh();
  };

  const remove = async (f: Fil) => {
    if (!confirm(`¿Eliminar filamento "${f.color}"?`)) return;
    await supabase.from("filaments").delete().eq("id", f.id);
    toast.success("Filamento eliminado");
    refresh();
  };

  const tot = data.reduce(
    (a, f) => ({
      rollos: a.rollos + f.nuevo + f.medio + f.pichintun,
      util: a.util + utilizables(f),
      comprar: a.comprar + f.comprar,
    }),
    { rollos: 0, util: 0, comprar: 0 },
  );

  const filtered = useMemo(() => {
    return data.filter((f) => {
      const matchesSearch = f.color.toLowerCase().includes(search.toLowerCase()) || f.material.toLowerCase().includes(search.toLowerCase());
      const matchesToBuy = onlyToBuy ? f.comprar > 0 : true;
      return matchesSearch && matchesToBuy;
    });
  }, [data, search, onlyToBuy]);

  const num = (f: Fil, k: "nuevo" | "medio" | "pichintun" | "comprar") => (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => update(f.id, { [k]: Math.max(0, f[k] - 1) })}
        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-card/80 text-sm font-semibold transition-colors hover:border-primary hover:text-primary active:scale-95"
      >
        −
      </button>
      <span className="w-7 text-center font-mono font-medium">{f[k]}</span>
      <button
        type="button"
        onClick={() => update(f.id, { [k]: f[k] + 1 })}
        className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-card/80 text-sm font-semibold transition-colors hover:border-primary hover:text-primary active:scale-95"
      >
        +
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-xs uppercase tracking-wider">Total Rollos</p>
            <Boxes size={16} />
          </div>
          <p className="mt-1 text-3xl font-bold">{tot.rollos}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">Nuevos + medios + restos</p>
        </div>

        <div className="rounded-sm border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-xs uppercase tracking-wider">Utilizables para Imprimir</p>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="mt-1 text-3xl font-bold text-primary">{tot.util}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">Rollos nuevos + a medio uso</p>
        </div>

        <div className={`rounded-sm border p-4 ${tot.comprar > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
          <div className="flex items-center justify-between text-muted-foreground">
            <p className="font-mono text-xs uppercase tracking-wider">Por Comprar / Reponer</p>
            <AlertTriangle size={16} className={tot.comprar > 0 ? "text-amber-400" : ""} />
          </div>
          <p className={`mt-1 text-3xl font-bold ${tot.comprar > 0 ? "text-amber-400" : "text-muted-foreground"}`}>{tot.comprar}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">Bobinas marcadas para pedido</p>
        </div>
      </div>

      {/* Add & Filter Toolbar */}
      <div className="grid gap-4 rounded-sm border border-border bg-card/40 p-4 md:grid-cols-[1.5fr_1fr]">
        {/* Add filament */}
        <form onSubmit={add} className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Color nuevo (ej: Azul Noche, Gris Seda, etc.)"
            className={field + " flex-1 min-w-[200px]"}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            placeholder="Material"
            className={field + " w-24"}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
          <button type="submit" className={btn() + " flex items-center gap-1.5 px-4 py-2 text-xs shrink-0"}>
            <Plus size={14} />
            <span>Agregar</span>
          </button>
        </form>

        {/* Search & toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar color..."
              className={field + " pl-8"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOnlyToBuy(!onlyToBuy)}
            className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-3 py-2 font-mono text-xs transition-colors ${
              onlyToBuy ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle size={12} />
            <span>Por comprar</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-card/80 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Color / Material</th>
              <th className="p-3 text-center">Nuevo (100%)</th>
              <th className="p-3 text-center">Medio (~50%)</th>
              <th className="p-3 text-center" title="Pichintún: poco filamento restante">
                Pichintún
              </th>
              <th className="p-3 text-center">Utilizables</th>
              <th className="p-3 text-center">Por comprar</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!filtered.length ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  {search || onlyToBuy ? "No se encontraron filamentos con ese filtro." : "Aún no hay filamentos registrados."}
                </td>
              </tr>
            ) : (
              filtered.map((f) => {
                const u = utilizables(f);
                const isOutOfStock = u === 0;
                return (
                  <tr key={f.id} className="transition-colors hover:bg-card/40">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isOutOfStock ? "bg-destructive" : u === 1 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                        />
                        <span>{f.color}</span>
                        {f.material && f.material !== "PLA" && (
                          <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {f.material}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">{num(f, "nuevo")}</td>
                    <td className="p-2">{num(f, "medio")}</td>
                    <td className="p-2">{num(f, "pichintun")}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center rounded-sm px-2 py-0.5 font-mono text-xs font-bold ${
                          isOutOfStock
                            ? "bg-destructive/15 text-destructive"
                            : u === 1
                              ? "bg-amber-500/15 text-amber-400"
                              : "text-foreground"
                        }`}
                      >
                        {u}
                      </span>
                    </td>
                    <td className="p-2">{num(f, "comprar")}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => remove(f)}
                        className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Eliminar filamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
        <p>• Utilizables = bobinas nuevas + a medias. En rojo los colores agotados.</p>
        <p>• "Pichintún" = restos de filamento ideales para muestras pequeñas.</p>
      </div>
    </div>
  );
}

/* =========================================================================
   2. PRODUCTOS
   ========================================================================= */
function Productos() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(productsQuery(true));
  const empty = {
    name: "",
    description: "",
    price: "",
    category: "decoracion" as Category,
    is_category: false,
    visible: true,
  };
  const [f, setF] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("todas");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    setBusy(true);
    try {
      const image_path = file ? await uploadImage(file, "products") : null;
      const { error } = await supabase.from("products").insert({
        ...f,
        name: f.name.trim(),
        image_path,
        sort_order: data.length + 1,
      });
      if (error) throw error;
      setF(empty);
      clearFile();
      toast.success("Producto agregado correctamente");
      refresh();
    } catch {
      toast.error("No se pudo agregar el producto");
    }
    setBusy(false);
  };

  const save = async (id: string, patch: TablesUpdate<"products">, silent = false) => {
    const { error } = await supabase.from("products").update(patch).eq("id", id);
    if (error) {
      toast.error("No se pudo guardar el cambio");
    } else {
      if (!silent) toast.success("Guardado");
      refresh();
    }
  };

  const changeImg = async (id: string, newFile?: File) => {
    if (!newFile) return;
    try {
      const image_path = await uploadImage(newFile, "products");
      await save(id, { image_path }, true);
      toast.success("Imagen actualizada");
    } catch {
      toast.error("No se pudo subir la imagen");
    }
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`¿Borrar el producto "${name}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Producto eliminado");
    refresh();
  };

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesCat = selectedCat === "todas" ? true : p.category === selectedCat;
      return matchesSearch && matchesCat;
    });
  }, [data, search, selectedCat]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.8fr]">
      {/* Form: Add New Product */}
      <form onSubmit={add} className="space-y-4 rounded-sm border border-border bg-card/60 p-5 self-start sticky top-20">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Plus size={16} className="text-primary" />
          <h2 className="font-bold text-base">Nuevo producto</h2>
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Nombre *</label>
          <input
            required
            placeholder="Ej: Soporte Control PS5 Retro"
            className={field}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Descripción</label>
          <textarea
            placeholder="Detalles, acabado, dimensiones recomendadas..."
            rows={2}
            className={field}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Precio</label>
            <input
              placeholder="Ej: Desde $7.990"
              className={field}
              value={f.price}
              onChange={(e) => setF({ ...f, price: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Categoría</label>
            <select
              aria-label="Categoría del nuevo producto"
              className={field}
              value={f.category}
              onChange={(e) => setF({ ...f, category: parseCategory(e.target.value) ?? "decoracion" })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image File with Preview */}
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Foto del producto</label>
          {preview ? (
            <div className="relative mb-2 h-36 w-full overflow-hidden rounded-sm border border-border bg-black/40">
              <img src={preview} alt="Vista previa" className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground backdrop-blur hover:bg-destructive hover:text-white"
                title="Quitar foto"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card/40 transition-colors hover:border-primary">
              <Upload size={18} className="text-muted-foreground" />
              <span className="mt-1 font-mono text-xs text-muted-foreground">Seleccionar imagen</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1 font-mono text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={f.visible}
              onChange={(e) => setF({ ...f, visible: e.target.checked })}
              className="accent-primary"
            />
            <span>Visible inmediatamente en catálogo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground">
            <input
              type="checkbox"
              checked={f.is_category}
              onChange={(e) => setF({ ...f, is_category: e.target.checked })}
              className="accent-primary"
            />
            <span>Usar como portada de categoría</span>
          </label>
        </div>

        <button disabled={busy} className={btn() + " w-full py-2.5 text-xs font-semibold"}>
          {busy ? "Subiendo producto..." : "Publicar producto"}
        </button>
      </form>

      {/* Product List & Search */}
      <div className="space-y-4">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en catálogo..."
              className={field + " pl-8 py-1.5 text-xs"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCat("todas")}
              className={`rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase transition-colors ${
                selectedCat === "todas" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground bg-card"
              }`}
            >
              Todas ({data.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = data.filter((p) => p.category === c.value).length;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedCat(c.value)}
                  className={`rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase transition-colors ${
                    selectedCat === c.value ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground bg-card"
                  }`}
                >
                  {c.label.split(" ")[0]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards */}
        {!filtered.length ? (
          <div className="rounded-sm border border-border bg-card p-12 text-center text-muted-foreground">
            No se encontraron productos con los filtros seleccionados.
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col gap-4 rounded-sm border p-4 transition-colors sm:flex-row ${
                p.visible ? "border-border bg-card" : "border-border/60 bg-card/40 opacity-70"
              }`}
            >
              {/* Product Image */}
              <label className="group relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-border bg-muted/40">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                    <ShoppingBag size={20} />
                    <span className="mt-1 font-mono text-[10px]">Sin foto</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                  <span className="font-mono text-[11px] text-white">Cambiar</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => changeImg(p.id, e.target.files?.[0])} />
              </label>

              {/* Product Details Form */}
              <div className="flex-1 space-y-2.5">
                <div className="grid gap-2 sm:grid-cols-[1.5fr_1fr]">
                  <input
                    defaultValue={p.name}
                    placeholder="Nombre del producto"
                    className={field + " font-medium"}
                    onBlur={(e) => e.target.value !== p.name && save(p.id, { name: e.target.value })}
                  />
                  <select
                    aria-label={`Categoría de ${p.name}`}
                    className={field}
                    value={p.category}
                    onChange={(e) => save(p.id, { category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  defaultValue={p.description ?? ""}
                  placeholder="Descripción breve..."
                  className={field + " text-xs"}
                  onBlur={(e) => e.target.value !== (p.description ?? "") && save(p.id, { description: e.target.value })}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      defaultValue={p.price ?? ""}
                      placeholder="Precio (ej: $9.990)"
                      className={field + " w-36 text-xs"}
                      onBlur={(e) => e.target.value !== (p.price ?? "") && save(p.id, { price: e.target.value })}
                    />

                    {/* Visibility Badge Toggle */}
                    <button
                      type="button"
                      onClick={() => save(p.id, { visible: !p.visible })}
                      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                        p.visible
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{p.visible ? "Visible" : "Oculto"}</span>
                    </button>

                    {/* Category Cover Toggle */}
                    <button
                      type="button"
                      onClick={() => save(p.id, { is_category: !p.is_category })}
                      className={`inline-flex items-center gap-1 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                        p.is_category
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                      title="Mostrar como foto principal de la categoría"
                    >
                      <Star size={11} className={p.is_category ? "fill-amber-400" : ""} />
                      <span>Portada</span>
                    </button>
                  </div>

                  <button
                    onClick={() => remove(p.id, p.name)}
                    className="flex items-center gap-1 rounded-sm px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={13} />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <p className="font-mono text-xs text-muted-foreground">
          💡 Los cambios de texto y precio se guardan automáticamente al salir del campo.
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   3. GALERÍA
   ========================================================================= */
function Galeria() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(galleryQuery());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Selecciona una foto para subir");
      return;
    }
    setBusy(true);
    try {
      const image_path = await uploadImage(file, "gallery");
      const { error } = await supabase.from("gallery").insert({
        title: title.trim(),
        description: description.trim(),
        image_path,
      });
      if (error) throw error;
      setTitle("");
      setDescription("");
      clearFile();
      toast.success("Foto agregada a la galería");
      qc.invalidateQueries({ queryKey: ["gallery"] });
    } catch {
      toast.error("No se pudo subir la foto");
    }
    setBusy(false);
  };

  const remove = async (id: string, itemTitle: string) => {
    if (!confirm(`¿Borrar la foto "${itemTitle || "sin título"}" de la galería?`)) return;
    await supabase.from("gallery").delete().eq("id", id);
    toast.success("Foto eliminada");
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
      {/* Upload Form */}
      <form onSubmit={add} className="space-y-4 rounded-sm border border-border bg-card/60 p-5 self-start sticky top-20">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Upload size={16} className="text-primary" />
          <h2 className="font-bold text-base">Subir trabajo a Galería</h2>
        </div>

        {/* Image Input with Preview */}
        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Foto *</label>
          {preview ? (
            <div className="relative mb-2 h-44 w-full overflow-hidden rounded-sm border border-border bg-black/40">
              <img src={preview} alt="Vista previa" className="h-full w-full object-contain" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground backdrop-blur hover:bg-destructive hover:text-white"
                title="Quitar foto"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-border bg-card/40 transition-colors hover:border-primary">
              <ImageIcon size={24} className="text-muted-foreground" />
              <span className="mt-2 font-mono text-xs text-muted-foreground">Elige una foto de la impresión</span>
              <span className="font-mono text-[10px] text-muted-foreground/60">(JPG, PNG o WebP)</span>
              <input ref={fileInputRef} type="file" accept="image/*" required className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Título (opcional)</label>
          <input
            placeholder="Ej: Diorama Mortal Kombat 3D"
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Descripción (opcional)</label>
          <textarea
            placeholder="Materiales usados, tiempo de impresión o detalles..."
            rows={3}
            className={field}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button disabled={busy} className={btn() + " w-full py-2.5 text-xs font-semibold"}>
          {busy ? "Subiendo foto..." : "Publicar en Galería"}
        </button>
      </form>

      {/* Grid of gallery photos */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Fotos publicadas ({data.length})</p>
        </div>

        {!data.length ? (
          <div className="rounded-sm border border-border bg-card p-12 text-center text-muted-foreground">
            Aún no hay impresiones publicadas en la galería.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {data.map((g) => (
              <div key={g.id} className="group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:border-border/80">
                <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                  {g.image_url ? (
                    <img
                      src={g.image_url}
                      alt={g.title ?? "Impresión"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon size={24} />
                    </div>
                  )}
                  <button
                    onClick={() => remove(g.id, g.title ?? "")}
                    className="absolute right-2 top-2 rounded-sm bg-background/80 p-1.5 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:bg-destructive hover:text-white group-hover:opacity-100"
                    title="Eliminar de galería"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-foreground">{g.title || "Sin título"}</p>
                  {g.description && <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{g.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   4. PROYECTOS (COTIZACIONES)
   ========================================================================= */
const STATUS_OPTIONS = [
  { value: "nuevo", label: "Nuevo", badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400 animate-pulse" },
  { value: "cotizado", label: "Cotizado", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30", dot: "bg-blue-400" },
  { value: "en impresión", label: "En impresión", badge: "bg-orange-500/15 text-orange-400 border-orange-500/30", dot: "bg-orange-400" },
  { value: "entregado", label: "Entregado", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  { value: "descartado", label: "Descartado", badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30", dot: "bg-zinc-500" },
] as const;

function getWhatsAppUrl(contact: string, name: string) {
  const clean = contact.replace(/\D/g, "");
  if (!clean || clean.length < 8) return null;
  const phone = clean.length === 9 && clean.startsWith("9") ? `56${clean}` : clean;
  const text = `Hola ${name}! Te escribo desde RetroGamez3D respecto a tu cotización de impresión 3D.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function getEmailUrl(contact: string, name: string) {
  if (!contact.includes("@")) return null;
  const email = contact.trim();
  const subject = `RetroGamez3D — Tu cotización de impresión 3D`;
  const body = `Hola ${name},\n\nTe escribimos de RetroGamez3D respecto a tu solicitud de impresión 3D.\n\nSaludos,\nEquipo RetroGamez3D`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function Proyectos() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [search, setSearch] = useState("");

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
    toast.success(`Estado actualizado a "${status}"`);
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  const remove = async (id: string, clientName: string) => {
    if (!confirm(`¿Borrar la solicitud de "${clientName}"?`)) return;
    await supabase.from("project_requests").delete().eq("id", id);
    toast.success("Solicitud eliminada");
    qc.invalidateQueries({ queryKey: ["requests"] });
  };

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const matchesStatus = filterStatus === "todos" ? true : r.status === filterStatus;
      const matchesSearch =
        r.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (r.contacto ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.detalle ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [data, filterStatus, search]);

  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { todos: data.length };
    for (const opt of STATUS_OPTIONS) {
      counts[opt.value] = data.filter((r) => r.status === opt.value).length;
    }
    return counts;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Top filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-card/40 p-4">
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus("todos")}
            className={`rounded-sm px-3 py-1.5 font-mono text-xs transition-colors ${
              filterStatus === "todos" ? "bg-primary text-black font-semibold" : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({countsByStatus["todos"]})
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterStatus(opt.value)}
              className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-mono text-xs transition-colors ${
                filterStatus === opt.value
                  ? "bg-primary text-black font-semibold"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
              <span>{opt.label}</span>
              <span className="opacity-70 font-bold">({countsByStatus[opt.value] ?? 0})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente o contacto..."
            className={field + " pl-8 py-1.5 text-xs"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {!filtered.length ? (
        <div className="rounded-sm border border-border bg-card p-12 text-center text-muted-foreground">
          {search || filterStatus !== "todos"
            ? "No se encontraron solicitudes con este filtro."
            : "Todavía no llegan proyectos desde el formulario."}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const currentStatus = STATUS_OPTIONS.find((s) => s.value === r.status) ?? STATUS_OPTIONS[0];
            const waUrl = r.contacto ? getWhatsAppUrl(r.contacto, r.nombre) : null;
            const mailUrl = r.contacto ? getEmailUrl(r.contacto, r.nombre) : null;

            return (
              <article key={r.id} className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-border/80">
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{r.nombre}</h3>
                      <span className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold ${currentStatus.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
                        <span>{currentStatus.label}</span>
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      Recibido: {new Date(r.created_at).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>

                  {/* Actions: Status selector & Delete */}
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-xs text-muted-foreground hidden sm:inline">Estado:</label>
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value)}
                      className={field + " w-auto font-mono text-xs py-1.5"}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => remove(r.id, r.nombre)}
                      className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar solicitud"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Body: Details and Specs */}
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    <div className="rounded-sm bg-background/50 p-3.5 border border-border/40">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Descripción del cliente:</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{r.detalle}</p>
                    </div>

                    {/* Technical details pills */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="rounded-sm border border-border bg-card px-2.5 py-1 text-muted-foreground">
                        Material: <strong className="text-foreground">{r.material || "PLA"}</strong>
                      </span>
                      <span className="rounded-sm border border-border bg-card px-2.5 py-1 text-muted-foreground">
                        Cantidad: <strong className="text-foreground">{r.cantidad}</strong>
                      </span>
                      {r.tamano && (
                        <span className="rounded-sm border border-border bg-card px-2.5 py-1 text-muted-foreground">
                          Tamaño: <strong className="text-foreground">{r.tamano}</strong>
                        </span>
                      )}
                      {r.archivo_nombre && (
                        <span className="flex items-center gap-1.5 rounded-sm border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary font-semibold">
                          <FileCode size={13} />
                          <span>Archivo: {r.archivo_nombre}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Contact Box */}
                  <div className="flex flex-col justify-between gap-3 rounded-sm border border-border/60 bg-card/60 p-3.5 min-w-[220px]">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Contacto registrado</span>
                      <p className="mt-1 font-mono text-sm font-semibold text-foreground break-all">{r.contacto || "Sin contacto"}</p>
                    </div>

                    <div className="space-y-1.5">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btn() + " flex w-full items-center justify-center gap-1.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"}
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                          <ArrowUpRight size={12} />
                        </a>
                      )}
                      {mailUrl && (
                        <a
                          href={mailUrl}
                          className={btn({ variant: "outline" }) + " flex w-full items-center justify-center gap-1.5 py-1.5 text-xs"}
                        >
                          <Mail size={13} />
                          <span>Enviar correo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
