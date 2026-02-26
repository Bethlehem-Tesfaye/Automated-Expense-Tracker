import { useState } from "react";
import type { MonthlySpendingData } from "../types/dashboard";

interface MonthlyTrendCardProps {
  items: MonthlySpendingData[];
}

function MonthlyTrendCard({ items }: MonthlyTrendCardProps) {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlySpendingData | null>(
    null,
  );
  const maxValue = Math.max(...items.map((item) => item.amount), 1);
  const yTicks = Array.from({ length: 5 }, (_, index) => {
    const value = maxValue - (maxValue / 4) * index;
    return Math.round(value);
  });

  return (
    <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
      <h3 className="text-xl font-semibold text-[#0F2854]">
        Monthly Spending Trend
      </h3>
      <p className="mt-1 text-sm text-[#4988C4]">
        Overview of your spending over the last 6 months.
      </p>

      <div className="mt-7">
        <div className="flex items-start">
          <div className="mt-1 flex h-44 w-10 flex-col justify-between pr-2 text-right text-[11px] text-[#1C4D8D]">
            {yTicks.map((tick) => (
              <span key={tick}>{tick.toLocaleString("en-US")}</span>
            ))}
          </div>

          <div className="flex-1">
            <div className="relative h-44">
              <div className="pointer-events-none absolute inset-0">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="absolute left-0 w-full border-t border-[#BDE8F5]"
                    style={{ top: `${(index / 4) * 100}%` }}
                  />
                ))}
              </div>

              <div className="relative z-10 flex h-44 items-end gap-4">
                {items.map((item) => {
                  const heightPercent = Math.round(
                    (item.amount / maxValue) * 100,
                  );

                  return (
                    <div
                      key={item.month}
                      className="relative flex h-full flex-1 items-end"
                      onMouseEnter={() => setHoveredMonth(item)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      {hoveredMonth?.month === item.month && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-[#0F2854] px-2 py-1 text-xs font-medium whitespace-nowrap text-white shadow-sm">
                          {item.month}: ${item.amount.toLocaleString("en-US")}
                        </div>
                      )}

                      <div
                        className="w-full cursor-pointer rounded-md bg-[#1C4D8D] transition-opacity hover:opacity-85"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex gap-4">
              {items.map((item) => (
                <span
                  key={`label-${item.month}`}
                  className="flex-1 text-center text-xs text-[#1C4D8D]"
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default MonthlyTrendCard;
