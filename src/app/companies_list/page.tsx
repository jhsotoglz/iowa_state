"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompaniesList() {
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [ratingData, setRatingData] = useState<any[]>([]);
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

  // Sort by the most rated companies
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await fetch("/backend/reviews/summary");
        if (!res.ok) throw new Error("Failed to fetch summary");
        const data = await res.json();
        setRatingData(data.companies || []);
      } catch (err) {
        console.error("Error fetching ratings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  // Merge and sort by avgRating
  const mergedCompanies = companyData.map((company) => {
    const match = ratingData.find(
      (r) =>
        r.companyName.toLowerCase() ===
        company.companyName.toLowerCase()
    );
    return {
      ...company,
      avgRating: match?.avgRating ?? 0,
      reviewCount: match?.count ?? 0,
    };
  });

  // Sort by rating (descending)
  const sortedCompanies = [...mergedCompanies].sort(
    (a, b) => b.avgRating - a.avgRating
  );

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

      {sortedCompanies.map((company, index) => (
        <li key={index} className="list-row" onClick={() => handleCompanyClick(company._id)}>
          <div>
            <div>
              <div className="font-semibold text-lg">{company.companyName}</div>
              <div className="text-xs uppercase font-semibold opacity-60">
                {company.industry} 
              </div>
              <div className="text-sm mt-1 text-base-content/70">
                {company.avgRating}/5{" "}
              </div>
          </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
