"use client";
import React, { useState } from "react";

export default function CompaniesInfo() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
        <div className="max-w-2xl w-full bg-base-100 shadow-xl rounded-2xl p-8">
            <h1 className="text-5xl font-extrabold text-primary text-center mb-6">
            Company Name
            </h1>

            <div className="divider"></div>

            <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Average Rating
                </h2>
                <div className="flex items-center gap-2">
                <span className="font-medium text-base-content/70">(3/5)</span>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Majors
                </h2>
                <div className="flex flex-wrap gap-2">
                <div className="badge badge-outline">Software Engineering</div>
                <div className="badge badge-outline">Computer Science</div>
                <div className="badge badge-outline">Electrical Engineering</div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold text-secondary mb-2">
                Job Type
                </h2>
                <p className="text-base-content/80">Internship, Co-op, Full-Time</p>
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
