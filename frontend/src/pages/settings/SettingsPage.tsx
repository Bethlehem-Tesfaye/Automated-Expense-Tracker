import { useEffect, useState, type FormEvent } from "react";
import { Skeleton } from "../../components/ui/skeleton";
import {
  useMySettings,
  useUpdateMySettings,
} from "../../features/settings/hooks/useSettings";
import type {
  CurrencyCode,
  ReceiptEngine,
} from "../../features/settings/types/settings";

function SettingsPage() {
  const { data: settingsResponse, isLoading } = useMySettings();
  const updateSettingsMutation = useUpdateMySettings();

  const settings = settingsResponse?.data;

  const [defaultReceiptEngine, setDefaultReceiptEngine] =
    useState<ReceiptEngine>("basic");
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("ETB");
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (!settings) return;

    setDefaultReceiptEngine(settings.defaultReceiptEngine);
    setDefaultCurrency(settings.defaultCurrency);
    setEmailNotifications(settings.emailNotifications);
  }, [settings]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateSettingsMutation.mutateAsync({
      defaultReceiptEngine,
      defaultCurrency,
      emailNotifications,
    });

    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-3xl font-bold text-[#0F2854]">Settings</h1>
        <p className="mt-1 text-sm text-[#4988C4]">
          Manage your default preferences for receipts and account behavior.
        </p>
      </section>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bento-card space-y-3 p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="bento-card block space-y-2 p-5">
              <span className="text-sm font-semibold text-[#0F2854]">
                Default Receipt Engine
              </span>
              <p className="text-xs text-[#4988C4]">
                Which engine reads your receipts by default.
              </p>
              <select
                value={defaultReceiptEngine}
                onChange={(event) =>
                  setDefaultReceiptEngine(event.target.value as ReceiptEngine)
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-[#0F2854]"
              >
                <option value="basic">Basic (OCR + Gemini)</option>
                <option value="pro">Pro (Veryfi)</option>
              </select>
            </label>

            <label className="bento-card block space-y-2 p-5">
              <span className="text-sm font-semibold text-[#0F2854]">
                Default Currency
              </span>
              <p className="text-xs text-[#4988C4]">
                Used to display amounts across the app.
              </p>
              <select
                value={defaultCurrency}
                onChange={(event) =>
                  setDefaultCurrency(event.target.value as CurrencyCode)
                }
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-[#0F2854]"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="ETB">ETB (Br)</option>
                <option value="KES">KES (KSh)</option>
              </select>
            </label>

            <label className="bento-card flex cursor-pointer items-start justify-between gap-4 p-5 md:col-span-2 xl:col-span-1">
              <div>
                <p className="text-sm font-semibold text-[#0F2854]">
                  Email Notifications
                </p>
                <p className="mt-1 text-xs text-[#4988C4]">
                  Receive reminders and useful account updates by email.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(event) =>
                  setEmailNotifications(event.target.checked)
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#1C4D8D]"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="rounded-lg bg-[#1C4D8D] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SettingsPage;
