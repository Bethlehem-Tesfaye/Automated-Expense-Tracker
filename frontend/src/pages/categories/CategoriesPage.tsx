import { useState } from "react";
import AddCategoryForm from "../../features/categories/components/AddCategoryForm";
import CategoriesTable from "../../features/categories/components/CategoriesTable";
import CategoriesTableSkeleton from "../../features/categories/components/CategoriesTableSkeleton";
import EditCategoryModal from "../../features/categories/components/EditCategoryModal";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../features/categories/hooks/useCategories";
import type { CategoryItem } from "../../features/categories/types/categories";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

const PAGE_SIZE = 10;

function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );

  const offset = (page - 1) * PAGE_SIZE;

  const {
    data: categoriesResponse,
    isLoading,
    isError,
  } = useCategories({
    limit: PAGE_SIZE,
    offset,
    search: search || undefined,
  });

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const categories = categoriesResponse?.data ?? [];
  const totalCount = categoriesResponse?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-[#0F2854]">Categories</h1>

        <AddCategoryForm
          isSubmitting={createCategoryMutation.isPending}
          onSubmit={async (payload) => {
            await createCategoryMutation.mutateAsync(payload);
            setPage(1);
          }}
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-[#F8FAFC] p-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="mt-2 h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-[#0F2854] outline-none transition-colors hover:border-[#4988C4] focus:border-[#1C4D8D] md:w-80"
        />
      </section>

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Failed to load categories.
          </div>
        )}

        {isLoading ? (
          <div className="rounded-md border-2 border-[#BDE8F5] bg-white">
            <CategoriesTableSkeleton />
          </div>
        ) : (
          <CategoriesTable
            categories={categories}
            isDeleting={deleteCategoryMutation.isPending}
            onEdit={(category) => setEditingCategory(category)}
            onDelete={(id) => deleteCategoryMutation.mutate(id)}
          />
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

      {editingCategory && (
        <EditCategoryModal
          key={editingCategory.id}
          category={editingCategory}
          isSubmitting={updateCategoryMutation.isPending}
          onClose={() => setEditingCategory(null)}
          onSubmit={async (payload) => {
            await updateCategoryMutation.mutateAsync(payload);
          }}
        />
      )}
    </div>
  );
}

export default CategoriesPage;
