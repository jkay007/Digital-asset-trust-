import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { PortfolioAsset } from "@/lib/types";

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
];

export function AllocationDonut({ assets, height = 280 }: { assets: PortfolioAsset[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={assets}
            dataKey="weight"
            nameKey="name"
            innerRadius="58%"
            outerRadius="88%"
            paddingAngle={2}
            stroke="var(--background)"
            strokeWidth={2}
          >
            {assets.map((a, i) => (
              <Cell key={a.id} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number, n) => [`${v}%`, n]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AllocationLegend({ assets }: { assets: PortfolioAsset[] }) {
  return (
    <ul className="space-y-2.5">
      {assets.map((a, i) => (
        <li key={a.id} className="flex items-center justify-between gap-4 text-sm">
          <span className="flex items-center gap-2.5">
            <span
              className="size-2.5 rounded-sm"
              style={{ background: palette[i % palette.length] }}
              aria-hidden
            />
            <span className="text-muted-foreground">{a.name}</span>
          </span>
          <span className="font-mono text-foreground">{a.weight}%</span>
        </li>
      ))}
    </ul>
  );
}

export { palette as chartPalette };
