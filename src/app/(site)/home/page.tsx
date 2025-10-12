"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import type { MarkerPosition } from "../frontend_components/floor_map";

const FloorMap = dynamic(() => import("../frontend_components/floor_map"), {
  ssr: false,
});

export default function home() {
  const floorMapRef = useRef<{ getMarkers: () => MarkerPosition[] }>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/companyInfo")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched company data:", data);
        const companyList =
          Array.isArray(data) && data[0]?.companies
            ? data[0].companies
            : Array.isArray(data)
            ? data
            : data.companies || [];

        setCompanies(companyList);
      })
      .catch((err) => console.error("Error fetching company info:", err));
  }, []);

  const handleSave = async () => {
    const positions = floorMapRef.current?.getMarkers() || [];

    try {
      // Send PATCH requests for all markers in parallel
      const updates = positions.map((marker) => {
        console.log("Updating marker:", marker.companyId);
        return fetch("/api/companyInfo", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: marker.companyId,
            updateData: {
              boothNumber: {
                lat: marker.lat,
                lng: marker.lng,
              },
            },
          }),
        });
      });

      await Promise.all(updates);

      alert("Booth numbers successfully updated!");
    } catch (error) {
      console.error("Error updating booth numbers:", error);
      alert("Failed to update booth numbers.");
    }
  };

  return (
<main className="relative min-h-screen bg-base-200 flex items-center justify-center p-6">
  <div className="w-4/5 h-[80vh] card bg-base-100 shadow-xl overflow-hidden">
    <div className="card-body p-0">
      <FloorMap
        ref={floorMapRef}
        imageUrl="/isu_floor.png"
        width={3000}
        height={1800}
        companies={companies.map((c) => ({
          companyName: c.companyName,
          boothNumber: c.boothNumber,
          majors: c.majors,
          recruiterInfo: c.recruiterInfo?.name,
          employmentType: c.employmentType,
          industry: c.industry,
          website: c.website,
          _id: c._id,
          count: c.count
        }))}
        userType=""
      />
    </div>
  </div>
</main>

  );
}
