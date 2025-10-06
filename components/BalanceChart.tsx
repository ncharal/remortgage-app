"use client";

import React from "react";
import * as Recharts from "recharts";

// Cast Recharts bits to avoid React types mismatch across deps
const RC = Recharts.ResponsiveContainer as unknown as React.ComponentType<any>;
const LC = Recharts.LineChart as unknown as React.ComponentType<any>;
const LN = Recharts.Line as unknown as React.ComponentType<any>;
const XAx = Recharts.XAxis as unknown as React.ComponentType<any>;
const YAx = Recharts.YAxis as unknown as React.ComponentType<any>;
const TT = Recharts.Tooltip as unknown as React.ComponentType<any>;
const LG = Recharts.Legend as unknown as React.ComponentType<any>;

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
        <LC data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <XAx dataKey="month" tickFormatter={(v: number) => `${v}m`} />
          <YAx tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} />
          <TT
            formatter={(v: any) => `£${Number(v).toFixed(2)}`}
            labelFormatter={(l: any) => `Month ${l}`}
          />
          <LG />
          {seriesNames.map((name, idx) => (
            <LN key={idx} type="monotone" dataKey={name} dot={false} strokeWidth={2} />
          ))}
        </LC>
      </RC>
    </div>
  );
}
