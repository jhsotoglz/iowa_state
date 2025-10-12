"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyListSearch() {
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch the lists of companies 
  useEffect(() => {
    const getCompanies = async () => {
      try {
        const res = await fetch("/api/companyInfo");
        if (!res.ok) {
          return;
        }
        const data = await res.json();
        setCompanyData(data.companies || []);
        setFilteredCompanies(data.companies || []);
      }
      catch (error) {
        console.error(error);
      }
    };

    getCompanies();
  }, []);

  useEffect(() => {
    const filtered = companyData.filter((company) =>
        company.companyName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [search, companyData]);

  // This redirects to the company info page and shows the info depending on the company.
  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies_info/${companyId}`); 
  };


  return (
<div className="dropdown w-full relative">
  <label tabIndex={0} className="btn w-full justify-between">
    {selectedCompany || "Select a company"}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 ml-2 opacity-70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </label>

  <ul
    className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm overflow-y-auto"
  >
    <li className="px-2">
      <input
        type="text"
        placeholder="Search companies..."
        className="input input-bordered input-sm w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </li>

    {filteredCompanies.length > 0 ? (
      filteredCompanies.map((company) => (
        <li key={company._id}>
          <button
            onClick={() => handleCompanyClick(company._id)}
            className="w-full text-left"
          >
            {company.companyName}
          </button>
        </li>
      ))
    ) : (
      <li className="text-center text-sm opacity-60">No companies found</li>
    )}
  </ul>
</div>

  );
}
