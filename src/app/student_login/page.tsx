"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const body = {
      email: email.trim().toLowerCase(),
      password,
      role: "Student",
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || "Login failed. Please try again.");
      // success
      router.replace("/create_review");
      // router.refresh();  // if you read session on the server and need to refresh
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          role: "Student",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.error || "Signup failed. Please try again.");

      // optionally auto-login by calling /api/auth/login here,
      // or let your /api/auth/signup set the session.
      router.replace("/");
      // router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-6">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">
            {isSignup ? "Student Sign Up" : "Student Login"}
          </h2>

          {error && (
            <div className="alert alert-error mt-3" role="alert">
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="mt-4 space-y-4"
          >
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                placeholder="netid@iastate.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="join w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered join-item w-full"
                  placeholder={
                    isSignup ? "Create a password" : "Enter your password"
                  }
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="btn join-item"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {isSignup && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            {/* Submit */}
            <div className="form-control mt-2">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading
                  ? isSignup
                    ? "Creating account..."
                    : "Logging in..."
                  : isSignup
                  ? "Sign Up"
                  : "Login"}
              </button>
            </div>
          </form>

          <div className="divider">OR</div>

          {/* Toggle */}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
              setPassword("");
              setConfirmPassword("");
            }}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>

          <button
            onClick={() => router.push("/login_page")}
            className="btn btn-ghost btn-sm"
            disabled={loading}
          >
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}
