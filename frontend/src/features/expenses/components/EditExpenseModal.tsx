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
      <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#0F172A]">Edit Expense</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={merchant}
            onChange={(event) => setMerchant(event.target.value)}
            className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0D9488]"
            required
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0D9488]"
            required
          />

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0D9488]"
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
            className="w-full rounded-md border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0D9488]"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F766E] disabled:opacity-60"
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
