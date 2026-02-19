// src/pages/MapPage.jsx
import React, { useEffect, useRef } from "react";

export default function MapPage() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Wait for Google Maps to load
    if (!window.google || !window.google.maps) return;

    // Create the map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 38.7946, lng: -106.5348 },
      zoom: 4,
      mapId: "DEMO_MAP_ID",
    });

    // Create autocomplete search
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "name"],
      }
    );

    // When user selects a place
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      mapInstance.current.panTo(place.geometry.location);
      mapInstance.current.setZoom(10);
    });
  }, []);

  return (
    <div className="page-container">
      <h2>Explore Destinations</h2>

      {/* Search Bar */}
      <input
        ref={inputRef}
        className="text-input"
        placeholder="Search for a city or place..."
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "8px",
        }}
      />

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
