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
            <button
              onClick={() => handleUserRoleSelection("Student")}
              className="btn btn-primary"
            >
              Student
            </button>
            <button
              onClick={() => handleUserRoleSelection("Employer")}
              className="btn btn-secondary"
            >
              Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
