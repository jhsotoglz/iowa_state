"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

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
}


const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const FloorMap = forwardRef<{ getMarkers: () => MarkerPosition[] }, FloorMapProps>(
  ({ imageUrl, width, height, companies = [], userType }, ref) => {
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
            : new L.LatLng(
                Math.random() * height,
                Math.random() * width
              ), 
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
          companyId: m._id
        })),
    }));

    const handleDragEnd = (index: number, newPos: LatLng) => {
      setMarkers((prev) => {
        const updated = [...prev];
        updated[index].boothNumber = newPos;
        return updated;
      });
    };

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
          {markers.map((m, i) => (
            <Marker
              key={i}
              position={m.boothNumber}
              icon={markerIcon}
              draggable = {userType === "admin" ? true : false}
              autoPan
              eventHandlers={{
                dragend: (e) => {
                  const newLatLng = e.target.getLatLng();
                  handleDragEnd(i, newLatLng);
                },
              }}
            >
              <Popup>
                <b>{m.companyName}</b>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }
);


export default FloorMap;
