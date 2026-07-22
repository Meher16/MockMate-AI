"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface DomainBreakdownProps {
  data: Array<{ domainLabel: string; count: number; avgScore: number | null }>;
}

export function DomainBreakdownChart({ data }: DomainBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No interview data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((item, i) => {
        const pct = (item.count / maxCount) * 100;
        return (
          <div key={item.domainLabel} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium truncate pr-2">{item.domainLabel}</span>
              <span className="text-muted-foreground shrink-0">
                {item.count} session{item.count !== 1 ? "s" : ""}
                {item.avgScore != null && ` · ${Math.round(item.avgScore)}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r from-primary to-accent")}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DifficultyBreakdownProps {
  data: Array<{ difficulty: string; count: number; avgScore: number | null }>;
}

const DIFF_COLORS: Record<string, string> = {
  EASY: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HARD: "bg-red-500",
};

export function DifficultyBreakdownChart({ data }: DifficultyBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
        No difficulty data yet
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden">
        {data.map((item, i) => (
          <motion.div
            key={item.difficulty}
            className={cn(DIFF_COLORS[item.difficulty] ?? "bg-primary", "h-full")}
            initial={{ width: 0 }}
            animate={{ width: `${(item.count / total) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            title={`${item.difficulty}: ${item.count}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div key={item.difficulty} className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className={cn("h-2.5 w-2.5 rounded-full", DIFF_COLORS[item.difficulty] ?? "bg-primary")} />
              <span className="text-xs font-medium capitalize">{item.difficulty.toLowerCase()}</span>
            </div>
            <p className="text-lg font-bold">{item.count}</p>
            {item.avgScore != null && (
              <p className="text-xs text-muted-foreground">{Math.round(item.avgScore)}% avg</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AtsTrendChartProps {
  data: Array<{ date: string; score: number }>;
}

export function AtsTrendChart({ data }: AtsTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
        Run ATS analysis to track resume scores
      </div>
    );
  }

  const width = 300;
  const height = 100;
  const pad = 16;
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;

  const points = data.map((d, i) => ({
    ...d,
    x: pad + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
    y: pad + chartH - (d.score / 100) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <motion.path
        d={linePath}
        fill="none"
        stroke="hsl(var(--accent))"
        strokeWidth={2}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="hsl(var(--accent))"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        />
      ))}
    </svg>
  );
}
