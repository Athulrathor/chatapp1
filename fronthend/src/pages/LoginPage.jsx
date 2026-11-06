
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/useAuthStore.js";
import AuthImagePattern from "../components/AuthImagePattern.jsx";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoginingIn } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoginingIn) return;

    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!formData.password) {
      toast.error("Password is required!");
      return;
    }

    await login({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">

      {/* Login form */}
      <section className="flex min-w-0 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-md space-y-7">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare size={27} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-base-content/60">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input input-bordered h-12 w-full pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoginingIn}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input input-bordered h-12 w-full pl-10 pr-11"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoginingIn}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 transition hover:text-base-content"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary h-12 min-h-0 w-full text-sm font-semibold"
              disabled={isLoginingIn}
            >
              {isLoginingIn ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Signup link */}
            <p className="text-center text-sm text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </section>

      {/* Right side illustration */}
      <AuthImagePattern
        title="Welcome back"
        subtitle="Reconnect with your friends and catch up on your conversations."
      />
    </main>
  );
};

export default LoginPage;
