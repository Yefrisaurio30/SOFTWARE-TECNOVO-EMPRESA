"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesChart({ data }: { data: Array<{ day: string; total: number }> }) {
  if (data.every((d) => d.total === 0)) {
    return <p className="text-sm text-text-muted">Sin ventas registradas en los últimos 7 días.</p>;
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: "#A1A1A6", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#6E6E73", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12 }}
            labelStyle={{ color: "#F5F5F7" }}
            formatter={(value) => [new Intl.NumberFormat("es-CO").format(Number(value ?? 0)), "Ventas"]}
          />
          <Bar dataKey="total" fill="#B8C2CF" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
