import React, { useEffect, useState } from "react";
import { useTrip } from "../context/TripContext";
import { useEvent } from "../context/EventContext";

export default function CalendarPage() {
  const { activeTrip } = useTrip();
  const { getEventsByTrip, updateEvent } = useEvent();

  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState([]);
  const [itinerary, setItinerary] = useState({});

  useEffect(() => {
    if (!activeTrip) return;
    getEventsByTrip(activeTrip.id).then((data) => {
      setEvents(data)
      const pre = {};
      data.forEach(event => {
        if (!event.date || !startDate || !endDate) return;
        const eventDate = new Date(event.date);
        days.forEach((day, index) => {
          if (day.toDateString() === eventDate.toDateString()) {
            pre[index] = event.name;
          }
        });
      });
      setItinerary(pre)
    });
  }, [activeTrip]);

  // generate days when date range changes
  useEffect(() => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayList = [];
    let current = new Date(start);
    while (current <= end) {
      dayList.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    setDays(dayList);
  }, [startDate, endDate]);

  async function assignEvent(dayIndex, eventName) {
    if(Object.entries(itinerary).find( ([i, name]) => name==eventName ) && eventName!="") {
      alert(`${eventName} already belongs to a day!`);
      return;
    }
    setItinerary((prev) => ({ ...prev, [dayIndex]: eventName }));
    const event = events.find( (event) => event.name==eventName );
    const day = days[dayIndex]
    if(!event) return;

    await updateEvent( event.id, event.name, event.description, event.trip_id, day.toISOString(), event.location);
  }

  return (
    <div className="page-container">
      <h2>Trip Calendar</h2>

      {!activeTrip ? (
        <p>No active trip selected. Go to <strong>Trips</strong> and set one as active!</p>
      ) : (
        <>
          <h3>Active Trip: {activeTrip.name}</h3>

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px" }}
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "12px", borderRadius: "8px" }}
          />

          {days.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <h3>Assign Events to Each Day</h3>

              {days.map((day, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    marginBottom: "10px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <strong>Day {index + 1} — {day.toDateString()}</strong>

                  <select
                    value={itinerary[index] || ""}
                    onChange={(e) => assignEvent(index, e.target.value)}
                    style={{ width: "100%", padding: "10px", marginTop: "8px", borderRadius: "8px" }}
                  >
                    <option value="">Select an event...</option>
                    {events.map((event, i) => (
                      <option key={i} value={event.name}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <p style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85em",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
                paddingBottom: "-5px",
                display: "inline-block",
              }}>
                Automatically Saves
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}