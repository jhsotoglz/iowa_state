"use client";

import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Marker, Popup } from "react-leaflet";
import L, { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";

interface FloorMapProps {
  imageUrl: string;
  width: number;
  height: number;
  companies?: string[];
}

interface MarkerData {
  position: L.LatLng;
  text: string;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const FloorMap: React.FC<FloorMapProps> = ({ imageUrl, width, height, companies = [] }) => {
  if (!width || !height) {
    return <p>Loading floor map...</p>;
  }

  const bounds: L.LatLngBoundsExpression = [
    [0, 0],
    [height, width],
  ];

  const center: L.LatLngExpression = [height / 2, width / 2];
  const [markers, setMarkers] = useState<MarkerData[]>([]);

useEffect(() => {
  if (companies.length > 0) {
    const generatedMarkers = companies.map((name) => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        position: new L.LatLng(y, x),
        text: name,
      };
    });
    setMarkers(generatedMarkers);
  }
}, [companies, width, height]);


  const handleDragEnd = (index: number, newPos: LatLng) => {
    setMarkers((prev) => {
      const updated = [...prev];
      updated[index].position = newPos;
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
      style={{
        height: "100%",
        width: "100%",
        background: "#eaeaea", // optional fallback background
      }}
    >
      <ImageOverlay url={imageUrl} bounds={bounds} />
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={m.position}
          icon={markerIcon}
          draggable
          autoPan
          eventHandlers={{
            dragend: (e) => {
              const newLatLng = e.target.getLatLng();
              handleDragEnd(i, newLatLng);
            },
          }}
        >
          <Popup>
            <b>{m.text}</b>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);

};

export default FloorMap;
