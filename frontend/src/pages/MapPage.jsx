// src/pages/MapPage.js
import React, { useEffect, useRef } from "react";
import { useGoogleMaps } from "../hooks/useGoogleMaps";

const markers = [
  { name: "New York", position: { lat: 40.7128, lng: -74.006 } },
  { name: "London", position: { lat: 51.5074, lng: -0.1278 } },
  { name: "Paris", position: { lat: 48.8566, lng: 2.3522 } },
  { name: "Tokyo", position: { lat: 35.6762, lng: 139.6503 } },
  { name: "Cancun", position: { lat: 21.1619, lng: -86.8515 } },
];

export default function MapPage() {
  const loaded = useGoogleMaps();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!loaded || !mapRef.current || mapInstanceRef.current) return;

    const center = { lat: 30, lng: 0 };
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 2,
      disableDefaultUI: true,
      zoomControl: true,
    });

    markers.forEach((m) => {
      const marker = new window.google.maps.Marker({
        position: m.position,
        map,
        title: m.name,
      });

      const info = new window.google.maps.InfoWindow({
        content: `<div style="font-size:14px;font-weight:600;">${m.name}</div>`,
      });

      marker.addListener("click", () => {
        info.open({ anchor: marker, map });
      });
    });

    mapInstanceRef.current = map;
  }, [loaded]);

  return (
    <div className="page-container">
      <h2>Explore Destinations on Map</h2>
      <p className="muted">
        Click on a marker to see the city name.
      </p>
      <div className="map-container">
        {!loaded && <div className="map-loading">Loading map…</div>}
        <div ref={mapRef} className="map-canvas" />
      </div>
    </div>
  );
}
