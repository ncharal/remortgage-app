"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Recharts sometimes bundles its own @types/react which conflicts with the app's.
// Casting to any here sidesteps the conflicting ReactNode types at compile time.
const RC = ResponsiveContainer as unknown as React.ComponentType<any>;

export default function BalanceChart({
  data,
  seriesNames,
}: {
  data: Array<Record<string, number | string>>;
  seriesNames: string[];
}) {
  return (
    <div className="h-72 w-full">
      <RC width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAxis dataKey="month" tickFormatter={(v: number) => `${v}m`} />
          <YAxis tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
          {/* @ts-expect-error – Recharts tooltip types can conflict in Next 14 */}
          <RTooltip formatter={(v: any) => `£${Number(v).toFixed(2)}`} labelFormatter={(l: any) => `Month ${l}`} />
          <Legend />
          {seriesNames.map((name, idx) => (
            <Line key={idx} type="monotone" dataKey={name} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      </RC>
    </div>
  );
}
