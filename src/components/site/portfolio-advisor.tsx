import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Disclaimer } from "@/components/site/disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Row = { name: string; amount: number };

export function PortfolioAdvisor({ initial }: { initial?: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial?.length ? initial : [{ name: "Bitcoin", amount: 10000 }, { name: "Bank savings", amount: 20000 }]);
  const [goal, setGoal] = useState("Long-term growth");
  const [horizon, setHorizon] = useState("5+ years");
  const [risk, setRisk] = useState("Moderate");
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const set = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  async function run() {
    const holdings = rows.filter((r) => r.name.trim() && r.amount > 0);
    if (!holdings.length) return setErr("Add at least one holding with an amount.");
    setErr(""); setOut(""); setBusy(true);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/portfolio-review", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.current.signal,
        body: JSON.stringify({ holdings, goal, horizon, risk, notes }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Something went wrong.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOut((o) => o + dec.decode(value, { stream: true }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setErr((e as Error).message);
    } finally { setBusy(false); }
  }

  const sel = (v: string, f: (s: string) => void, opts: string[]) => (
    <Select value={v} onValueChange={f}><SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card className="surface"><CardContent className="space-y-5 p-6">
        <div>
          <p className="mb-2 text-sm font-medium">Your holdings</p>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Input aria-label="Holding name" placeholder="e.g. ETH, S&P 500 ETF" value={r.name} onChange={(e) => set(i, { name: e.target.value })} />
                <Input aria-label="Amount in USD" type="number" min={0} className="w-32" value={r.amount} onChange={(e) => set(i, { amount: Number(e.target.value) })} />
                <Button variant="ghost" size="icon" aria-label="Remove holding" onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setRows([...rows, { name: "", amount: 0 }])}><Plus className="size-4" />Add holding</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Goal</Label>{sel(goal, setGoal, ["Long-term growth", "Regular income", "Capital preservation", "Retirement", "Buy a home"])}</div>
          <div className="space-y-1.5"><Label>Horizon</Label>{sel(horizon, setHorizon, ["Under 1 year", "1–3 years", "3–5 years", "5+ years"])}</div>
          <div className="space-y-1.5"><Label>Risk tolerance</Label>{sel(risk, setRisk, ["Low", "Moderate", "High"])}</div>
        </div>
        <div className="space-y-1.5"><Label htmlFor="notes">Anything else? (optional)</Label>
          <Textarea id="notes" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. I may need some cash in 18 months" /></div>
        <div className="flex gap-2">
          <Button onClick={run} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Analyse my portfolio</Button>
          {busy && <Button variant="ghost" onClick={() => abort.current?.abort()}>Stop</Button>}
        </div>
        {err && <p className="text-sm text-destructive" role="alert">{err}</p>}
      </CardContent></Card>

      <Card className="surface"><CardContent className="p-6" aria-live="polite">
        {out ? (
          <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mt-2 [&_p]:text-muted-foreground">
            <ReactMarkdown>{out}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{busy ? "Analysing your allocation…" : "Enter your holdings and goals, then run the AI-powered analysis to see concentration risks and diversification considerations."}</p>
        )}
        <Disclaimer className="mt-6">AI-generated educational content, not personal financial advice. It may contain errors. Returns are never guaranteed and capital is at risk.</Disclaimer>
      </CardContent></Card>
    </div>
  );
}
