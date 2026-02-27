import { useRef, useState } from "react";
import { Calendar, RotateCcw, Search } from "lucide-react";
import EditExpenseModal from "../../features/expenses/components/EditExpenseModal";
import ExpenseListTable from "../../features/expenses/components/ExpenseListTable";
import ExpenseListTableSkeleton from "../../features/expenses/components/ExpenseListTableSkeleton";
import {
  useDeleteExpense,
  useExpenseCategories,
  useExpenses,
  useUpdateExpense,
} from "../../features/expenses/hooks/useExpenses";
import type { ExpenseItem } from "../../features/expenses/types/expenses";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

const PAGE_SIZE = 10;

function ExpenseListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(
    null,
  );

  const offset = (page - 1) * PAGE_SIZE;

  const {
    data: expensesResponse,
    isLoading: isExpensesLoading,
    isError: isExpensesError,
  } = useExpenses({
    limit: PAGE_SIZE,
    offset,
    search: search || undefined,
    categoryName: categoryName || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useExpenseCategories();

  const deleteExpenseMutation = useDeleteExpense();
  const updateExpenseMutation = useUpdateExpense();

  const expenses = expensesResponse?.data ?? [];
  const totalCount = expensesResponse?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const categories = categoriesResponse?.data ?? [];

  const resetFilters = () => {
    setSearch("");
    setCategoryName("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const openDatePicker = (input: HTMLInputElement | null) => {
    if (!input) return;

    const inputWithPicker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof inputWithPicker.showPicker === "function") {
      inputWithPicker.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  const dateDisplayValue =
    fromDate && toDate
      ? `${fromDate} - ${toDate}`
      : fromDate
        ? `${fromDate} - To`
        : toDate
          ? `From - ${toDate}`
          : "From-To";

  return (
    <div className="w-full space-y-5">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold text-[#0F2854]">Previous Records</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-md border border-gray-200 bg-white px-4 pr-10 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-[#F8FAFC] p-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <p className="text-sm font-semibold text-[#0F2854]">Filter By</p>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1C4D8D] hover:text-[#0F2854]"
          >
            <RotateCcw size={15} />
            Reset Filter
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="relative rounded-xl border border-gray-200 bg-white px-5 py-3">
            <span className="absolute -top-2 left-4 bg-[#F8FAFC] px-1 text-xs text-gray-400">
              Date
            </span>

            <div className="flex items-center justify-between ">
              <button
                type="button"
                onClick={() => openDatePicker(fromDateRef.current)}
                className="text-left text-sm font-medium leading-none  cursor-pointer text-[#0F2854]"
              >
                {dateDisplayValue}
              </button>

              <button
                type="button"
                onClick={() =>
                  openDatePicker(
                    fromDate ? toDateRef.current : fromDateRef.current,
                  )
                }
                className="text-gray-500 transition-colors hover:text-[#1C4D8D] cursor-pointer"
                aria-label="Open date picker"
              >
                <Calendar size={26} />
              </button>
            </div>

            <div className="sr-only">
              <input
                ref={fromDateRef}
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);

                  if (!toDateRef.current || event.target.value === "") return;
                  openDatePicker(toDateRef.current);
                }}
              />
              <input
                ref={toDateRef}
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <select
            value={categoryName}
            onChange={(event) => {
              setCategoryName(event.target.value);
              setPage(1);
            }}
            disabled={isCategoriesLoading}
            className="h-13  cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
          >
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        {isExpensesError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load expenses.
          </div>
        )}

        {isCategoriesError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load categories.
          </div>
        )}

        {isExpensesLoading ? (
          <div className="rounded-md border-2 border-[#BDE8F5] bg-white">
            <ExpenseListTableSkeleton />
          </div>
        ) : (
          <div className="rounded-md bg-white">
            <ExpenseListTable
              expenses={expenses}
              isDeleting={deleteExpenseMutation.isPending}
              onEdit={(expense) => setEditingExpense(expense)}
              onDelete={(id) => deleteExpenseMutation.mutate(id)}
            />
          </div>
        )}

        <article className="mt-4 bg-transparent p-0">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((pageNumber) => {
                  if (totalPages <= 5) return true;
                  return (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    Math.abs(pageNumber - page) <= 1
                  );
                })
                .map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationButton
                      isActive={pageNumber === page}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationButton>
                  </PaginationItem>
                ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </article>
      </section>

      {editingExpense && (
        <EditExpenseModal
          key={editingExpense.id}
          expense={editingExpense}
          categories={categories}
          isSubmitting={updateExpenseMutation.isPending}
          onClose={() => setEditingExpense(null)}
          onSubmit={async (payload) => {
            await updateExpenseMutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}

export default ExpenseListPage;
