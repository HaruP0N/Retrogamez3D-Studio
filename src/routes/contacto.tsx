import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { SITE, igLink, waLink } from "@/lib/site";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Contacto — RetroGamez3D Impresión 3D" },
      { name: "description", content: "Escríbenos por WhatsApp, Instagram o correo." },
      { property: "og:title", content: "Contacto — RetroGamez3D" },
      { property: "og:description", content: "Escríbenos por WhatsApp, Instagram o correo." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const items = [
    { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsappLabel, href: waLink() },
    { icon: Instagram, label: "Instagram", value: `@${SITE.instagram}`, href: igLink },
    { icon: Mail, label: "Correo", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Phone, label: "Teléfono", value: SITE.whatsappLabel, href: `tel:+${SITE.whatsapp}` },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Contacto</p>
      <h1 className="mt-3 text-4xl font-bold md:text-6xl">Hablemos</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Respondemos rápido por WhatsApp e Instagram.</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value, href }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer"
            className="group flex items-center gap-5 rounded-sm border border-border bg-card p-6 transition-colors hover:border-primary">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="text-lg font-bold group-hover:text-primary">{value}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
