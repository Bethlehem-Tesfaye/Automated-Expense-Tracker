import { useMemo, useState } from "react";
import { useExpenseReport } from "../../features/reports/hooks/useReports";
import { useCurrencyFormatter } from "../../features/settings/hooks/useSettings";
import {
  exportReportToCsv,
  exportReportToExcel,
} from "../../features/reports/utils/exportReport";
import type {
  ExpenseReportQuery,
  ReportPeriod,
} from "../../features/reports/types/reports";

function ReportsPage() {
  const { formatMoney } = useCurrencyFormatter();
  const [exportFormat, setExportFormat] = useState("");
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

  const handleExportCsv = () => {
    if (!report) return;

    exportReportToCsv({
      report,
      period: report.period,
      from: report.from,
      to: report.to,
    });
  };

  const handleExportExcel = () => {
    if (!report) return;

    exportReportToExcel({
      report,
      period: report.period,
      from: report.from,
      to: report.to,
    });
  };

  const handleExportChange = (value: string) => {
    setExportFormat(value);

    if (value === "csv") {
      handleExportCsv();
    }

    if (value === "excel") {
      handleExportExcel();
    }

    setExportFormat("");
  };

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-3xl font-bold text-[#0F172A]">Reports</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Default report shows this week. Customize by date, month, year, or
          custom range.
        </p>
      </section>

      <section className="bento-card p-5">
        <div className="mb-4 flex justify-end">
          <select
            value={exportFormat}
            onChange={(event) => handleExportChange(event.target.value)}
            disabled={!report || isLoading}
            className="h-10 min-w-44 rounded-md border border-[#0D9488] px-3 text-sm font-semibold text-[#475569] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Export</option>
            <option value="csv">Export CSV</option>
            <option value="excel">Export Excel</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold text-[#475569]">Period</span>
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as ReportPeriod)
              }
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </label>

          {period === "week" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#475569]">
                Anchor Date (Optional)
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
              />
            </label>
          )}

          {period === "month" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#475569]">
                Month
              </span>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
              />
            </label>
          )}

          {period === "year" && (
            <label className="space-y-1.5 md:col-span-2">
              <span className="text-xs font-semibold text-[#475569]">Year</span>
              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
              />
            </label>
          )}

          {period === "custom" && (
            <>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold text-[#475569]">
                  From
                </span>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
                />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold text-[#475569]">To</span>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F172A]"
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
        <div className="bento-card p-5 text-sm text-[#475569]">
          Generating report...
        </div>
      ) : report ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="bento-card p-5">
              <p className="text-xs font-medium text-[#475569]">
                Total Spending
              </p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F172A]">
                {formatMoney(report.totals.totalAmount)}
              </h3>
            </article>
            <article className="bento-card p-5">
              <p className="text-xs font-medium text-[#475569]">Transactions</p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F172A]">
                {report.totals.transactionCount}
              </h3>
            </article>
            <article className="bento-card p-5">
              <p className="text-xs font-medium text-[#475569]">
                Average Transaction
              </p>
              <h3 className="mt-1 text-3xl font-bold text-[#0F172A]">
                {formatMoney(report.totals.averageAmount)}
              </h3>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="bento-card p-5">
              <h3 className="text-xl font-semibold text-[#0F172A]">
                Category Breakdown
              </h3>
              <div className="mt-4 space-y-3">
                {report.categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-[#64748B]">
                    No category data for this period.
                  </p>
                ) : (
                  report.categoryBreakdown.map((item) => (
                    <div key={item.categoryId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#0F172A]">
                          {item.categoryName}
                        </span>
                        <span className="text-[#475569]">
                          {formatMoney(item.total)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F5F9]">
                        <div
                          className="h-2 rounded-full bg-[#0D9488]"
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

            <article className="bento-card p-5">
              <h3 className="text-xl font-semibold text-[#0F172A]">Period</h3>
              <p className="mt-3 text-sm text-[#64748B]">
                {new Date(report.from).toLocaleDateString("en-US")} -{" "}
                {new Date(report.to).toLocaleDateString("en-US")}
              </p>
              <p className="mt-2 text-sm capitalize text-[#475569]">
                Type: {report.period}
              </p>
            </article>
          </section>

          <section className="bento-card p-5">
            <h3 className="text-xl font-semibold text-[#0F172A]">
              Expense Details
            </h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-[#64748B]">
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
                        className="px-2 py-3 text-center text-[#64748B]"
                      >
                        No expenses for selected period.
                      </td>
                    </tr>
                  ) : (
                    report.expenses.map((item) => (
                      <tr
                        key={item.id}
                        className="rounded-md bg-[#F8FAFC] text-[#0F172A]"
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
