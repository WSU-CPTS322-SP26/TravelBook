// src/pages/MapPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useEvent } from "../context/EventContext";
import { useTrip } from "../context/TripContext";

export default function MapPage() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const {createEvent} = useEvent();
  const {activeTrip} = useTrip();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);


  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    // Create map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 38.7946, lng: -106.5348 },
      zoom: 4,
      mapId: "DEMO_MAP_ID",
    });

    // Autocomplete search
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["geometry", "name", "formatted_address"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const location = place.geometry.location;

      mapInstance.current.panTo(location);
      mapInstance.current.setZoom(14);

      placeMarker(location);

      setSelectedLocation({
        name: place.name || place.formatted_address,
        lat: location.lat(),
        lng: location.lng(),
      });
    });

    // Click ANYWHERE on the map
    mapInstance.current.addListener("click", async (e) => {
      const location = e.latLng;

      placeMarker(location);

      const placeName = await getPlaceName(location);

      setSelectedLocation({
        name: placeName,
        lat: location.lat(),
        lng: location.lng(),
      });
    });
  }, []);

  // Helper: place or move marker
  function placeMarker(location) {
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
      });
    } else {
      markerRef.current.setPosition(location);
    }
  }

  // Get real place names (shops, restaurants, etc.)
  async function getPlaceName(latLng) {
    const placesService = new window.google.maps.places.PlacesService(
      mapInstance.current
    );

    return new Promise((resolve) => {
      placesService.nearbySearch(
        {
          location: latLng,
          radius: 30,
        },
        (results, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results.length > 0
          ) {
            resolve(results[0].name);
          } else {
            // fallback: reverse geocode
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (res) => {
              if (res && res[0]) resolve(res[0].formatted_address);
              else resolve("Unnamed location");
            }); 
          }
        }
      );
    });
  }

  // Save the selected location
  async function saveLocation() {
    if (!selectedLocation) return;

    await createEvent(
      selectedLocation.name,
      "",
      activeTrip.id,
      new Date().toISOString(),
      { lat: selectedLocation.lat, lng: selectedLocation.lng, name: selectedLocation.name }
    );

    setSavedLocations((prev) => [...prev, selectedLocation]);
    setSelectedLocation(null);
    //localStorage.setItem("savedLocations", JSON.stringify([...savedLocations, selectedLocation]));
  }

  // NEW: Delete a saved location
  function deleteLocation(index) {
    setSavedLocations((prev) => prev.filter((_, i) => i !== index));
  }

  
  return (
    <div className="page-container">
      <h2>Select a Location</h2>

      {/* Search Bar */}
      <input
        ref={inputRef}
        className="text-input"
        placeholder="Search for any place..."
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

      {/* Selected Location Preview */}
      {selectedLocation && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3>Selected Location</h3>
          <p><strong>Name:</strong> {selectedLocation.name}</p>

          <button
            onClick={saveLocation}
            style={{
              marginTop: "10px",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Save Location
          </button>
        </div>
      )}

      {/* Saved Locations List */}
      {savedLocations.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3>Saved Locations</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {savedLocations.map((loc, index) => (
              <li
                key={index}
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {loc.name}
                </span>

                <button
                  onClick={() => deleteLocation(index)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    background: "#d9534f",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
