import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrip } from "../context/TripContext";
import { useFriend } from "../context/FriendContext";
import { Trip } from "../types/types";

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const { getTrip } = useTrip();
  const { getUsername } = useFriend();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) {
        setError("No trip ID provided");
        setLoading(false);
        return;
      }

      try {
        const tripData = await getTrip(Number(id));
        setTrip(tripData);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError("Failed to load trip details");
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id, getTrip]);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="page-container">
        <div className="error-message">
          <p>Trip not found</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{ marginBottom: "1.5rem" }}
      >
        ← Back
      </button>

      <div className="trip-detail-card">
        <div className="trip-detail-header">
          <h1>{trip.name}</h1>
        </div>

        <div className="trip-detail-content">
          {trip.description && (
            <div className="trip-section">
              <h3>Description</h3>
              <p className="trip-description">{trip.description}</p>
            </div>
          )}

          <div className="trip-info-grid">
            <div className="trip-info-item">
              <label>Start Date</label>
              <p>{formatDate(trip.start_date)}</p>
            </div>

            <div className="trip-info-item">
              <label>End Date</label>
              <p>{formatDate(trip.end_date)}</p>
            </div>

            <div className="trip-info-item">
              <label>Trip Creator</label>
              <p>#{getUsername(trip.user_id)}</p>
            </div>

            {trip.conversation_id && (
              <div className="trip-info-item">
                <label>Conversation</label>
                <p>
                  <button
                    onClick={() => navigate(`/chat/${trip.conversation_id}`)}
                    className="btn-link"
                  >
                    View Conversation
                  </button>
                </p>
              </div>
            )}
          </div>

          <div className="trip-actions">
            <button className="btn-primary">Edit Trip</button>
            <button className="btn-secondary">View Events</button>
            <button className="btn-secondary">View Album</button>
          </div>
        </div>

        {/* Trip Details */}
        {/* Open Chat Button */}
        <button
          onClick={() => navigate(`/chat/${encodeURIComponent(trip.name)}`)}
          style={{
            marginTop: "10px",
            padding: "10px 16px",
            borderRadius: "8px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Open Group Chat
        </button>
      </div>
    </div>
  );
}
