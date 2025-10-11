"use client";
import React from "react";

export default function CompaniesList() {
  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {/* Header */}
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        List of companies
      </li>

      {/* Company 1 */}
      <li className="list-row">
        <div>
          <div className="font-semibold">TechCorp Inc.</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Software & AI • San Francisco, CA
          </div>
        </div>
      </li>

      {/* Company 2 */}
      <li className="list-row">
        <div>
          <div className="font-semibold">GreenTech Solutions</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Renewable Energy • Austin, TX
          </div>
        </div>
      </li>

      {/* Company 3 */}
      <li className="list-row">
        <div>
          <div className="font-semibold">HealthNet Analytics</div>
          <div className="text-xs uppercase font-semibold opacity-60">
            Healthcare Data • Boston, MA
          </div>
        </div>
      </li>
    </ul>
  );
}
