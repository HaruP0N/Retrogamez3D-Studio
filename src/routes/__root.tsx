import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { House, Lock, Instagram } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { igLink } from "@/lib/site";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RetroGamez3D — Impresión 3D" },
      { name: "description", content: "Impresión 3D a pedido y productos impresos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@400;500;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/productos", label: "Productos" },
  { to: "/galeria", label: "Galería" },
  { to: "/tu-proyecto", label: "Tu proyecto" },
  { to: "/como-trabajamos", label: "Cómo trabajamos" },
  { to: "/contacto", label: "Contacto" },
] as const;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <img src="/hero-badge.png" alt="RetroGamez3D Logo" className="h-9 w-9 object-contain" />
            <span>RetroGamez<span className="text-primary">3D</span></span>
          </Link>
          <nav className="flex flex-wrap items-center gap-5 font-mono text-xs uppercase tracking-wider">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              <House size={14} strokeWidth={2.5} aria-hidden="true" />
              Inicio
            </Link>
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="hidden sm:block h-4 w-px bg-border" aria-hidden="true" />
            <a
              href={igLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center rounded-sm text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-card"
              title="Síguenos en Instagram (@retrogamez3d)"
              aria-label="Instagram RetroGamez3D"
            >
              <Instagram size={17} strokeWidth={2.2} />
            </a>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/hero-badge.png" alt="RetroGamez3D" className="h-5 w-5 object-contain" />
            <span>© {new Date().getFullYear()} RetroGamez3D · Impresión 3D</span>
          </div>
          <span>Impresión 3D retro y personalizada.</span>
          <div className="flex items-center gap-4">
            <a
              href={igLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <Instagram size={13} strokeWidth={2.2} />
              <span>@retrogamez3d</span>
            </a>
            <Link
              to="/"
              className="flex items-center gap-1.5 hover:text-primary"
            >
              <House size={13} strokeWidth={2.5} aria-hidden="true" />
              Volver al inicio
            </Link>
            <Link to="/admin" className="flex items-center gap-1.5 hover:text-primary">
              <Lock size={12} strokeWidth={2.5} aria-hidden="true" />
              Admin
            </Link>
          </div>
        </div>
      </footer>
      <Toaster />
    </QueryClientProvider>
  );
}
