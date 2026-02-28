import { useState, type FormEvent } from "react";
import type { ExpenseCategory } from "../types/expenses";

interface AddExpenseFormProps {
  categories: ExpenseCategory[];
  isSubmitting: boolean;
  isCreatingCategory: boolean;
  onSubmit: (payload: {
    merchant: string;
    amount: number;
    categoryId: string;
    date?: string;
  }) => Promise<void>;
  onCreateCategory: (name: string) => Promise<ExpenseCategory | null>;
}

function AddExpenseForm({
  categories,
  isSubmitting,
  isCreatingCategory,
  onSubmit,
  onCreateCategory,
}: AddExpenseFormProps) {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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

  const handleAddCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    const createdCategory = await onCreateCategory(trimmedName);

    if (!createdCategory) return;

    setCategoryId(createdCategory.id);
    setNewCategoryName("");
    setIsAddCategoryModalOpen(false);
  };

  return (
    <>
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
                onChange={(event) => {
                  const selectedValue = event.target.value;

                  if (selectedValue === "__add_new__") {
                    setIsAddCategoryModalOpen(true);
                    return;
                  }

                  setCategoryId(selectedValue);
                }}
                className="h-12 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 text-base text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D]"
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="__add_new__">+ Add new category</option>
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

      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#BDE8F5] bg-white p-5">
            <h3 className="text-lg font-semibold text-[#0F2854]">
              Add New Category
            </h3>

            <form onSubmit={handleAddCategory} className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddCategoryModalOpen(false);
                    setNewCategoryName("");
                  }}
                  className="cursor-pointer rounded-md border border-[#BDE8F5] px-4 py-2 text-sm font-medium text-[#0F2854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="cursor-pointer rounded-md bg-[#1C4D8D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingCategory ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AddExpenseForm;
