"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "Student" }),
      });

      if (response.ok) {
        router.push("/"); //main page or dashboard
      } else {
        const data = await response.json();
        setError(data.error || "Login failed. Please try again");
      }
    } catch (error) {
      setError("An error occurred. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "Student",
        }),
      });

      if (response.ok) {
        // Auto-login after signup
        router.push("/");
      } else {
        const data = await response.json();
        setError(data.error || "Signup failed. Please try again");
      }
    } catch (error) {
      setError("An error occurred. Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center mb-4">
            {isSignup ? "Student Sign Up" : "Student Login"}
          </h2>

          <form
            onSubmit={isSignup ? handleSignup : handleLogin}
            className="space-y-4"
          >
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignup && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="input input-bordered"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="form-control mt-6">
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

          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="btn btn-ghost btn-sm"
          >
            {isSignup
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </button>

          <button
            onClick={() => router.push("/login_page")}
            className="btn btn-ghost btn-sm"
          >
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}
