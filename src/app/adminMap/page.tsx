"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import type { MarkerPosition } from "../frontend_components/floor_map";

const FloorMap = dynamic(() => import("../frontend_components/floor_map"), {
  ssr: false,
});

export default function AdminMap() {
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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div
        style={{
          width: "80vw",
          height: "80vh",
          border: "2px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
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
            position: null, 
            _id: c._id,
          }))}
          userType="admin"
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          padding: 55,
        }}
      >
        <button
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          onClick={handleSave}
        >
          Save Map
        </button>
      </div>
    </div>
  );
}
