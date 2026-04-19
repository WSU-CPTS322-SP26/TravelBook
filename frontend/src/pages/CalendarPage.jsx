// src/pages/CalendarPage.jsx
import React, { useEffect, useState } from "react";
import { useTrip } from "../context/TripContext";
import { useEvent } from "../context/EventContext";

export default function CalendarPage() {
  const { activeTrip, setTripDate } = useTrip();
  const { getEventsByTrip, updateEvent } = useEvent();
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState([]);
  const [itinerary, setItinerary] = useState({});

  useEffect(() => {
    if (!activeTrip) return;
    if (activeTrip.start_date && activeTrip.end_date) {
      setStartDate(activeTrip.start_date.split("T")[0]);
      setEndDate(activeTrip.end_date.split("T")[0]);
    }
  }, [activeTrip?.id]);

  useEffect(() => {
    if (!activeTrip) return;
    getEventsByTrip(activeTrip.id).then((data) => {
      setEvents(data);
      const pre = {};
      data.forEach((event) => {
        if (!event.date || !startDate || !endDate) return;
        const eventDate = new Date(event.date);
        days.forEach((day, index) => { if (day.toDateString() === eventDate.toDateString()) pre[index] = event.name; });
      });
      setItinerary(pre);
    });
  }, [activeTrip]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate); start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
    const end   = new Date(endDate);   end.setMinutes(end.getMinutes()     + end.getTimezoneOffset());
    setTripDate(activeTrip.id, start, end);
    const dayList = []; let cur = new Date(start);
    while (cur <= end) { dayList.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    setDays(dayList);
  }, [startDate, endDate]);

  async function assignEvent(dayIndex, eventName) {
    if (Object.entries(itinerary).find(([, n]) => n === eventName) && eventName !== "") { alert(`${eventName} already belongs to a day!`); return; }
    setItinerary((prev) => ({ ...prev, [dayIndex]: eventName }));
    const event = events.find((e) => e.name === eventName);
    if (!event) return;
    await updateEvent(event.id, event.name, event.description, event.trip_id, days[dayIndex].toISOString(), event.location);
  }

  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  if (!activeTrip) return (
    <div className="page-container">
      <div className="card" style={{ textAlign:"center", padding:"4rem 2rem" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem", opacity:0.4 }}>📅</div>
        <h3 style={{ marginBottom:"0.5rem" }}>No active trip</h3>
        <p className="text-muted">Go to <strong style={{ color:"var(--amber)" }}>Trips</strong> and set one as active to build your calendar.</p>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Trip Calendar</h2>
          <p className="page-subtitle">Active: <span style={{ color:"var(--amber)" }}>{activeTrip.name}</span></p>
        </div>
      </div>

      <div className="calendar-date-inputs">
        <div className="field-group"><label className="field-label">Start Date</label><input type="date" className="text-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div className="field-group"><label className="field-label">End Date</label><input type="date" className="text-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
      </div>

      {days.length > 0 && (
        <>
          <p className="section-label">Itinerary — {days.length} Days</p>
          <div className="calendar-grid">
            {days.map((day, index) => (
              <div key={index} className="calendar-day-card">
                <div className="calendar-day-badge">
                  <div className="calendar-day-number">{String(day.getDate()).padStart(2,"0")}</div>
                  <div className="calendar-day-label">{DAY_NAMES[day.getDay()]}</div>
                </div>
                <div className="calendar-day-content">
                  <div className="calendar-day-title">Day {index + 1}</div>
                  <select className="select-input" value={itinerary[index] || ""} onChange={(e) => assignEvent(index, e.target.value)}>
                    <option value="">Select an event…</option>
                    {events.map((e, i) => <option key={i} value={e.name}>{e.name}</option>)}
                  </select>
                </div>
                {itinerary[index] && <span style={{ fontSize:"0.75rem", color:"var(--teal)", fontWeight:600, whiteSpace:"nowrap" }}>✓ Saved</span>}
              </div>
            ))}
          </div>
          <p className="text-muted mt-2" style={{ fontSize:"0.8rem" }}>Changes save automatically.</p>
        </>
      )}
    </div>
  );
}
