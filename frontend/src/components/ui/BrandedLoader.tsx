import { logoIcon } from "../../assets";

interface BrandedLoaderProps {
  message?: string;
  fullscreen?: boolean;
}

function BrandedLoader({
  message = "Loading your workspace...",
  fullscreen = true,
}: BrandedLoaderProps) {
  return (
    <div
      className={`${fullscreen ? "min-h-screen" : "min-h-48"} flex items-center justify-center bg-[#F8FAFC]`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute h-20 w-20 rounded-full border-4 border-[#E2E8F0] border-t-[#0D9488] animate-spin" />
          <span className="absolute h-14 w-14 rounded-full border-4 border-[#F1F5F9] border-b-[#64748B] animate-[spin_1.4s_linear_infinite_reverse]" />

          <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
            <img
              src={logoIcon as string}
              alt="Expense Tracker logo"
              className="h-7 w-7 object-contain"
            />
          </div>
        </div>

        <p className="text-sm font-medium text-[#475569]">{message}</p>
      </div>
    </div>
  );
}

export default BrandedLoader;
