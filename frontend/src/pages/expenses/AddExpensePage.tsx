import AddExpenseForm from "../../features/expenses/components/AddExpenseForm";
import {
  useCreateExpense,
  useExpenseCategories,
} from "../../features/expenses/hooks/useExpenses";

function AddExpensePage() {
  const {
    data: categoriesResponse,
    isLoading,
    isError,
  } = useExpenseCategories();
  const createExpenseMutation = useCreateExpense();

  const categories = categoriesResponse?.data ?? [];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-3xl font-bold text-[#0F2854]">Add Expense</h1>
        <p className="mt-1 text-sm text-[#4988C4]">
          Record an expense for today or any previous date.
        </p>
      </section>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load categories.
        </div>
      )}

      {isLoading ? (
        <article className="rounded-xl border border-[#BDE8F5] bg-white p-4 text-sm text-[#1C4D8D]">
          Loading categories...
        </article>
      ) : (
        <AddExpenseForm
          categories={categories}
          isSubmitting={createExpenseMutation.isPending}
          onSubmit={async (payload) => {
            await createExpenseMutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}

export default AddExpensePage;
