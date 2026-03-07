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
import {
  useProcessReceipt,
  useProReceiptUsage,
} from "../../features/receipt/hooks/useReceipt";
import { useCreateCategory } from "../../features/categories/hooks/useCategories";
import { useMySettings } from "../../features/settings/hooks/useSettings";

function ScanReceiptPage() {
  const [processingStage, setProcessingStage] = useState<
    "idle" | "extracting" | "analyzing"
  >("idle");
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
  const { data: proUsageResponse, refetch: refetchProUsage } =
    useProReceiptUsage();
  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useExpenseCategories();

  const categories = categoriesResponse?.data ?? [];
  const proUsage = proUsageResponse?.data;
  const proLimit = proUsage?.limit ?? 10;
  const proUsed = proUsage?.used ?? 0;
  const proUsagePercent = Math.min(100, Math.round((proUsed / proLimit) * 100));
  const isProLimitReached = Boolean(proUsage?.reached);
  const isProcessingReceipt = processingStage !== "idle";
  const processingProgress =
    processingStage === "extracting"
      ? 45
      : processingStage === "analyzing"
        ? 85
        : 0;

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
    setUseProEngine(
      settingsResponse.data.defaultReceiptEngine === "pro" &&
        !isProLimitReached,
    );
  }, [settingsResponse, isProLimitReached]);

  const processSelectedFile = async (file: File) => {
    if (useProEngine && isProLimitReached) {
      toast.error("Out of Pro engine limit for this month");
      return;
    }

    setProcessingStage("extracting");
    const analyzingTimeout = window.setTimeout(() => {
      setProcessingStage("analyzing");
    }, 900);

    try {
      const response = await processReceiptMutation.mutateAsync({
        image: file,
        engine: useProEngine ? "pro" : "basic",
      });
      void refetchProUsage();
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
    } finally {
      window.clearTimeout(analyzingTimeout);
      setProcessingStage("idle");
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
              onClick={() => {
                if (isProLimitReached) {
                  toast.error("Out of Pro engine limit for this month");
                  return;
                }

                setUseProEngine(true);
              }}
              disabled={isProLimitReached}
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                useProEngine
                  ? "bg-[#1C4D8D] text-white"
                  : "text-[#1C4D8D] hover:bg-[#E0EDFF]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Pro
            </button>
          </div>
          <p className="mt-1 text-[11px] text-[#64748B] md:max-w-70">
            {useProEngine
              ? "Pro: Veryfi (higher accuracy, limited scans per month)."
              : "Basic: Paddle OCR + Gemini."}
          </p>

          {useProEngine && (
            <div className="mt-2 rounded-md border border-[#BDE8F5] bg-[#F8FBFF] p-2.5 md:max-w-70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#0F2854]">
                  Pro usage this month
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    isProLimitReached ? "text-red-600" : "text-[#1C4D8D]"
                  }`}
                >
                  {proUsed}/{proLimit}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#EAF3FF]">
                <div
                  className={`h-1.5 rounded-full ${
                    isProLimitReached ? "bg-red-500" : "bg-[#1C4D8D]"
                  }`}
                  style={{ width: `${proUsagePercent}%` }}
                />
              </div>
              {isProLimitReached && (
                <p className="mt-1 text-[10px] font-medium text-red-600">
                  Out of Pro engine limit for this month.
                </p>
              )}
            </div>
          )}
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

              {isProcessingReceipt ? (
                <div className="w-full max-w-70 rounded-md border border-[#D6E6FB] bg-white p-3 text-left">
                  <div className="flex items-center gap-2 text-xs text-[#1C4D8D]">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#BDE8F5] border-t-[#1C4D8D]" />
                    <span>
                      {processingStage === "extracting"
                        ? "Extracting text…"
                        : "Analyzing with AI…"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[#EAF3FF]">
                    <div
                      className="h-1.5 rounded-full bg-[#1C4D8D] transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#4988C4]">
                  {selectedImage ? selectedImage.name : "PNG, JPG, WEBP"}
                </p>
              )}
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
