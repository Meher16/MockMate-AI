"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ScoreTrendChartProps {
  data: Array<{ date: string; score: number; interviewId: string; domainLabel: string }>;
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
        Complete interviews to see your score trend
      </div>
    );
  }

  const width = 400;
  const height = 180;
  const padX = 32;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = padY + chartH - (d.score / 100) * chartH;
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full max-w-lg mx-auto">
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padY + chartH - (v / 100) * chartH;
          return (
            <g key={v}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="currentColor" strokeOpacity={0.08} />
              <text x={4} y={y + 4} className="fill-muted-foreground text-[9px]">
                {v}
              </text>
            </g>
          );
        })}

        <motion.path
          d={areaPath}
          fill="url(#trendGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        {points.map((p, i) => (
          <motion.g
            key={p.interviewId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="cursor-pointer"
            onClick={() => router.push(`/interview/${p.interviewId}/feedback`)}
          >
            <circle cx={p.x} cy={p.y} r={6} fill="hsl(var(--primary))" className="hover:opacity-80" />
            <circle cx={p.x} cy={p.y} r={10} fill="hsl(var(--primary))" fillOpacity={0.15} />
            <text
              x={p.x}
              y={height + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {formatShortDate(p.date)}
            </text>
          </motion.g>
        ))}

        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
