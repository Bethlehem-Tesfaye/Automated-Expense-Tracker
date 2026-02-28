import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type DragEvent,
} from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateExpense,
  useExpenseCategories,
} from "../../features/expenses/hooks/useExpenses";
import { useProcessReceipt } from "../../features/receipt/hooks/useReceipt";
import { useCreateCategory } from "../../features/categories/hooks/useCategories";
import { useMySettings } from "../../features/settings/hooks/useSettings";

function ScanReceiptPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [useProEngine, setUseProEngine] = useState(false); // Basic / Pro toggle

  const processReceiptMutation = useProcessReceipt();
  const createExpenseMutation = useCreateExpense();
  const createCategoryMutation = useCreateCategory();
  const { data: settingsResponse } = useMySettings();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useExpenseCategories();

  const categories = categoriesResponse?.data ?? [];

  const localPreviewUrl = useMemo(() => {
    if (!selectedImage) return "";
    return URL.createObjectURL(selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    if (!localPreviewUrl) return;

    return () => {
      URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!settingsResponse?.data) return;
    setUseProEngine(settingsResponse.data.defaultReceiptEngine === "pro");
  }, [settingsResponse]);

  const processSelectedFile = async (file: File) => {
    const response = await processReceiptMutation.mutateAsync({
      image: file,
      engine: useProEngine ? "pro" : "basic",
    });
    const parsed = response.data;

    setImageUrl(response.imageUrl || "");

    setMerchant(parsed?.merchant ?? "");
    setAmount(
      parsed?.amount !== null && parsed?.amount !== undefined
        ? String(parsed.amount)
        : "",
    );
    setDate(parsed?.date ?? "");

    if (parsed?.category) {
      const parsedCategoryName = parsed.category.trim();

      const matchedCategory = categories.find(
        (category) =>
          category.name.trim().toLowerCase() ===
          parsedCategoryName.toLowerCase(),
      );

      if (matchedCategory) {
        setCategoryId(matchedCategory.id);
      } else {
        try {
          const createResponse = await createCategoryMutation.mutateAsync({
            name: parsedCategoryName,
          });

          const createdCategoryId = createResponse?.data?.id;
          setCategoryId(createdCategoryId ?? "");

          if (createdCategoryId) {
            toast.success(`Created new category: ${parsedCategoryName}`);
          }
        } catch {
          setCategoryId("");
        }
      }
    } else {
      setCategoryId("");
    }
  };

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);

    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleDropImage = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;

    if (!file) {
      toast.error("Please drop a receipt image");
      return;
    }

    setSelectedImage(file);
    void processSelectedFile(file);
  };

  const handleReset = () => {
    setMerchant("");
    setAmount("");
    setDate("");
    setCategoryId("");
    setImageUrl("");
    setSelectedImage(null);
  };

  const handleSaveExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!merchant.trim() || !amount || !categoryId) {
      toast.error("Merchant, amount and category are required");
      return;
    }

    await createExpenseMutation.mutateAsync({
      merchant: merchant.trim(),
      amount: Number(amount),
      categoryId,
      date: date || undefined,
    });

    handleReset();
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2854]">Scan Receipt</h1>
          <p className="mt-1 text-sm text-[#4988C4]">
            Upload a receipt image and auto-fill expense details using OCR + AI.
          </p>
        </div>

        <div className="md:text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BDE8F5] bg-[#F8FBFF] px-3 py-1">
            <span className="text-xs font-medium text-[#0F2854]">Engine:</span>
            <button
              type="button"
              onClick={() => setUseProEngine(false)}
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                !useProEngine
                  ? "bg-[#1C4D8D] text-white"
                  : "text-[#1C4D8D] hover:bg-[#E0EDFF]"
              }`}
            >
              Basic
            </button>
            <button
              type="button"
              onClick={() => setUseProEngine(true)}
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                useProEngine
                  ? "bg-[#1C4D8D] text-white"
                  : "text-[#1C4D8D] hover:bg-[#E0EDFF]"
              }`}
            >
              Pro
            </button>
          </div>
          <p className="mt-1 text-[11px] text-[#64748B] md:max-w-70">
            Basic: Tesseract + Gemini. <br></br> Pro: Veryfi (higher accuracy,
            limited scans per month).
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="space-y-6">
          <article className="rounded-xl border border-dashed border-[#BDE8F5] bg-white p-6">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDropImage}
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[#D6E6FB] bg-[#F8FBFF] px-4 text-center"
            >
              <CloudUpload size={34} className="text-[#1C4D8D]" />
              <p className="text-sm font-semibold text-[#0F2854]">
                Drag & drop your receipt here or
              </p>
              <span className="rounded-md border border-[#BDE8F5] bg-white px-4 py-2 text-sm font-semibold text-[#1C4D8D]">
                Click to upload
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSelectImage}
                className="hidden"
              />
              <p className="text-xs text-[#4988C4]">
                {processReceiptMutation.isPending
                  ? "Processing receipt..."
                  : selectedImage
                    ? selectedImage.name
                    : "PNG, JPG, WEBP"}
              </p>
            </label>
          </article>

          <article className="rounded-xl border border-[#BDE8F5] bg-white p-5">
            <h2 className="text-2xl font-semibold text-[#0F2854]">
              Receipt Preview
            </h2>
            <div className="mt-4 flex h-90 items-center justify-center rounded-lg bg-[#F6F8FB] p-3">
              {localPreviewUrl || imageUrl ? (
                <img
                  src={localPreviewUrl || imageUrl}
                  alt="Receipt preview"
                  className="max-h-full w-full rounded-md object-contain"
                />
              ) : (
                <p className="text-lg text-[#64748B]">
                  No receipt uploaded yet.
                </p>
              )}
            </div>
          </article>
        </div>

        <article className="rounded-xl border border-[#BDE8F5] bg-white p-5">
          <h2 className="text-2xl font-semibold text-[#0F2854]">
            OCR Extracted Fields
          </h2>
          <p className="mt-1 text-xs text-[#4988C4]">
            AI detected these values. You can edit before saving.
          </p>
          <form onSubmit={handleSaveExpense} className="mt-6 space-y-4">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-[#0F2854]">
                Merchant
              </span>
              <input
                type="text"
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                required
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-[#0F2854]">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-[#0F2854]">
                Total Amount
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                required
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-[#0F2854]">
                Category
              </span>
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                disabled={isCategoriesLoading}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-[#BDE8F5] px-4 py-2 text-sm font-semibold text-[#0F2854] hover:bg-[#EEF6FF]"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={createExpenseMutation.isPending}
                className="rounded-md bg-[#1C4D8D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}

export default ScanReceiptPage;
