import AddExpenseForm from "../../features/expenses/components/AddExpenseForm";
import { Skeleton } from "../../components/ui/skeleton";
import {
  useCreateExpense,
  useExpenseCategories,
} from "../../features/expenses/hooks/useExpenses";
import { useCreateCategory } from "../../features/categories/hooks/useCategories";

function AddExpensePage() {
  const {
    data: categoriesResponse,
    isLoading,
    isError,
  } = useExpenseCategories();
  const createExpenseMutation = useCreateExpense();
  const createCategoryMutation = useCreateCategory();

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
        <article className="rounded-lg border border-gray-200 bg-[#F8FAFC] p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Skeleton className="h-10 w-28" />
          </div>
        </article>
      ) : (
        <AddExpenseForm
          categories={categories}
          isSubmitting={createExpenseMutation.isPending}
          isCreatingCategory={createCategoryMutation.isPending}
          onSubmit={async (payload) => {
            await createExpenseMutation.mutateAsync(payload);
          }}
          onCreateCategory={async (name) => {
            const response = await createCategoryMutation.mutateAsync({ name });
            return response?.data ?? null;
          }}
        />
      )}
    </div>
  );
}

export default AddExpensePage;
