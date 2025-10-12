"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function CompaniesInfo() {
  const params = useParams();
  const { id } = params;
  const [company, setCompany] = useState<any | null>(null);
  const [averageRating, setAverageRating] = useState(0);
  const [topMajors, setTopMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Fetch the profile data
  useEffect(() => {
      const checkUser = async () => {
        try {
          const res = await fetch("/api/user");
          if (!res.ok) {
            return;
          }
          const data = await res.json();
          setUser(data.user);
          console.log("User", data)
        }
        catch (error) {
          console.error(error);
        }
        finally {
          setLoading(false)
        }
      };
  
      checkUser();
    }, []);

  // Fetch the specific company data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/singleCompanyInfo/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCompany(data.company);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  // Fetch average rating and top majors
  useEffect(() => {
    if (!company?.companyName) return;

    const fetchCompanyRatingAndMajor = async () => {
      try {
        const res = await fetch(`/backend/reviews/summary`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        const companyRating = data.companies.find(
          (c: any) =>
            c.companyName.toLowerCase() ===
            company.companyName.toLowerCase()
        );

        setAverageRating(companyRating?.avgRating || 0);

        if (companyRating) setTopMajors(data.majors || []);
        else setTopMajors([]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyRatingAndMajor();
  }, [company]);

  const isMatched = React.useMemo(() => {
  if (!user || !company) return false;
  return user.matchedCompanies?.includes(company._id) || false;
}, [user, company]);

  if (loading || !company) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-xl text-[#13AA52]"></span>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
      <div className="max-w-2xl w-full bg-base-100 shadow-xl rounded-2xl p-8">
        {/* Company Name */}
        <h1 className="text-5xl font-extrabold text-[#13AA52] text-center mb-6">
          {company.companyName}
        </h1>

        <div className="divider"></div>

        <div className="space-y-6">
          {/* Average Rating */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Average Rating
            </h2>
            <div className="flex items-center gap-2">
              {averageRating > 0 ? (
                <span className="font-medium text-base-content/70">
                  ({averageRating}/5)
                </span>
              ) : (
                <span className="font-medium text-base-content/50 italic">
                  No ratings yet
                </span>
              )}
            </div>
          </div>

          {/* Industry */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Industry
            </h2>
            <span className="font-medium text-base-content/70">
              {company.industry}
            </span>
          </div>

          {/* Website */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Company Website
            </h2>
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-base-content/70 underline hover:text-[#13AA52]"
            >
              {company.website}
            </a>
          </div>

          {/* Recruiter Info */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
                Recruiter Info
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                {company.recruiterInfo && company.recruiterInfo.length > 0 ? (
                company.recruiterInfo.map((recruiter: string, index: number) => (
                    <span key={index} className="font-medium text-base-content/70">
                    {recruiter}
                    </span>
                ))
                ) : (
                <span className="font-medium text-base-content/50 italic">
                    No recruiter info
                </span>
                )}
            </div>
          </div>

          {/* Top Majors */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Top Majors
            </h2>
            <div className="flex flex-wrap gap-2">
              {topMajors && topMajors.length > 0 ? (
                topMajors.map((m: any, index: number) => (
                  <div
                    key={index}
                    className="badge badge-outline tooltip"
                    data-tip={`Average Rating: ${m.avgRating}/5`}
                  >
                    {m.major}
                  </div>
                ))
              ) : company.majors && company.majors.length > 0 ? (
                company.majors.map((major: string, index: number) => (
                  <div
                    key={index}
                    className="badge badge-outline"
                  >
                    {major}
                  </div>
                ))
              ) : (
                <span className="font-medium text-base-content/50 italic">
                  No majors listed
                </span>
              )}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Job Type
            </h2>
            <div className="flex flex-wrap gap-2">
              {company.employmentType.map((job: string, index: number) => (
                <div
                  key={index}
                  className="badge badge-outline"
                >
                  {job}
                </div>
              ))}
            </div>
          </div>

          {/* Hiring Info */}
          <div>
            <h2 className="text-2xl font-semibold text-[#0f8a43] mb-2">
              Hiring Info
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <span className="font-semibold">Visa Sponsor:</span>{" "}
                {company.majors.sponsorsVisa ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* Fit */}
          {user && company ? (
            <p className="flex items-center gap-2">
              {isMatched ? (
                <>
                  <span className="text-green-500 font-bold">✅</span> You’re a good fit!
                </>
              ) : (
                "Based on your profile, this company is not yet matched."
              )}
            </p>
          ) : (
            <p className="text-base-content/50 italic">Loading fit info...</p>
          )}
        </div>
      </div>
    </div>
  );
}
