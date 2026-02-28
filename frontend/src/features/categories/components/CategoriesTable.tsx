import { Pencil, Trash2 } from "lucide-react";
import type { CategoryItem } from "../types/categories";

interface CategoriesTableProps {
  categories: CategoryItem[];
  isDeleting: boolean;
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: string) => void;
}

function CategoriesTable({
  categories,
  isDeleting,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-sm font-semibold text-gray-500">
            <th className="px-5 py-4">Name</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 && (
            <tr>
              <td colSpan={2} className="px-5 py-10 text-center text-[#4988C4]">
                No categories found.
              </td>
            </tr>
          )}

          {categories.map((category) => (
            <tr key={category.id} className="text-[#111827]">
              <td className="px-5 py-6 text-sm font-medium">{category.name}</td>
              <td className="px-5 py-6">
                <div className="flex items-center gap-5 text-gray-500">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="cursor-pointer transition-colors hover:text-[#1C4D8D]"
                    aria-label={`Edit ${category.name}`}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDelete(category.id)}
                    className="cursor-pointer transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Delete ${category.name}`}
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

export default CategoriesTable;
