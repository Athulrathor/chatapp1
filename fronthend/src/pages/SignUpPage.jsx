import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore.js";
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
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

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

  const validateForm = () => {
    if (!formData.fullname.trim()) {
      return toast.error("Fullname is required!");
    }

    if (!formData.email.trim()) {
      return toast.error("Email is required!");
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error("Invalid email format!");
    }

    if (!formData.password) {
      return toast.error("Password is required!");
    }

    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters!");
    }

    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (!success) return;

    const keyPair = nacl.box.keyPair();

    const publicKey = util.encodeBase64(keyPair.publicKey);
    const privateKey = util.encodeBase64(keyPair.secretKey);

    localStorage.setItem("privateKey", privateKey);

    const signupData = {
      ...formData,
      publicKey,
    };

    signup(signupData);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed!");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB!");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profilePic: file,
    }));

    setProfilePreview(URL.createObjectURL(file));
  };

  const removeProfileImage = () => {
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
    }

    setProfilePreview("");

    setFormData((prev) => ({
      ...prev,
      profilePic: null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm() === true) {
      signup(formData);
    }

  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center sm:p-12">
        <div className="w-full max-w-md space-y-8 px-6 py-2">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>

              <h1 className="text-2xl font-bold mt-2">
                Create Account
              </h1>

              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Profile picture */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">
                  Profile Picture (Optional)
                </span>
              </label>

              <div className="flex items-center gap-4">
                <div className="relative size-20 shrink-0">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile preview"
                      className="size-20 rounded-full object-cover border border-base-300"
                    />
                  ) : (
                    <div className="size-20 rounded-full bg-base-200 flex items-center justify-center">
                      <User className="size-9 text-base-content/40" />
                    </div>
                  )}

                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="absolute -top-1 -right-1 btn btn-circle btn-xs btn-error"
                      aria-label="Remove profile picture"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>

                <label className="btn btn-outline btn-sm cursor-pointer">
                  <Camera className="size-4" />
                  Choose Image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Fullname */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Fullname</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>

                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="john doe"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fullname: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>

                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@sample.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                  Login now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay with your loved ones"
      />
    </div>
  )
};

export default SignUpPage;
