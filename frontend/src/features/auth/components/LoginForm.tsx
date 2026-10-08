import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import type { LoginFormFields } from "../types/auth";

const LoginForm: React.FC = () => {
  const { login, isLoading } = useLogin();
  const signInWithGoogle = useGoogleAuth("login");
  const [form, setForm] = useState<LoginFormFields>({
    email: "",
    password: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Welcome back</h2>
        <p className="text-sm text-gray-500">
          Enter your credentials to access Expense Tracker.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="flex-1 border rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="h-5 w-5 rounded-full border border-[#CBD5E1] flex items-center justify-center text-xs font-bold text-[#475569]">
            G
          </span>
          Continue with Google
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-[#64748B]">OR CONTINUE WITH</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              id="email"
              type="email"
              className="w-full border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:bg-white"
              placeholder="you@roommatch.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#475569] cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              id="password"
              type="password"
              className="w-full border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl pl-10 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:bg-white"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white cursor-pointer rounded-xl py-2.5 font-semibold shadow-lg shadow-teal-500/30 transition-all disabled:opacity-60"
        >
          {isLoading ? "Signing in..." : "Sign in to Expense Tracker"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#475569] font-medium cursor-pointer"
        >
          Create an account
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
