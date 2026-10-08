import React from "react";
import { Link } from "react-router-dom";
import { useResendVerify } from "../hooks/useResendVerify";
import { useCurrentUser } from "../hooks/useCurrentUser";

const VerifyNoticePage: React.FC = () => {
  const { user } = useCurrentUser();
  const email: string | undefined = user?.email;
  const { mutate, isPending } = useResendVerify();

  const onResend = () => {
    if (!email) return;
    mutate({
      email,
      callbackURL: `${window.location.origin}/verify-email`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl border border-[#CBD5E1] rounded-xl p-6 bg-white">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Verify your email</h2>
          <p className="text-sm text-gray-500">
            We’ve sent a verification link to your email. Please check your
            inbox and click the link to continue.
          </p>
        </div>

        <div className="border border-[#E2E8F0] rounded-lg p-4 bg-[#E2E8F0]/30 text-sm text-gray-600">
          If you don’t see the email, check your spam folder or try resending.
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={!email || isPending}
            onClick={onResend}
            className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl py-2.5 font-semibold shadow-lg shadow-teal-500/30 transition-all disabled:opacity-60"
          >
            {isPending ? "Sending..." : "Resend verification email"}
          </button>

          <Link
            to="/login"
            className="block text-center text-sm text-[#475569] font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyNoticePage;
