"use client";
import React from "react";

export default function CompaniesList() {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center py-8 px-4">
      {/* Profile Card */}
      <div className="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-md text-center">

        {/* Info */}
        <h2 className="text-2xl font-bold text-primary mb-2">Your Profile</h2>
        <p className="text-sm text-base-content/70 mb-1">
          Major: <span className="font-semibold text-base-content">Software Engineering</span>
        </p>
        <p className="text-sm text-base-content/70 mb-4">
          Employment Type: <span className="font-semibold text-base-content">Internship, Full-time</span>
        </p>

        <div className="divider"></div>

        {/* Reviews Section */}
        <h3 className="text-lg font-semibold text-secondary mb-3 text-left">Reviews</h3>

        <ul className="space-y-3">
          {/* Review 1 */}
          <li className="p-3 rounded-lg bg-base-200 hover:bg-base-300 transition">
            <div className="font-semibold text-base">TechCorp Inc.</div>
            <div className="text-sm text-base-content/70">
              “I hate their tech interviews — so unfair.”
            </div>
          </li>

          {/* Review 2 */}
          <li className="p-3 rounded-lg bg-base-200 hover:bg-base-300 transition">
            <div className="font-semibold text-base">GreenTech Solutions</div>
            <div className="text-sm text-base-content/70">“Company cool.”</div>
          </li>
        </ul>

        <div className="mt-6">
          <button className="btn btn-primary w-full">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
