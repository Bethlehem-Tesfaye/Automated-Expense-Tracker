import Logo from "../../../components/logo";
import { hero } from "../../../assets/index";
import type { AuthLayoutProps } from "../types/auth";

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-[#F6F7FB]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* Left: Hero */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex">
          <img
            src={hero as string}
            alt="Expense dashboard preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-br from-[#042f2e]/95 via-[#115e59]/90 to-[#0D9488]/80" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-400/25 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <Logo className="flex-row! gap-3!" />
          </div>

          <div className="relative z-10 max-w-lg">
            <h1 className="mb-5 text-5xl font-extrabold leading-[1.05] tracking-tight">
              Track every expense with clarity.
            </h1>
            <p className="text-lg text-white/80">
              Automated Expense Tracker helps you monitor spending, organize
              categories, and stay on top of your financial goals.
            </p>

            <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
              {["Scan receipts", "Smart categories", "Live reports"].map(
                (label) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/15 bg-[rgb(255_255_255/0.1)] px-3 py-3 text-xs font-semibold backdrop-blur-md"
                  >
                    {label}
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="relative z-10 text-xs text-white/70">
            © {currentYear} Automated Expense Tracker • Privacy Policy
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="bento-card w-full max-w-md p-8 hover:translate-y-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
