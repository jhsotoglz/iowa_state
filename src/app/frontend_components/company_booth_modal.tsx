"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

interface CompanyBoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  companyId: String
}

export default function CompanyBoothModal({isOpen, onClose, children, companyId}: CompanyBoothModalProps) {
    const [companyData, setCompanyData] = useState<any>(null);

    // Fetch the data of the company 
    useEffect(() => {
        if (!isOpen || !companyId) return;
        // TODO: Replace with real fetch call 
        const fetchData = async () => {
        const res = await fetch(`/api/companies/${companyId}`);
        const data = await res.json();
        setCompanyData(data);
        };
        fetchData();
    }, [isOpen, companyId]);

    if (!isOpen) return null;
    
    return (
        <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
        >
        <div
            className="bg-base-100 rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 relative"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Currenty shows nothing but once the data is shown it will provide it. */}
            {companyData ? (
            <div>
                <h2 className="text-2xl font-bold mb-2">{companyData.name}</h2>
                <p className="text-base-content/80 mb-4">{companyData.description}</p>
            </div>
            ) : (
            children
            )}

            {/* Close button */}
            <button
            onClick={onClose}
            className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost"
            aria-label="Close"
            >
            ✕
            </button>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button className="btn btn-outline btn-primary min-w-[120px]">
                In Line?
            </button>

            <button className="btn btn-secondary min-w-[120px]">
                Rate
            </button>

            <Link href="/companies_info">
                <button className="btn btn-primary min-w-[120px]">
                Learn More
                </button>
            </Link>
            </div>
        </div>
        </div>
    );
}
