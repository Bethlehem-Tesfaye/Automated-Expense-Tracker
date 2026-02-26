import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import type { RegistrationFormFields } from "../types/auth";

const RegistrationForm: React.FC = () => {
  const { register, isLoading } = useRegister();
  const signInWithGoogle = useGoogleAuth();
  const [form, setForm] = useState<RegistrationFormFields>({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await register({
      ...form,
      callbackURL: `${window.location.origin}/verify-email`,
    });
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="text-sm text-gray-500">
          Join Expense Tracker to Keep track of your expenses.
        </p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => signInWithGoogle}
          className="flex-1 cursor-pointer border rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
        >
          <span className="h-5 w-5 rounded-full border border-[#4988C4] flex items-center justify-center text-xs font-bold text-[#1C4D8D]">
            G
          </span>
          Continue with Google
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-[#4988C4]">OR CONTINUE WITH</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Full Name
          </label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4988C4]"
            />
            <input
              id="name"
              type="text"
              className="w-full border rounded-md pl-9 pr-3 py-2"
              placeholder="Your name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4988C4]"
            />
            <input
              id="email"
              type="email"
              className="w-full border rounded-md pl-9 pr-3 py-2"
              placeholder="you@roommatch.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4988C4]"
            />
            <input
              id="password"
              type="password"
              className="w-full border rounded-md pl-9 pr-3 py-2"
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
          className="w-full bg-[#1C4D8D] hover:bg-[#0F2854] text-white rounded-md py-2 font-semibold transition-colors disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-[#1C4D8D] font-medium cursor-pointer">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default RegistrationForm;
