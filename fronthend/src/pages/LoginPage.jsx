// import React from 'react'
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {

  const [showPassword, setShowPassword] = useState(false);
  
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });
  
  const { login, isLoginingIn } = useAuthStore();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      login(formData);
    };

  return (
    <div className="min-h-screen grid  lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center sm:p-12">
        <div className="w-full max-w-md space-y-8 px-6 py-2">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">
                Sign in to your account 
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Fullname</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40 " />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="john doe"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value })
                  }
                />
              </div>
            </div> */}

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40 " />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@sample.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40 " />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder=" * * * * * *"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
              disabled={isLoginingIn}
            >
              {isLoginingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>

            <div className="text-center">
              <p className="text'base'content/60">
                Dont have an account?{" "}
                <Link
                  to="/signup"
                  className="link link-primary"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <AuthImagePattern
        title="Welcome back"
        subtitle="Login to your conservations and catch up with your messages."
      />
    </div>
  );
}

export default LoginPage;
