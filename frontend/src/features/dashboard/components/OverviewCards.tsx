import type { StatCardData } from "../types/dashboard";

interface OverviewCardsProps {
  items: StatCardData[];
  className?: string;
}

function OverviewCards({ items, className = "" }: OverviewCardsProps) {
  return (
    <section className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {items.map((item) => {
        const trendColor =
          item.trendTone === "positive"
            ? "text-[#475569]"
            : item.trendTone === "negative"
              ? "text-red-500"
              : "text-[#64748B]";

        return (
          <article
            key={item.title}
            className="bento-card flex flex-col justify-between p-5"
          >
            <p className="text-xs font-medium text-[#475569]">{item.title}</p>
            <h3 className="mt-1 text-3xl font-bold text-[#0F172A]">
              {item.value}
            </h3>
            <p className={`mt-2 text-xs font-semibold ${trendColor}`}>
              {item.trend}
            </p>
            <p className="mt-1 text-xs text-[#64748B]">{item.description}</p>
          </article>
        );
      })}
    </section>
  );
}

export default OverviewCards;
