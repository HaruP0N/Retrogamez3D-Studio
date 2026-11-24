import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { btn } from "@/components/ui-btn";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Ingreso administración — RetroGamez3D" },
      { name: "description", content: "Acceso al panel de administración de RetroGamez3D." },
      { property: "og:title", content: "Ingreso administración — RetroGamez3D" },
      { property: "og:description", content: "Acceso al panel de administración de RetroGamez3D." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none focus:border-primary";

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (error) {
      toast.error("Correo o contraseña incorrectos");
      return;
    }
    nav({ to: "/admin" });
  };

  return (
    <section className="mx-auto max-w-md px-5 py-24">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Administración</p>
      <h1 className="mt-3 text-4xl font-bold">Ingreso administración</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="Correo"
          className={field}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          className={field}
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button disabled={busy} className={btn() + " w-full"}>
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}
