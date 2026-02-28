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

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-5">
        {isLoading ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-11 w-full md:w-80" />
            <Skeleton className="h-11 w-full md:w-80" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
            <div className="flex flex-col gap-8 mb-8">
              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-[#0F2854]">
                  Default Receipt Engine
                </span>
                <select
                  value={defaultReceiptEngine}
                  onChange={(event) =>
                    setDefaultReceiptEngine(event.target.value as ReceiptEngine)
                  }
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                >
                  <option value="basic">Basic (OCR + Gemini)</option>
                  <option value="pro">Pro (Veryfi)</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-semibold text-[#0F2854]">
                  Default Currency
                </span>
                <select
                  value={defaultCurrency}
                  onChange={(event) =>
                    setDefaultCurrency(event.target.value as CurrencyCode)
                  }
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="ETB">ETB (Br)</option>
                  <option value="KES">KES (KSh)</option>
                </select>
              </label>
            </div>

            <label className="flex items-center justify-between rounded-lg border border-[#DCE9FA] bg-[#F8FBFF] p-3 md:max-w-130">
              <div>
                <p className="text-sm font-semibold text-[#0F2854]">
                  Email Notifications
                </p>
                <p className="text-xs text-[#4988C4]">
                  Receive reminders and useful account updates by email.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(event) =>
                  setEmailNotifications(event.target.checked)
                }
                className="h-4 w-4 accent-[#1C4D8D]"
              />
            </label>

            <div className="flex justify-end md:justify-end">
              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="rounded-md bg-[#1C4D8D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateSettingsMutation.isPending
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default SettingsPage;
