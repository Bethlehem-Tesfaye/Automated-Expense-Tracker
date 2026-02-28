import type { StatCardData } from "../types/dashboard";

interface OverviewCardsProps {
  items: StatCardData[];
}

function OverviewCards({ items }: OverviewCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const trendColor =
          item.trendTone === "positive"
            ? "text-[#1C4D8D]"
            : item.trendTone === "negative"
              ? "text-red-500"
              : "text-[#4988C4]";

        return (
          <article
            key={item.title}
            className="rounded-xl border border-[#BDE8F5] bg-white p-4"
          >
            <p className="text-xs font-medium text-[#1C4D8D]">{item.title}</p>
            <h3 className="mt-1 text-3xl font-bold text-[#0F2854]">
              {item.value}
            </h3>
            <p className={`mt-2 text-xs font-semibold ${trendColor}`}>
              {item.trend}
            </p>
            <p className="mt-1 text-xs text-[#4988C4]">{item.description}</p>
          </article>
        );
      })}
    </section>
  );
}

export default OverviewCards;
