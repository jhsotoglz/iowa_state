"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useRouter } from "next/navigation";


export interface MarkerPosition {
  name: string;
  companyId?: Object;
  lat: number;
  lng: number;
}

interface FloorMapProps {
  imageUrl: string;
  width: number;
  height: number;
  companies: Company[];
  userType: string;
}

export interface Company {
  companyName: string;
  boothNumber: L.LatLng;
  majors: string[];
  recruiterInfo?: string;
  employmentType?: string[];
  industry?: string;
  website?: string;
  _id?: Object;
  count: number; // For heatmap intensity
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatLayer = (L as any)
      .heatLayer(points, {
        radius: 20,
        blur: 15,
        maxZoom: 2,
        gradient: {
          0.2: "#0000ff", // deep blue
          0.4: "#00ffff", // cyan
          0.6: "#ffff00", // yellow
          0.8: "#ff8000", // orange
          1.0: "#ff0000", // red
        },
      })
      .addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

const FloorMap = forwardRef<
  { getMarkers: () => MarkerPosition[] },
  FloorMapProps
>(({ imageUrl, width, height, companies = [], userType }, ref) => {
  if (!width || !height) {
    return <p>Loading floor map...</p>;
  }

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [height, width],
  ];
  const center: L.LatLngExpression = [height / 2, width / 2];
  const [markers, setMarkers] = useState<Company[]>([]);

  // Generate marker locations
  useEffect(() => {
    if (companies.length > 0) {
      const generatedMarkers = companies.map((company) => ({
        ...company,
        position: company.boothNumber
          ? company.boothNumber
          : new L.LatLng(Math.random() * height, Math.random() * width),
      }));
      setMarkers(generatedMarkers);
    }
  }, [companies, width, height]);

  // Expose `getMarkers()` to parent via ref
  useImperativeHandle(ref, () => ({
    getMarkers: () =>
      markers.map((m) => ({
        name: m.companyName,
        lat: m.boothNumber.lat,
        lng: m.boothNumber.lng,
        companyId: m._id,
      })),
  }));

  const handleDragEnd = (index: number, newPos: LatLng) => {
    setMarkers((prev) => {
      const updated = [...prev];
      updated[index].boothNumber = newPos;
      return updated;
    });
  };
  const router = useRouter();

  return (
    
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        crs={L.CRS.Simple}
        center={center}
        zoom={0}
        minZoom={-4}
        maxZoom={2}
        style={{ height: "100%", width: "100%", background: "#eaeaea" }}
      >
        <ImageOverlay url={imageUrl} bounds={bounds} />

        <HeatmapLayer
          points={markers.map((m) => [
            m.boothNumber.lat,
            m.boothNumber.lng,
            m.count * 0.5,
          ])}
        />

        {markers.map((m, i) => (
          <Marker
            key={i}
            position={m.boothNumber}
            icon={markerIcon}
            draggable={userType === "admin"}
            autoPan
            eventHandlers={{
              dragend: (e) => {
                const newLatLng = e.target.getLatLng();
                handleDragEnd(i, newLatLng);
              },
            }}
          >
            <Popup>
              <div>
                {m.companyName}
                <br />
                {m.majors && <span>Majors: {m.majors.join(", ")}</span>}
                {m.recruiterInfo && <span>Recruiter: {m.recruiterInfo}</span>}
                <br />
                {m.employmentType && (
                  <span>Employment Type: {m.employmentType.join(", ")}</span>
                )}
                <br />
                {m.count && <span>Line Count: {m.count}</span>}
                <br />
                <div className="flex items-center space-x-3 mt-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (m.website) window.open(m.website, "_blank");
                    }}
                  >
                    Visit Website
                  </button>

                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => router.push(`/create_review`)}
                  >
                    Review
                  </button>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-neutral"
                    />
                    <span className="ml-2">In Line?</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

export default FloorMap;
