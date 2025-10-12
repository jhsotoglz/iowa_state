"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompaniesList() {
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
        console.log(data)
        setCompanyData(data.companies || []);
      }
      catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false)
      }
    };

    getCompanies();
  }, []);

  // This redirects to the company info page and shows the info depending on the company.
  const handleCompanyClick = (companyId: string) => {
    router.push(`/companies_info/${companyId}`); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-xl text-primary"></span>
      </div>
    );
  }

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
        List of companies
      </li>

      {companyData.map((company, index) => (
        <li key={index} className="list-row" onClick={() => handleCompanyClick(company._id)}>
          <div>
            <div className="font-semibold">{company.companyName}</div>
            <div className="text-xs uppercase font-semibold opacity-60">
              {company.industry} • {company.boothNumber}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
