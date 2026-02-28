import { useMemo, useState } from "react";
import { useExpenseReport } from "../../features/reports/hooks/useReports";
import type {
  ExpenseReportQuery,
  ReportPeriod,
} from "../../features/reports/types/reports";

const formatMoney = (value: number) =>
  `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useMemo<ExpenseReportQuery>(() => {
    const base: ExpenseReportQuery = { period };

    if (period === "week" && date) {
      base.date = date;
    }

    if (period === "month" && month) {
      base.month = month;
    }

    if (period === "year" && year) {
      base.year = year;
    }

    if (period === "custom") {
      if (from) base.from = from;
      if (to) base.to = to;
    }

    return base;
  }, [period, date, month, year, from, to]);

  const { data: reportResponse, isLoading, isError } = useExpenseReport(query);
  const report = reportResponse?.data;

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-3xl font-bold text-[#0F2854]">Reports</h1>
        <p className="mt-1 text-sm text-[#4988C4]">
          Default report shows this week. Customize by date, month, year, or
          custom range.
        </p>
      </section>

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#1C4D8D]">Period</span>
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as ReportPeriod)
              }
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>

          {period === "week" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#1C4D8D]">
                Anchor Date (Optional)
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
              />
            </label>
          )}

          {period === "month" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#1C4D8D]">
                Month
              </span>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
              />
            </label>
          )}

          {period === "year" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#1C4D8D]">Year</span>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
              />
            </label>
          )}

          {period === "custom" && (
            <>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold text-[#1C4D8D]">
                  From
                </span>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold text-[#1C4D8D]">To</span>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                />
              </label>
            </>
          )}
        </div>
      </section>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to generate report. Please adjust filters and try again.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-[#BDE8F5] bg-white p-4 text-sm text-[#1C4D8D]">
          Generating report...
        </div>
      ) : report ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
              <p className="text-xs font-medium text-[#1C4D8D]">
                Total Spending
              </p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F2854]">
                {formatMoney(report.totals.totalAmount)}
              </h3>
            </article>
            <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
              <p className="text-xs font-medium text-[#1C4D8D]">Transactions</p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F2854]">
                {report.totals.transactionCount}
              </h3>
            </article>
            <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
              <p className="text-xs font-medium text-[#1C4D8D]">
                Average Transaction
              </p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F2854]">
                {formatMoney(report.totals.averageAmount)}
              </h3>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
              <h3 className="text-xl font-semibold text-[#0F2854]">
                Category Breakdown
              </h3>
              <div className="mt-4 space-y-3">
                {report.categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-[#4988C4]">
                    No category data for this period.
                  </p>
                ) : (
                  report.categoryBreakdown.map((item) => (
                    <div key={item.categoryId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#0F2854]">
                          {item.categoryName}
                        </span>
                        <span className="text-[#1C4D8D]">
                          {formatMoney(item.total)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EAF3FF]">
                        <div
                          className="h-2 rounded-full bg-[#1C4D8D]"
                          style={{
                            width: `${Math.min(Math.round(item.percentage), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
              <h3 className="text-xl font-semibold text-[#0F2854]">Period</h3>
              <p className="mt-3 text-sm text-[#4988C4]">
                {new Date(report.from).toLocaleDateString("en-US")} -{" "}
                {new Date(report.to).toLocaleDateString("en-US")}
              </p>
              <p className="mt-2 text-sm capitalize text-[#1C4D8D]">
                Type: {report.period}
              </p>
            </article>
          </section>

          <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
            <h3 className="text-xl font-semibold text-[#0F2854]">
              Expense Details
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[#4988C4]">
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Merchant</th>
                    <th className="px-2 py-1">Category</th>
                    <th className="px-2 py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 py-3 text-center text-[#4988C4]"
                      >
                        No expenses for selected period.
                      </td>
                    </tr>
                  ) : (
                    report.expenses.map((item) => (
                      <tr
                        key={item.id}
                        className="rounded-md bg-[#F8FBFF] text-[#0F2854]"
                      >
                        <td className="px-2 py-2">
                          {new Date(item.date).toLocaleDateString("en-US")}
                        </td>
                        <td className="px-2 py-2">{item.merchant}</td>
                        <td className="px-2 py-2">{item.categoryName}</td>
                        <td className="px-2 py-2 text-right font-semibold">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default ReportsPage;
