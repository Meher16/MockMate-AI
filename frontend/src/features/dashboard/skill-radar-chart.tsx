"use client";

import { motion } from "framer-motion";
import type { DashboardAnalytics } from "@/types/analytics";
import { SKILL_LABELS } from "@/types/analytics";

interface SkillRadarChartProps {
  data: NonNullable<DashboardAnalytics["skillRadar"]>;
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  const skills = Object.entries(data) as Array<[keyof typeof data, number]>;
  const n = skills.length;
  const cx = 120;
  const cy = 120;
  const maxR = 80;

  const angleStep = (2 * Math.PI) / n;

  const gridLevels = [25, 50, 75, 100];

  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const dataPoints = skills.map(([key, value], i) => ({
    key,
    label: SKILL_LABELS[key],
    value,
    ...getPoint(i, value),
  }));

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 240" className="w-full max-w-[280px]">
        {gridLevels.map((level) => {
          const pts = skills.map((_, i) => getPoint(i, level));
          const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return (
            <path
              key={level}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {skills.map((_, i) => {
          const outer = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={outer.x}
              y2={outer.y}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          );
        })}

        <motion.path
          d={polygonPath}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {dataPoints.map((p, i) => (
          <motion.g
            key={p.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08 }}
          >
            <circle cx={p.x} cy={p.y} r={4} fill="hsl(var(--primary))" />
            <text
              x={getPoint(i, 115).x}
              y={getPoint(i, 115).y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {p.label.split(" ")[0]}
            </text>
            <text
              x={getPoint(i, 115).x}
              y={getPoint(i, 115).y + 10}
              textAnchor="middle"
              className="fill-foreground text-[9px] font-semibold"
            >
              {p.value}%
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
