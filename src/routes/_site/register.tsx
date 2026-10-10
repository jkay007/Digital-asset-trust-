import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Disclaimer } from "@/components/site/disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_site/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Meridian Digital Asset Management" },
      { name: "description", content: "Open a Meridian investor account in minutes. Identity verification required." },
      { property: "og:title", content: "Create your Meridian account" },
      { property: "og:description", content: "Access structured digital-asset strategies." },
    ],
  }),
  component: Register,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  country: z.string().trim().min(2, "Enter your country").max(60),
});

function Register() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "", country: "" });
  const [ack, setAck] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Check the form"); return; }
    if (!ack) { toast.error("Please acknowledge the risk disclosure"); return; }
    const r = register(p.data);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Account created — complete verification to start investing");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <Card className="surface mt-8">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            {(["name", "email", "password", "country"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={k} className="capitalize">{k === "name" ? "Full name" : k}</Label>
                <Input id={k} type={k === "password" ? "password" : k === "email" ? "email" : "text"} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              </div>
            ))}
            <label className="flex items-start gap-3 text-xs text-muted-foreground">
              <Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} className="mt-0.5" />
              I understand that returns are not guaranteed, capital is at risk, and I have read the{" "}
              <Link to="/risk-disclosure" className="text-primary underline">risk disclosure</Link> and{" "}
              <Link to="/terms" className="text-primary underline">terms</Link>.
            </label>
            <Button type="submit" className="w-full">Create account</Button>
          </form>
        </CardContent>
      </Card>
      <Disclaimer variant="inline" className="mt-6" />
    </div>
  );
}
