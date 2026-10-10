import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHero } from "@/components/site/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_site/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Meridian Digital Asset Management" },
      { name: "description", content: "Speak with our investor relations and client service team." },
      { property: "og:title", content: "Contact Meridian" },
      { property: "og:description", content: "Investor relations, onboarding and support enquiries." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Check the form"); return; }
    toast.success("Thank you — our team will reply within one business day.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to our team" description="Questions about strategies, onboarding or your account — we respond within one business day." />
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, t: "Email", v: "clients@meridian.capital" },
            { icon: Phone, t: "Phone", v: "+44 20 0000 0000" },
            { icon: MapPin, t: "Office", v: "London · Zug · Singapore" },
          ].map((c) => (
            <Card key={c.t} className="surface">
              <CardContent className="flex items-center gap-4 p-5">
                <c.icon className="size-5 text-primary" aria-hidden />
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</p><p className="text-sm">{c.v}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="surface">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div><Label htmlFor="n">Name</Label><Input id="n" maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label htmlFor="e">Email</Label><Input id="e" type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label htmlFor="m">Message</Label><Textarea id="m" rows={6} maxLength={1000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <Button type="submit">Send message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
