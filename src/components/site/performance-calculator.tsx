import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ProjectionLabel } from "@/components/site/disclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usd } from "@/lib/format";
import { cn } from "@/lib/utils";

const presets = [1000, 5000, 10000, 25000, 50000];
const periods = [3, 6, 12, 24, 36, 60];

export function PerformanceCalculator({ compact = false }: { compact?: boolean }) {
  const [initial, setInitial] = useState(10000);
  const [custom, setCustom] = useState("");
  const [monthly, setMonthly] = useState(500);
  const [months, setMonths] = useState(24);
  const [rate, setRate] = useState(1.5);

  const series = useMemo(() => {
    const rows = [] as { month: string; capital: number; projected: number }[];
    let capital = initial;
    let value = initial;
    rows.push({ month: "M0", capital, projected: value });
    for (let m = 1; m <= months; m++) {
      value = value * (1 + rate / 100) + monthly;
      capital += monthly;
      rows.push({ month: `M${m}`, capital: Math.round(capital), projected: Math.round(value) });
    }
    return rows;
  }, [initial, monthly, months, rate]);

  const last = series[series.length - 1]!;
  const contributions = monthly * months;
  const growth = last.projected - last.capital;

  return (
    <Card className="surface overflow-hidden border-border/70">
      <CardContent className={cn("grid gap-8 p-6 lg:grid-cols-[minmax(0,340px)_1fr]", compact && "p-5")}>
        <div className="space-y-6">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Initial investment</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setInitial(p);
                    setCustom("");
                  }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    initial === p && !custom
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {usd(p)}
                </button>
              ))}
            </div>
            <Input
              className="mt-3"
              inputMode="numeric"
              placeholder="Custom amount (USD)"
              value={custom}
              onChange={(e) => {
                const v = e.target.value.replace(/[^\d]/g, "");
                setCustom(v);
                if (v) setInitial(Number(v));
              }}
              aria-label="Custom initial investment"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">Monthly contribution</Label>
              <span className="font-mono text-sm text-foreground">{usd(monthly)}</span>
            </div>
            <Slider
              className="mt-4"
              value={[monthly]}
              min={0}
              max={10000}
              step={100}
              onValueChange={([v]) => setMonthly(v ?? 0)}
              aria-label="Monthly contribution"
            />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Investment period</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setMonths(p)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    months === p
                      ? "border-primary/60 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Target monthly return
              </Label>
              <span className="font-mono text-sm text-primary">{rate.toFixed(1)}%</span>
            </div>
            <Slider
              className="mt-4"
              value={[rate]}
              min={0.2}
              max={3}
              step={0.1}
              onValueChange={([v]) => setRate(v ?? 1)}
              aria-label="Target monthly return"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Target only. Actual strategy performance may be materially lower, including losses.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Metric label="Initial capital" value={usd(initial)} />
            <Metric label="Contributions" value={usd(contributions)} />
            <Metric label="Illustrative growth" value={usd(growth)} tone="primary" />
            <Metric label="Illustrative ending value" value={usd(last.projected)} tone="primary" />
            <Metric label="Capital invested" value={usd(last.capital)} />
            <Metric
              label="Illustrative gain"
              value={`${last.capital ? ((growth / last.capital) * 100).toFixed(1) : "0.0"}%`}
              tone="primary"
            />
          </div>

          <div className="h-64 w-full rounded-lg border border-border/60 bg-background/40 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="calcProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="calcCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, n) => [usd(v), n === "capital" ? "Capital invested" : "Illustrative value"]}
                />
                <Legend
                  formatter={(v) => (v === "capital" ? "Capital invested" : "Illustrative portfolio value")}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Area type="monotone" dataKey="capital" stroke="var(--cyan)" fill="url(#calcCapital)" strokeWidth={2} />
                <Area type="monotone" dataKey="projected" stroke="var(--gold)" fill="url(#calcProjected)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <ProjectionLabel />
          <p className="text-xs leading-relaxed text-muted-foreground">
            This calculator compounds your inputs arithmetically. It does not model fees beyond those disclosed
            per strategy, drawdowns, liquidity constraints, taxes or market shocks. Past and target figures are
            not indicators of future results and capital is at risk.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("mt-1.5 font-mono text-lg", tone === "primary" ? "text-primary" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

export function CalculatorCta() {
  return (
    <Button asChild variant="outline">
      <a href="/performance">Open full calculator</a>
    </Button>
  );
}
