"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<"Student" | "Employer" | null>(null);

  const handleUserRoleSelection = (role: "Student" | "Employer") => {
    if (role === "Student") {
      router.push("/student_login");
    } else {
      router.push("/employer_login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center">Select Your Role</h2>
          <div className="flex flex-col gap-4 mt-4">
            {/* Primary MongoDB Green Button */}
            <button
              onClick={() => handleUserRoleSelection("Student")}
              className="btn w-full bg-[#13AA52] hover:bg-[#0f8a43] text-white border-none"
            >
              Student
            </button>

            {/* Secondary / hover variant */}
            <button
              onClick={() => handleUserRoleSelection("Employer")}
              className="btn w-full bg-[#0a5429] hover:bg-[#397f56] text-white border-none"
            >
              Employer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
