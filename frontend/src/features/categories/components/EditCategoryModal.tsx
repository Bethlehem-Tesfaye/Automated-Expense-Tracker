import { useState, type FormEvent } from "react";
import type { CategoryItem } from "../types/categories";

interface EditCategoryModalProps {
  category: CategoryItem;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: { id: string; name: string }) => Promise<void>;
}

function EditCategoryModal({
  category,
  isSubmitting,
  onClose,
  onSubmit,
}: EditCategoryModalProps) {
  const [name, setName] = useState(category.name);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({ id: category.id, name: name.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#BDE8F5] bg-white p-5">
        <h3 className="text-lg font-semibold text-[#0F2854]">Edit Category</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-[#4988C4] px-3 py-2 text-sm text-[#0F2854] outline-none focus:border-[#1C4D8D]"
            required
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

export default EditCategoryModal;
