import { useState } from "react";
import type { CategorySpendingData } from "../types/dashboard";

interface SpendingByCategoryCardProps {
  items: CategorySpendingData[];
}

function SpendingByCategoryCard({ items }: SpendingByCategoryCardProps) {
  const [hoveredCategory, setHoveredCategory] =
    useState<CategorySpendingData | null>(null);

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const normalizedTotal = total > 0 ? total : 1;
  const radius = 56;
  const strokeWidth = 30;
  const size = 160;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const labelRadius = radius + 34;

  const donutSegments = items.reduce<{
    offset: number;
    runningTotal: number;
    segments: Array<{
      item: CategorySpendingData;
      length: number;
      offset: number;
      labelX: number;
      labelY: number;
    }>;
  }>(
    (accumulator, item) => {
      const length = (item.amount / normalizedTotal) * circumference;
      const segmentMidRatio =
        (accumulator.runningTotal + item.amount / 2) / normalizedTotal;
      const angle = segmentMidRatio * 2 * Math.PI - Math.PI / 2;

      return {
        offset: accumulator.offset + length,
        runningTotal: accumulator.runningTotal + item.amount,
        segments: [
          ...accumulator.segments,
          {
            item,
            length,
            offset: accumulator.offset,
            labelX: center + Math.cos(angle) * labelRadius,
            labelY: center + Math.sin(angle) * labelRadius,
          },
        ],
      };
    },
    { offset: 0, runningTotal: 0, segments: [] },
  ).segments;

  return (
    <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
      <h3 className="text-xl font-semibold text-[#0F2854]">
        Spending by Category
      </h3>
      <p className="mt-1 text-sm text-[#4988C4]">
        Breakdown of expenses across different categories.
      </p>

      <div
        className="mt-7 flex flex-col items-center gap-5"
        aria-label="Spending by category chart"
      >
        <div className="relative">
          {hoveredCategory && (
            <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 rounded-md bg-[#0F2854] px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-sm">
              {hoveredCategory.category}: {hoveredCategory.amount}%
            </div>
          )}

          <svg viewBox={`0 0 ${size} ${size}`} className="h-52 w-52">
            <g transform={`rotate(-90 ${center} ${center})`}>
              {donutSegments.map(({ item, length, offset }) => (
                <circle
                  key={item.category}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  className="cursor-pointer transition-opacity hover:opacity-85"
                  onMouseEnter={() => setHoveredCategory(item)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              ))}
            </g>

            {donutSegments.map(({ item, labelX, labelY }) => (
              <text
                key={`${item.category}-label`}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                fontWeight="600"
                fill={item.color}
              >
                {item.amount}%
              </text>
            ))}
          </svg>

          <div className="pointer-events-none absolute inset-9.5 rounded-full bg-white" />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {items.map((item) => (
            <div
              key={item.category}
              className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-[#BDE8F5]/50"
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[#1C4D8D]">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default SpendingByCategoryCard;
