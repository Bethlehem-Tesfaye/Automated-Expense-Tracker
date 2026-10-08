interface ExpenseSummaryCardsProps {
  totalCount: number;
  totalAmount: number;
}

function ExpenseSummaryCards({
  totalCount,
  totalAmount,
}: ExpenseSummaryCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <article className="bento-accent p-5">
        <p className="text-xs font-medium text-white/70">Total Expenses</p>
        <p className="mt-1 text-3xl font-bold">{totalCount}</p>
      </article>

      <article className="bento-card p-5">
        <p className="text-xs font-medium text-[#475569]">Total Spent</p>
        <p className="mt-1 text-3xl font-bold text-[#0F172A]">
          $
          {totalAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </article>
    </section>
  );
}

export default ExpenseSummaryCards;
