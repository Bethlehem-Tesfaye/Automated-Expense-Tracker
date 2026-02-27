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
      <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        <p className="text-xs font-medium text-[#1C4D8D]">Total Expenses</p>
        <p className="mt-1 text-3xl font-bold text-[#0F2854]">{totalCount}</p>
      </article>

      <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        <p className="text-xs font-medium text-[#1C4D8D]">Total Spent</p>
        <p className="mt-1 text-3xl font-bold text-[#0F2854]">
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
