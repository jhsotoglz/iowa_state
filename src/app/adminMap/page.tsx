"use client";
import dynamic from "next/dynamic";

const FloorMap = dynamic(() => import("../frontend_components/floor_map"), {
  ssr: false,
});

export default function adminMap() {
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
          imageUrl="/isu_floor.png"
          width={3000}
          height={1800}
          companies={["Company 1", "Company 2", "Company 3", "Company 4"]}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 10,
          padding: 40,
        }}
      >
        <button
          className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          onClick={() => alert("Map saved!")}
        >
          Save Map
        </button>
      </div>
    </div>
  );
}
