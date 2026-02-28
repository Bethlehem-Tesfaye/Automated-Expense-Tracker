import { useState } from "react";
import type { WeeklySpendingData } from "../types/dashboard";

interface WeeklyOverviewCardProps {
  items: WeeklySpendingData[];
}

function WeeklyOverviewCard({ items }: WeeklyOverviewCardProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  const width = 760;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingY = 20;

  const minValue = Math.min(...items.map((item) => item.amount));
  const maxValue = Math.max(...items.map((item) => item.amount));
  const range = maxValue - minValue || 1;
  const chartHeight = height - paddingY * 2;
  const chartWidth = width - paddingLeft - paddingRight;
  const xStep = chartWidth / Math.max(items.length - 1, 1);

  const getY = (value: number) =>
    height - paddingY - ((value - minValue) / range) * chartHeight;

  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const value = maxValue - (range / 4) * index;
    return {
      value,
      y: getY(value),
    };
  });

  const points = items
    .map((item, index) => {
      const x = paddingLeft + index * xStep;
      const y = getY(item.amount);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
      <h3 className="text-xl font-semibold text-[#0F2854]">
        Weekly Spending Overview
      </h3>
      <p className="mt-1 text-sm text-[#4988C4]">
        Daily spending patterns for the current week.
      </p>

      <div className="mt-5 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height + 26}`}
          className="h-72 min-w-175 w-full"
          role="img"
          aria-label="Weekly spending line chart"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {yTicks.map((tick) => (
            <g key={`tick-${tick.value}-${tick.y}`}>
              <line
                x1={paddingLeft}
                x2={width - paddingRight}
                y1={tick.y}
                y2={tick.y}
                stroke="#BDE8F5"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 6}
                y={tick.y + 3}
                textAnchor="end"
                fontSize="11"
                fill="#1C4D8D"
              >
                {Math.round(tick.value)}
              </text>
            </g>
          ))}

          <polyline
            fill="none"
            stroke="#1C4D8D"
            strokeWidth="3"
            points={points}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hoveredPoint && (
            <g>
              <rect
                x={hoveredPoint.x - 55}
                y={Math.max(8, hoveredPoint.y - 36)}
                width="110"
                height="24"
                rx="6"
                fill="#0F2854"
              />
              <text
                x={hoveredPoint.x}
                y={Math.max(24, hoveredPoint.y - 20)}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#FFFFFF"
              >
                {`${hoveredPoint.day}: $${hoveredPoint.amount}`}
              </text>
            </g>
          )}

          {items.map((item, index) => {
            const x = paddingLeft + index * xStep;
            const y = getY(item.amount);

            return (
              <g key={item.day}>
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      day: item.day,
                      amount: item.amount,
                      x,
                      y,
                    })
                  }
                />
                <circle cx={x} cy={y} r="3.5" fill="#1C4D8D" />
                <text
                  x={x}
                  y={height + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#1C4D8D"
                >
                  {item.day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </article>
  );
}

export default WeeklyOverviewCard;
