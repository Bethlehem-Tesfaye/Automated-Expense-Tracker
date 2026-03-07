import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, Upload, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../components/ui/skeleton";
import { hero } from "../../assets";
import {
  useMyProfile,
  useUpdateMyProfile,
} from "../../features/profile/hooks/useProfile";
import { useCurrencyFormatter } from "../../features/settings/hooks/useSettings";

function ProfilePage() {
  const navigate = useNavigate();
  const { data: profileResponse, isLoading } = useMyProfile();
  const { currencySymbol } = useCurrencyFormatter();
  const updateProfileMutation = useUpdateMyProfile();

  const profile = profileResponse?.data;

  const [displayName, setDisplayName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
  const [isAvatarPreviewBroken, setIsAvatarPreviewBroken] = useState(false);

  const isEditMode = Boolean(profile?.isComplete);

  const savedAvatarUrl = profile?.avatarUrl;
  const normalizedSavedAvatarUrl =
    typeof savedAvatarUrl === "string" &&
    savedAvatarUrl.trim().length > 0 &&
    savedAvatarUrl !== "null" &&
    savedAvatarUrl !== "undefined"
      ? savedAvatarUrl
      : null;

  const avatarPreviewUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : isAvatarRemoved
      ? null
      : normalizedSavedAvatarUrl;

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setMonthlyBudget(
      profile.monthlyBudget !== null ? String(profile.monthlyBudget) : "",
    );
    setMonthlyIncome(
      profile.monthlyIncome !== null ? String(profile.monthlyIncome) : "",
    );
    setIsAvatarRemoved(false);
    setIsAvatarPreviewBroken(false);
  }, [profile]);

  useEffect(() => {
    setIsAvatarPreviewBroken(false);
  }, [avatarPreviewUrl]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setAvatarFile(file);
    setIsAvatarRemoved(false);
    setIsAvatarPreviewBroken(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setIsAvatarRemoved(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      displayName: displayName.trim(),
      monthlyBudget: Number(monthlyBudget),
      monthlyIncome: Number(monthlyIncome),
      avatar: avatarFile,
      removeAvatar: isAvatarRemoved && !avatarFile,
    });

    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen px-4 py-8 text-[#0F2854] sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
      />
      <div className="absolute inset-0 bg-[#0F2854]/75" />
      {isEditMode && (
        <div className="relative z-20 mx-auto mb-4 w-full max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c4d3e8] transition-colors hover:text-[#e4e6e9]"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-[#BDE8F5]/50 bg-white/10 shadow-2xl backdrop-blur-md">
        <div className="grid min-h-155 md:grid-cols-[1.05fr_1.35fr]">
          <section className="flex flex-col justify-between bg-[#0F2854]/80 p-8 text-white sm:p-10">
            <div>
              <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
                {isEditMode ? "Profile settings" : "Almost there"}
              </p>
              <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                {isEditMode
                  ? "Edit your profile details"
                  : "Complete your profile and unlock your dashboard"}
              </h1>
              <p className="mt-4 text-sm text-[#D7E8FF] sm:text-base">
                {isEditMode
                  ? "Keep your details up to date for a personalized dashboard experience."
                  : "Add your key finance details once and we’ll personalize your spending overview right away."}
              </p>
            </div>

            <div className="mt-8 space-y-3 text-sm text-[#D7E8FF]">
              <p>• Track your budget progress with better insights</p>
              <p>• View cleaner weekly and monthly summaries</p>
              <p>
                • {isEditMode ? "Update" : "Personalize"} your account with an
                optional avatar
              </p>
            </div>
          </section>

          <section className="bg-white/95 p-6 sm:p-8 md:p-10">
            {/* {isEditMode && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C4D8D] transition-colors hover:text-[#0F2854]"
                >
                  <ArrowLeft size={16} />
                  Back to Dashboard
                </button>
              </div>
            )} */}

            <div className="mb-6 border-b border-[#E6EEF8] pb-4">
              <h2 className="text-2xl font-bold text-[#0F2854]">
                {isEditMode ? "Edit Profile" : "Your Details"}
              </h2>
              <p className="mt-1 text-sm text-[#5B8FCB]">
                {isEditMode
                  ? "Update your personal details and profile photo anytime."
                  : "Required fields help tailor your financial dashboard."}
              </p>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#DCE9FA] bg-[#F6FAFF] p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#BBD6F7] bg-white text-sm font-medium text-[#5B8FCB]">
                {avatarPreviewUrl && !isAvatarPreviewBroken ? (
                  <img
                    src={avatarPreviewUrl}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                    onError={() => setIsAvatarPreviewBroken(true)}
                  />
                ) : (
                  <User size={28} className="text-[#5B8FCB]" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-[#0F2854]">
                  Profile Photo (Optional)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#1C4D8D] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0F2854]">
                    <Upload size={14} />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>

                  {(avatarPreviewUrl ||
                    avatarFile ||
                    normalizedSavedAvatarUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="rounded-md border border-[#BDE8F5] px-3 py-2 text-xs font-semibold text-[#0F2854] transition-colors hover:bg-[#EEF6FF]"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block space-y-1.5">
                  <span className="block text-sm font-semibold text-[#0F2854]">
                    Display Name
                  </span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-[#0F2854] transition-all placeholder:text-gray-400 focus:border-[#1C4D8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1C4D8D]/10 hover:border-gray-300"
                    placeholder="e.g. Alex Doe"
                    required
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="block text-sm font-semibold text-[#0F2854]">
                      Monthly Budget
                    </span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center   justify-center pl-1  font-medium text-gray-500">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={monthlyBudget}
                        onChange={(event) =>
                          setMonthlyBudget(event.target.value)
                        }
                        className="block w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-8 pr-4 text-sm text-[#0F2854] transition-all placeholder:text-gray-400 focus:border-[#1C4D8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1C4D8D]/10 hover:border-gray-300"
                        placeholder="2500.00"
                        required
                      />
                    </div>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="block text-sm font-semibold text-[#0F2854]">
                      Monthly Income
                    </span>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center  justify-center pl-1 font-medium text-gray-500">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={monthlyIncome}
                        onChange={(event) =>
                          setMonthlyIncome(event.target.value)
                        }
                        className="block w-full rounded-xl border border-gray-200 bg-slate-50 py-3 pl-8 pr-4 text-sm text-[#0F2854] transition-all placeholder:text-gray-400 focus:border-[#1C4D8D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1C4D8D]/10 hover:border-gray-300"
                        placeholder="4000.00"
                        required
                      />
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="mt-4 w-full rounded-xl bg-[#1C4D8D] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : isEditMode
                      ? "Update Profile"
                      : "Save Profile"}
                </button>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
