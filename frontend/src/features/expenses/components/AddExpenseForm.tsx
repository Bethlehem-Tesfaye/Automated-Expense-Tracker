import { useState, type FormEvent } from "react";
import type { ExpenseCategory } from "../types/expenses";

interface AddExpenseFormProps {
  categories: ExpenseCategory[];
  isSubmitting: boolean;
  onSubmit: (payload: {
    merchant: string;
    amount: number;
    categoryId: string;
    date?: string;
  }) => Promise<void>;
}

function AddExpenseForm({
  categories,
  isSubmitting,
  onSubmit,
}: AddExpenseFormProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!merchant.trim() || !amount || !categoryId) return;

    await onSubmit({
      merchant: merchant.trim(),
      amount: Number(amount),
      categoryId,
      date: date || undefined,
    });

    setMerchant("");
    setAmount("");
    setCategoryId("");
    setDate("");
  };

  return (
    <article className="rounded-lg border border-gray-200 bg-[#F8FAFC] p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="block text-sm font-semibold text-[#0F2854]">
              Merchant
            </span>
            <input
              type="text"
              placeholder="Enter merchant"
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-[#0F2854]">
              Amount
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-base text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D]"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-[#0F2854]">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-12 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-base text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D]"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-semibold text-[#0F2854]">
              Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-12 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-base text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D]"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-md bg-[#1C4D8D] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Add Expense"}
          </button>
        </div>
      </form>
    </article>
  );
}

export default AddExpenseForm;
