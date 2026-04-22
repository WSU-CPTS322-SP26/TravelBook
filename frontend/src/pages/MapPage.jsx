// Generative AI was used to develop this code
// src/pages/MapPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useEvent } from "../hooks/useEvent";
import { useTrip } from "../hooks/useTrip";
import EventEdit from "../components/EventEdit";

export default function MapPage() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const { createEvent } = useEvent();
  const { trips, isLoadingTrips, tripsError } = useTrip();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);

  const selectedTrip = trips?.find((trip) => trip.id === Number(selectedTripId)) || null;

  useEffect(() => {
    if (!trips || trips.length === 0) {
      setSelectedTripId("");
      return;
    }
    if (!selectedTripId) {
      setSelectedTripId(String(trips[0].id));
    }
  }, [trips, selectedTripId]);

  async function fetchPlaceDetails(placeId) {
    if (!placeId || !mapInstance.current) return null;
    const service = new window.google.maps.places.PlacesService(mapInstance.current);
    return new Promise((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: [
            "name",
            "formatted_address",
            "rating",
            "review",
            "reviews",
            "website",
            "url",
            "opening_hours",
            "formatted_phone_number",
            "photos",
          ],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(place);
          } else {
            resolve(null);
          }
        }
      );
    });
  }



  useEffect(() => {
    if (!window.google?.maps || !mapRef.current || !inputRef.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, { center: { lat: 38.7946, lng: -106.5348 }, zoom: 4, mapId: "DEMO_MAP_ID" });
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { fields: ["geometry","name","formatted_address","place_id"] });
    autocomplete.addListener("place_changed", async () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const loc = place.geometry.location;
      mapInstance.current.panTo(loc); 
      mapInstance.current.setZoom(14); 
      placeMarker(loc);
      
      setSelectedLocation({ name: place.name || place.formatted_address, lat: loc.lat(), lng: loc.lng(), place_id: place.place_id });
      
      // Fetch detailed information
      setLoadingDetails(true);
      const details = await fetchPlaceDetails(place.place_id);
      setLocationDetails(details);
      setLoadingDetails(false);
    });
    
    mapInstance.current.addListener("click", async (e) => {
      const loc = e.latLng; 
      placeMarker(loc);
      setLoadingDetails(true);
      
      // Use reverse geocoding and nearby search to find place details
      const service = new window.google.maps.places.PlacesService(mapInstance.current);
      service.nearbySearch({ location: loc, radius: 30 }, async (results, status) => {
        let placeId = null;
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
          placeId = results[0].place_id;
        }
        
        const name = results && results.length > 0 ? results[0].name : await getPlaceName(loc);
        setSelectedLocation({ name, lat: loc.lat(), lng: loc.lng(), place_id: placeId });
        
        if (placeId) {
          const details = await fetchPlaceDetails(placeId);
          setLocationDetails(details);
        } else {
          setLocationDetails(null);
        }
        setLoadingDetails(false);
      });
    });
  }, []);

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

  async function handleCreateEventFromLocation(payload) {
    if (!selectedLocation || !selectedTrip) return;
    setSaving(true);
    try {
      await createEvent({
        title: payload.title,
        description: payload.description,
        trip_id: selectedTrip.id,
        start: payload.start,
        end: payload.end,
        location: { 
          name: payload.locationName, 
          address: payload.locationAddress
        }
      });
      setShowEventModal(false);
    } catch (error) {
      console.error("Failed to create event:", error);
    } finally {
      setSaving(false);
    }
  }

  if (isLoadingTrips) return (
    <div className="page-container">
      <div className="card" style={{ textAlign:"center", padding:"4rem 2rem" }}>
        <h3 style={{ marginBottom:"0.5rem" }}>Loading trips...</h3>
      </div>
    </div>
  );

  if (tripsError) return (
    <div className="page-container">
      <div className="card" style={{ textAlign:"center", padding:"4rem 2rem" }}>
        <h3 style={{ marginBottom:"0.5rem" }}>Unable to load trips</h3>
        <p className="text-muted">{tripsError.message}</p>
      </div>
    </div>
  );

  if (!trips || trips.length === 0) return (
    <div className="page-container">
      <div className="card" style={{ textAlign:"center", padding:"4rem 2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.4 }}>🗺️</div>
        <h3 style={{ marginBottom:"0.5rem" }}>No trips found</h3>
        <p className="text-muted">Create a trip first, then you can pin map locations to it.</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Map Explorer</h2>
        </div>
      </div>

      <div className="field-group mb-2">
        <label className="field-label">Search a place</label>
        <input ref={inputRef} className="text-input" placeholder="e.g. Eiffel Tower, Tokyo, Central Park…" />
      </div>

      <div className="map-wrapper">
        <div ref={mapRef} style={{ width:"100%", height:"clamp(320px,50vh,700px)" }} />
      </div>

      <EventEdit
        open={showEventModal}
        event={selectedLocation ? {
          id: -1,
          user_id: 0,
          title: selectedLocation.name,
          description: locationDetails?.formatted_address || "",
          start: new Date().toISOString(),
          end: new Date(Date.now() + 3600000).toISOString(),
          location: { name: selectedLocation.name, address: locationDetails?.formatted_address || null },
          trip_id: selectedTrip?.id ?? -1
        } : null}
        saving={saving}
        title="Add Location to Trip"
        saveLabel="Save Event"
        trips={trips}
        selectedTripId={Number(selectedTripId)}
        onTripChange={(tripId) => setSelectedTripId(String(tripId))}
        onClose={() => setShowEventModal(false)}
        onSave={handleCreateEventFromLocation}
      />

      {selectedLocation && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "var(--space-md)", borderColor: "rgba(244,162,97,0.3)", animation: "slideDown 0.2s var(--ease)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: "0.25rem" }}>Selected Location</div>
              <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--cream)" }}>📍 {selectedLocation.name}</div>
              <div style={{ fontSize: "0.78rem", marginTop: "0.1rem", color: "var(--cream)" }}>{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</div>
            </div>
            <button className="btn-teal" onClick={() => setShowEventModal(true)} disabled={!selectedTrip} style={{ flexShrink: 0 }}>
              ✓ Add to Trip
            </button>
          </div>
          
          {loadingDetails ? (
            <div style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Loading details...</div>
          ) : locationDetails ? (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {locationDetails.formatted_address && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Address</div>
                  <p style={{ fontSize: "0.9rem", margin: 0, color: "var(--cream)" }}>{locationDetails.formatted_address}</p>
                </div>
              )}
              
              {locationDetails.rating && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Rating</div>
                  <p style={{ fontSize: "0.9rem", margin: 0, color: "var(--cream)" }}>⭐ {locationDetails.rating.toFixed(1)} {locationDetails.reviews ? `(${locationDetails.reviews.length} reviews)` : ""}</p>
                </div>
              )}
              
              {locationDetails.formatted_phone_number && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Phone</div>
                  <p style={{ fontSize: "0.9rem", margin: 0, color: "var(--cream)" }}>{locationDetails.formatted_phone_number}</p>
                </div>
              )}
              
              {locationDetails.website && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Website</div>
                  <a href={locationDetails.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem", color: "var(--amber)", textDecoration: "none", wordBreak: "break-all" }}>
                    Visit Website →
                  </a>
                </div>
              )}
              
              {locationDetails.opening_hours && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.25rem" }}>Hours</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--cream)" }}>
                    {locationDetails.opening_hours.weekday_text?.map((day, i) => (
                      <div key={i} style={{ lineHeight: "1.4" }}>{day}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {locationDetails.reviews && locationDetails.reviews.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>Recent Reviews</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {locationDetails.reviews.slice(0, 3).map((review, i) => (
                      <div key={i} style={{ padding: "0.75rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                          <strong>{review.author_name}</strong>
                          <span style={{ color: "var(--amber)" }}>{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <p style={{ margin: 0, color: "var(--cream-dim)", lineHeight: "1.4" }}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}