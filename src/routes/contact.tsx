import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { PageShell, PageHeader } from "@/components/shop/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ElectroMaison" },
      { name: "description", content: "Contactez ElectroMaison pour toute question, commande ou demande d'information." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message envoyé — nous vous répondrons rapidement.");
    }, 600);
  };
  return (
    <PageShell>
      <PageHeader title="Contactez-nous" subtitle="Une question, une commande, un besoin spécifique ? Écrivez-nous." />
      <section className="container mx-auto px-3 sm:px-4 py-8 md:py-10 grid md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <InfoRow icon={Phone} title="Téléphone" value="76 577 95 74 / 77 235 04 14" />
          <InfoRow icon={Mail} title="Email" value="contact@fallelectro.sn" />
          <InfoRow icon={MapPin} title="Adresse" value="Showroom Dakar — Avenue Lamine Gueye" />
        </div>
        <form onSubmit={onSubmit} className="md:col-span-2 rounded-2xl border border-border bg-card p-5 md:p-7 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom complet" name="name" required />
            <Field label="Email" name="email" type="email" required />
          </div>
          <Field label="Sujet" name="subject" required />
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea name="message" required rows={6} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </div>
          <button disabled={sending} className="inline-flex items-center gap-2 rounded-xl bg-primary-gradient text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-elevated disabled:opacity-60">
            <Send className="h-4 w-4" /> {sending ? "Envoi..." : "Envoyer le message"}
          </button>
        </form>
      </section>
    </PageShell>
  );
}

function InfoRow({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
