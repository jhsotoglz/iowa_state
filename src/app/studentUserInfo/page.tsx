"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  email?: string;
  role?: string;
  workPreference?: string[];
  workAuthorization?: string[];
  graduationYear?: string;
  major?: string;
}

export default function UserInfo() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [workPreference, setWorkPreference] = useState<string[]>([]);
  const [workAuthorization, setWorkAuthorization] = useState<string[]>([]);
  const [graduationYear, setGraduationYear] = useState("");
  const [major, setMajor] = useState("");

  // ISU College of Engineering majors (labels show the common ISU abbrev)
  const majors = [
    { value: "AER E", label: "Aerospace Engineering (AER E)" },
    { value: "AG E", label: "Agricultural Engineering (AG E)" },
    { value: "BSE", label: "Biological Systems Engineering (BSE)" },
    { value: "CH E", label: "Chemical Engineering (CH E)" },
    { value: "C E", label: "Civil Engineering (C E)" },
    { value: "CON E", label: "Construction Engineering (CON E)" },
    { value: "CPR E", label: "Computer Engineering (CPR E)" },
    { value: "CYB E", label: "Cybersecurity Engineering (CYB E)" },
    { value: "E E", label: "Electrical Engineering (E E)" },
    { value: "ENVE", label: "Environmental Engineering (ENVE)" },
    { value: "I E", label: "Industrial Engineering (I E)" },
    { value: "M S E", label: "Materials Engineering (M S E)" },
    { value: "M E", label: "Mechanical Engineering (M E)" },
    { value: "SE", label: "Software Engineering (SE)" },
  ];

  // Generate years for dropdown (current year to 10 years ahead)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) =>
    (currentYear + i).toString()
  );

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserInfo(data.user);

      // Set form state from fetched data
      setWorkPreference(data.user.workPreference || []);
      setWorkAuthorization(data.user.workAuthorization || []);
      setGraduationYear(data.user.graduationYear || "");
      setMajor(data.user.major || "");
    } catch (err) {
      setError("Failed to load user data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkPreferenceChange = (value: string) => {
    setWorkPreference((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleWorkAuthorizationChange = (value: string) => {
    setWorkAuthorization((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (workPreference.length === 0) {
      setError("Please select at least one work preference");
      setSaving(false);
      return;
    }
    if (workAuthorization.length === 0) {
      setError("Please select at least one work authorization");
      setSaving(false);
      return;
    }
    if (!graduationYear) {
      setError("Please select your graduation year");
      setSaving(false);
      return;
    }
    if (!major) {
      setError("Please select your major");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          major,
          workPreference,
          workAuthorization,
          graduationYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user info");
      }

      alert("Profile updated successfully!");
      router.push("/view_reviews");
    } catch (err) {
      setError("Failed to update profile");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-3xl mb-6">Update Your Profile</h2>

              {error && (
                <div className="alert alert-error mb-4">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Work Preference */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-semibold">
                      Work Preference
                    </span>
                  </label>
                  <div className="space-y-2 space-x-2">
                    {["Internship", "Co-op", "Full-time"].map((option) => (
                      <label
                        key={option}
                        className="label cursor-pointer justify-start gap-4"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={workPreference.includes(option)}
                          onChange={() => handleWorkPreferenceChange(option)}
                        />
                        <span className="label-text">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Authorization */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-semibold">
                      Work Authorization
                    </span>
                  </label>
                  <div className="space-y-2 space-x-2">
                    {["US Citizen", "Green Card", "H1B Visa", "OPT", "CPT"].map(
                      (option) => (
                        <label
                          key={option}
                          className="label cursor-pointer justify-start gap-4"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={workAuthorization.includes(option)}
                            onChange={() =>
                              handleWorkAuthorizationChange(option)
                            }
                          />
                          <span className="label-text">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Major */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-semibold">
                      Major
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={major} 
                    onChange={(e) => setMajor(e.target.value)}
                  >
                    <option value="">Select a major</option>
                    {majors.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Graduation Year */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg font-semibold">
                      Expected Graduation Year
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                  >
                    <option value="">Select a year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Button */}
                <div className="card-actions justify-end mt-8">
                  <button
                    type="submit"
                    className={`btn btn-primary ${saving ? "loading" : ""}`}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
