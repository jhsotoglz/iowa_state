"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function CompaniesInfo() {
    const params = useParams(); 
    const { id } = params;
    const [company, setCompany] = useState<any | null>(null);
    const [averageRating, setAverageRating] = useState(0)
    const [topMajors, setTopMajors] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [loading, setLoading] = useState(true);
    
    // Fetch the specific company data.
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

    // Fetch the average rating and top majors for the company.
    useEffect(() => {
        if (!company?.companyName) return;

        const fetchCompanyRatingAndMajor = async () => {
        try {
            const res = await fetch(`/backend/reviews/summary`); 
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            // Finds the rating for the specific given company.
            const companyRating = data.companies.find(
                (c: any) => c.companyName.toLowerCase() === company.companyName.toLowerCase()
            );

            setAverageRating(companyRating?.avgRating || 0);

            // Use majors only if the current company has ratings
            if (companyRating) {
                setTopMajors(data.majors || []);
            } 
            else {
                setTopMajors([]);
            }

            console.log("Majors", data)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

        fetchCompanyRatingAndMajor();
    }, [company]);

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-screen bg-base-200">
            <span className="loading loading-spinner loading-xl text-primary"></span>
        </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
        <div className="max-w-2xl w-full bg-base-100 shadow-xl rounded-2xl p-8">
            <h1 className="text-5xl font-extrabold text-primary text-center mb-6">
            {company.companyName}
            </h1>

            <div className="divider"></div>

            <div className="space-y-6">

            <div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">
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

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Industry
                </h2>
                <div className="flex items-center gap-2">
                <span className="font-medium text-base-content/70">{company.industry}</span>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Company Size
                </h2>
                <div className="flex items-center gap-2">
                <span className="font-medium text-base-content/70">{company.companySize}</span>
                </div>
            </div>

            <div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">
                Company Website
            </h2>
            <div className="flex items-center gap-2">
                <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-base-content/70 underline hover:text-primary"
                >
                {company.website}
                </a>
            </div>
            </div>

            <div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">
                Recruiter Info
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                <span className="font-medium text-base-content/70">
                {company.recruiterInfo.name}
                </span>
                <span className="font-medium text-base-content/70">
                {company.recruiterInfo.email}
                </span>
                <span className="font-medium text-base-content/70">
                {company.recruiterInfo.phone}
                </span>
            </div>
            </div>

            <div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">
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
                    <div key={index} className="badge badge-outline">
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

            <div>
            <h2 className="text-2xl font-semibold text-secondary mb-2">
                Job Type
            </h2>
            <div className="flex flex-wrap gap-2">
                {company.employmentType.map((job: string, index: number) => (
                <div key={index} className="badge badge-outline">
                    {job}
                </div>
                ))}
            </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Class Type
                </h2>
                <p className="text-base-content/80">
                Freshman, Sophomore, Junior, Senior
                </p>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                    Hiring Info
                </h2>

                <div className="flex flex-col gap-4">
                    <div>
                    <span className="font-semibold">Visa Sponsor:</span>{" "}
                    {company.majors.sponsorsVisa ? "Yes" : "No"}
                    </div>
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Do You Fit?
                </h2>
                <p className="text-base-content/80">
                Based on your profile and interests, this company could be a great
                match for your skillset.
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}