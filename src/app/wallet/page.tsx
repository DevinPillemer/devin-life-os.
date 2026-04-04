"use client";

import { Header } from "@/components/header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { mockWallet, mockWalletLedger } from "@/lib/mock-data";
import { Wallet, Trophy, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const totalEarned = mockWallet.reduce((s, w) => s + w.earned, 0);
const maxWallet = 1200;
const pct = Math.round((totalEarned / maxWallet) * 100);

export default function WalletPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <Header />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Ring */}
        <Card className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="#2a3040" strokeWidth="12" />
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 534} 534`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Wallet className="w-6 h-6 text-accent mb-1" />
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(totalEarned)}</p>
              <p className="text-sm text-text-muted">of {formatCurrency(maxWallet)}</p>
            </div>
          </div>
          <p className="text-sm text-text-muted mt-4">{pct}% of monthly target</p>
        </Card>

        {/* Breakdown by Module */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown by Module</CardTitle>
            <Trophy className="w-4 h-4 text-gold" />
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWallet} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis type="category" dataKey="module" stroke="#64748b" fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3040", borderRadius: "8px" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="earned" radius={[0, 6, 6, 0]}>
                  {mockWallet.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockWallet}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="earned"
                  nameKey="module"
                >
                  {mockWallet.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1f2e", border: "1px solid #2a3040", borderRadius: "8px" }}
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {mockWallet.map((w) => (
              <div key={w.module} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                <span className="text-text-muted">{w.module}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Earnings Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {mockWalletLedger.map((entry, i) => (
            <div key={i} className="flex items-center gap-4 py-2 border-b border-surface-border/50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{entry.description}</p>
                <p className="text-xs text-text-muted">{entry.date}</p>
              </div>
              <Badge variant="muted">{entry.module}</Badge>
              <span className="text-sm font-semibold text-accent">+{formatCurrency(entry.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
