import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_site/login")({
  head: () => ({
    meta: [
      { title: "Investor Login — Meridian Digital Asset Management" },
      { name: "description", content: "Sign in to your Meridian investor dashboard." },
      { property: "og:title", content: "Investor login — Meridian" },
      { property: "og:description", content: "Secure access to your portfolio and statements." },
    ],
  }),
  component: Login,
});

function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("investor@meridian.capital");
  const [password, setPassword] = useState("investor123");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Welcome back");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="grid-bg mx-auto flex max-w-md flex-col px-6 py-20">
      <h1 className="text-3xl font-semibold">Investor login</h1>
      <p className="mt-2 text-sm text-muted-foreground">Demo credentials are pre-filled.</p>
      <Card className="surface mt-8">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-6 text-sm text-muted-foreground">
        New to Meridian? <Link to="/register" className="text-primary underline">Create an account</Link> ·{" "}
        <Link to="/admin" className="text-primary underline">Admin console</Link>
      </p>
    </div>
  );
}
