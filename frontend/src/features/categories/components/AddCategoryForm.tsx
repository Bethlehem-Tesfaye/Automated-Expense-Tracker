import { useState, type FormEvent } from "react";

interface AddCategoryFormProps {
  isSubmitting: boolean;
  onSubmit: (payload: { name: string }) => Promise<void>;
}

function AddCategoryForm({ isSubmitting, onSubmit }: AddCategoryFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) return;

    await onSubmit({ name: name.trim() });
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 md:w-auto">
      <input
        type="text"
        placeholder="Add category name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-[#0F172A] outline-none transition-colors hover:border-[#CBD5E1] focus:border-[#0D9488] md:w-64"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 cursor-pointer rounded-md bg-[#0D9488] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

export default AddCategoryForm;
