import { Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrencyFormatter } from "../../settings/hooks/useSettings";
import type { ExpenseItem } from "../types/expenses";

interface ExpenseListTableProps {
  expenses: ExpenseItem[];
  isDeleting: boolean;
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (id: string) => void;
}

function ExpenseListTable({
  expenses,
  isDeleting,
  onEdit,
  onDelete,
}: ExpenseListTableProps) {
  const { formatMoney } = useCurrencyFormatter();

  const formatDate = (value: string) => {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("sv-SE").format(parsedDate);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-sm font-semibold text-gray-500">
            <th className="px-5 py-4">Merchant</th>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-[#4988C4]">
                <div className="flex flex-col items-center gap-3">
                  <p>No expenses found.</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Link
                      to="/expenses/add"
                      className="inline-flex h-9 items-center rounded-md bg-[#1C4D8D] px-3 text-xs font-semibold text-white"
                    >
                      Add Expense
                    </Link>
                    <Link
                      to="/expenses/scan"
                      className="inline-flex h-9 items-center rounded-md border border-[#1C4D8D] px-3 text-xs font-semibold text-[#1C4D8D]"
                    >
                      Upload Receipt
                    </Link>
                  </div>
                </div>
              </td>
            </tr>
          )}

          {expenses.map((expense) => (
            <tr key={expense.id} className="text-[#111827]">
              <td className="px-5 py-6 text-sm font-medium">
                {expense.merchant}
              </td>
              <td className="px-5 py-6 text-sm text-gray-500">
                {formatDate(expense.date)}
              </td>
              <td className="px-5 py-6">
                <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                  {expense.category?.name ?? "-"}
                </span>
              </td>
              <td className="px-5 py-6 text-sm font-semibold text-[#4988C4]">
                {formatMoney(expense.amount)}
              </td>
              <td className="px-5 py-6">
                <div className="flex items-center gap-5 text-gray-500">
                  <button
                    type="button"
                    onClick={() => onEdit(expense)}
                    className="transition-colors hover:text-[#1C4D8D]"
                    aria-label={`Edit ${expense.merchant}`}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDelete(expense.id)}
                    className="transition-colors hover:text-red-600 disabled:opacity-60"
                    aria-label={`Delete ${expense.merchant}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseListTable;
