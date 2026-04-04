"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockHoldings, mockNetWorthHistory } from "@/lib/mock-data";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const totalValue = mockHoldings.reduce((s, h) => s + h.value, 0);
const dailyChange = mockHoldings.reduce((s, h) => s + (h.value * h.dayChange) / 100, 0);
const dailyChangePct = (dailyChange / (totalValue - dailyChange)) * 100;

// Asset allocation
const allocationMap: Record<string, number> = {};
mockHoldings.forEach((h) => {
  allocationMap[h.category] = (allocationMap[h.category] || 0) + h.value;
});
const allocationData = Object.entries(allocationMap).map(([name, value]) => ({ name, value }));
const pieColors = ["#14b8a6", "#f59e0b", "#3b82f6", "#a78bfa"];

const categoryBadge: Record<string, string> = {
  Stocks: "default",
  Crypto: "gold",
  Cash: "blue",
  "Real Estate": "purple",
};

export default function FinancePage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio</CardTitle>
            <DollarSign className="w-4 h-4 text-gold" />
          </CardHeader>
          <p className="text-3xl font-bold text-gold">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-1 mt-2">
            {dailyChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm font-medium ${dailyChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {dailyChange >= 0 ? "+" : ""}{formatCurrency(Math.round(dailyChange))} ({dailyChangePct.toFixed(2)}%)
            </span>
            <span className="text-xs text-text-muted ml-1">today</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <PieChart className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {allocationData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3040", borderRadius: "8px" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {allocationData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                <span className="text-text-muted">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Net Worth</CardTitle>
            <TrendingUp className="w-4 h-4 text-text-muted" />
          </CardHeader>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockNetWorthHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3040", borderRadius: "8px" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted text-xs border-b border-surface-border">
                <th className="text-left py-3 px-2 font-medium">Ticker</th>
                <th className="text-left py-3 px-2 font-medium">Name</th>
                <th className="text-left py-3 px-2 font-medium">Category</th>
                <th className="text-right py-3 px-2 font-medium">Shares</th>
                <th className="text-right py-3 px-2 font-medium">Price</th>
                <th className="text-right py-3 px-2 font-medium">Value</th>
                <th className="text-right py-3 px-2 font-medium">Day %</th>
              </tr>
            </thead>
            <tbody>
              {mockHoldings.map((h) => (
                <tr key={h.ticker} className="border-b border-surface-border/50 hover:bg-surface-hover/50 transition-colors">
                  <td className="py-3 px-2 font-semibold text-text-primary">{h.ticker}</td>
                  <td className="py-3 px-2 text-text-secondary">{h.name}</td>
                  <td className="py-3 px-2">
                    <Badge variant={categoryBadge[h.category] as any}>{h.category}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right text-text-secondary">{h.shares}</td>
                  <td className="py-3 px-2 text-right text-text-secondary">{formatCurrency(h.price)}</td>
                  <td className="py-3 px-2 text-right font-medium text-text-primary">{formatCurrency(h.value)}</td>
                  <td className={`py-3 px-2 text-right font-medium ${h.dayChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {h.dayChange >= 0 ? "+" : ""}{h.dayChange}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-surface-border">
                <td colSpan={5} className="py-3 px-2 font-semibold text-text-primary">Total</td>
                <td className="py-3 px-2 text-right font-bold text-gold text-base">{formatCurrency(totalValue)}</td>
                <td className={`py-3 px-2 text-right font-medium ${dailyChangePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {dailyChangePct >= 0 ? "+" : ""}{dailyChangePct.toFixed(2)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
