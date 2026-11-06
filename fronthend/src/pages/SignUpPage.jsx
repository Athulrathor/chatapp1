
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  MessageSquare,
  Mail,
  Lock,
  EyeOff,
  Eye,
  Loader2,
  Camera,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore.js";
import AuthImagePattern from "../components/AuthImagePattern.jsx";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [profilePreview, setProfilePreview] = useState("");

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    profilePic: null,
  });

  const { signup, isSigningUp } = useAuthStore();

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed!");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be smaller than 5 MB!");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profilePic: file,
    }));

    setProfilePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeProfileImage = () => {
    setProfilePreview("");

    setFormData((prev) => ({
      ...prev,
      profilePic: null,
    }));
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      toast.error("Full name is required!");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Please enter a valid email address!");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required!");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSigningUp || !validateForm()) return;

    await signup({
      ...formData,
      fullname: formData.fullname.trim(),
      email: formData.email.trim(),
    });
  };

  return (
    <main className="grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">

      {/* Signup form */}
      <section className="flex min-w-0 items-center justify-center px-4 py-10 sm:px-8 lg:px-10">
        <div className="w-full max-w-md space-y-7">

          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare size={27} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-base-content/60">
              Get started with your free account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Profile picture */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Profile picture
                <span className="ml-1 text-base-content/50">
                  (Optional)
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative size-20 shrink-0">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="size-20 rounded-full border border-base-300 object-cover"
                    />
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded-full border border-base-300 bg-base-200">
                      <User size={34} className="text-base-content/40" />
                    </div>
                  )}

                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      disabled={isSigningUp}
                      aria-label="Remove profile picture"
                      className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-error text-error-content shadow-sm transition hover:scale-110"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <label
                  className={`btn btn-outline btn-sm gap-2 ${
                    isSigningUp
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <Camera size={16} />
                  {profilePreview ? "Change image" : "Choose image"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isSigningUp}
                  />
                </label>
              </div>

              <p className="text-xs text-base-content/50">
                JPG, PNG or WEBP. Maximum size 5 MB.
              </p>
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <label htmlFor="fullname" className="text-sm font-medium">
                Full name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                />

                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className="input input-bordered h-12 w-full pl-10"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  disabled={isSigningUp}
                />
              </div>
            </div>

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
                  disabled={isSigningUp}
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
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  className="input input-bordered h-12 w-full pl-10 pr-11"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  disabled={isSigningUp}
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
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-base-content/60">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Login now
              </Link>
            </p>
          </form>
        </div>
      </section>

      {/* Right side illustration */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay connected with your loved ones."
      />
    </main>
  );
};

export default SignUpPage;
