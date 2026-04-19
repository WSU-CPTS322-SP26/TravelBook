// src/pages/MapPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useEvent } from "../context/EventContext";
import { useTrip } from "../context/TripContext";

export default function MapPage() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const { createEvent } = useEvent();
  const { activeTrip } = useTrip();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeTrip || !window.google?.maps) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat: 38.7946, lng: -106.5348 }, zoom: 4, mapId: "DEMO_MAP_ID" });
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { fields: ["geometry","name","formatted_address"] });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const loc = place.geometry.location;
      mapInstance.current.panTo(loc); mapInstance.current.setZoom(14); placeMarker(loc);
      setSelectedLocation({ name: place.name || place.formatted_address, lat: loc.lat(), lng: loc.lng() });
    });
    mapInstance.current.addListener("click", async (e) => {
      const loc = e.latLng; placeMarker(loc);
      setSelectedLocation({ name: await getPlaceName(loc), lat: loc.lat(), lng: loc.lng() });
    });
  }, [activeTrip]);

  function placeMarker(location) {
    if (!markerRef.current) markerRef.current = new window.google.maps.Marker({ position: location, map: mapInstance.current });
    else markerRef.current.setPosition(location);
  }

  async function getPlaceName(latLng) {
    const svc = new window.google.maps.places.PlacesService(mapInstance.current);
    return new Promise((resolve) => {
      svc.nearbySearch({ location: latLng, radius: 30 }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) { resolve(results[0].name); return; }
        new window.google.maps.Geocoder().geocode({ location: latLng }, (res) => resolve(res?.[0]?.formatted_address || "Unnamed location"));
      });
    });
  }

  async function saveLocation() {
    if (!selectedLocation) return;
    setSaving(true);
    await createEvent(selectedLocation.name, "", activeTrip.id, new Date().toISOString(), { latitude: selectedLocation.lat, longitude: selectedLocation.lng, name: selectedLocation.name });
    setSavedLocations((prev) => [...prev, selectedLocation]);
    setSelectedLocation(null); setSaving(false);
  }

  if (!activeTrip) return (
    <div className="page-container">
      <div className="card" style={{ textAlign:"center", padding:"4rem 2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.4 }}>🗺️</div>
        <h3 style={{ marginBottom:"0.5rem" }}>No active trip</h3>
        <p className="text-muted">Go to <strong style={{ color:"var(--amber)" }}>Trips</strong> and set one as active to start pinning locations.</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Map Explorer</h2>
          <p className="page-subtitle">Active: <span style={{ color:"var(--amber)" }}>{activeTrip.name}</span>{savedLocations.length > 0 && ` · ${savedLocations.length} saved`}</p>
        </div>
      </div>

      <div className="field-group mb-2">
        <label className="field-label">Search a place</label>
        <input ref={inputRef} className="text-input" placeholder="e.g. Eiffel Tower, Tokyo, Central Park…" />
      </div>

      <div className="map-wrapper">
        <div ref={mapRef} style={{ width:"100%", height:"clamp(320px,50vh,700px)" }} />
      </div>

      {selectedLocation && (
        <div className="card" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", marginBottom:"var(--space-md)", borderColor:"rgba(244,162,97,0.3)", animation:"slideDown 0.2s var(--ease)" }}>
          <div>
            <div style={{ fontSize:"0.72rem", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--muted)", marginBottom:"0.25rem" }}>Selected</div>
            <div style={{ fontWeight:600 }}>📍 {selectedLocation.name}</div>
            <div className="text-muted" style={{ fontSize:"0.78rem", marginTop:"0.1rem" }}>{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
          </div>
          <button className="btn-teal" onClick={saveLocation} disabled={saving} style={{ flexShrink:0 }}>
            {saving ? "Saving…" : "✓ Save Location"}
          </button>
        </div>
      )}

      {savedLocations.length > 0 && (
        <>
          <p className="section-label">Saved This Session</p>
          {savedLocations.map((loc, i) => (
            <div key={i} className="location-item">
              <div><div className="location-item-name">📍 {loc.name}</div><div className="location-item-coords">{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</div></div>
              <button className="btn-danger" onClick={() => setSavedLocations((p) => p.filter((_,j) => j !== i))}>✕</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
