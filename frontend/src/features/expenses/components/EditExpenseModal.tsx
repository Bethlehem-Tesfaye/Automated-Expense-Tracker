import { useState, type FormEvent } from "react";
import type { ExpenseCategory, ExpenseItem } from "../types/expenses";

interface EditExpenseModalProps {
  expense: ExpenseItem;
  categories: ExpenseCategory[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    id: string;
    merchant: string;
    amount: number;
    categoryId: string;
    date?: string;
  }) => Promise<void>;
}

function toDateInputValue(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

function EditExpenseModal({
  expense,
  categories,
  isSubmitting,
  onClose,
  onSubmit,
}: EditExpenseModalProps) {
  const [merchant, setMerchant] = useState(expense.merchant);
  const [amount, setAmount] = useState(String(expense.amount));
  const [categoryId, setCategoryId] = useState(expense.categoryId);
  const [date, setDate] = useState(toDateInputValue(expense.date));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      id: expense.id,
      merchant: merchant.trim(),
      amount: Number(amount),
      categoryId,
      date: date || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#BDE8F5] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#0F2854]">Edit Expense</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
            required
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
            required
          />

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#BDE8F5] px-4 py-2 text-sm font-medium text-[#0F2854]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#1C4D8D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2854] disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;
