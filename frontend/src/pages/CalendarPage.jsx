import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import EventList from "../components/EventList";
import api from "../api";
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-theme.css';

export default function CalendarPage() {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const locales = {
    'en-US': enUS
  }
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales
  });

  // Convert backend events to react-big-calendar format
  const formattedEvents = useMemo(() => {
    return allEvents.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  }, [allEvents]);

  // Fetch all events for the current user
  const fetchAllEvents = useCallback(async () => {
    if (!user) return;

    setIsLoadingEvents(true);
    try {
      // Fetch all trips first
      const tripsRes = await api.get("/trips/getTrips");
      const trips = tripsRes.data;

      // Fetch events for all trips
      const allEventsData = [];
      for (const trip of trips) {
        try {
          const eventsRes = await api.get(`/events/by-trip/${trip.id}`);
          allEventsData.push(...eventsRes.data);
        } catch (error) {
          console.error(`Error fetching events for trip ${trip.id}:`, error);
        }
      }

      setAllEvents(allEventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [user]);

  // Fetch events on component mount and user change
  React.useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Auto-refresh events every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchAllEvents();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchAllEvents]);

  // Handle date click to show events for that day
  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    const dateStr = slotInfo.start.toISOString().split('T')[0];
    const dayEvents = allEvents.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    setSelectedDateEvents(dayEvents);
  };



  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Calendar</h2>
        {user && (
          <button
            className="btn-primary"
            onClick={fetchAllEvents}
            disabled={isLoadingEvents}
          >
            {isLoadingEvents ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>
        <>
          {/* Calendar Component */}
          {isLoadingEvents && (
            <div className="notification-box" style={{ position: "relative", top: "0", right: "0", width: "100%", marginBottom: "1rem" }}>
              <div className="notification-item info">
                <span>Loading events...</span>
              </div>
            </div>
          )}

          <div className="calendar-wrapper">
            <Calendar
              defaultView='month'
              events={formattedEvents}
              localizer={localizer}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              selectable
              style={{ height: "100%" }}
            />
          </div>

          {/* Events Display Box */}
          {selectedDate && (
            <div className="card" style={{ marginTop: "2rem" }}>
              <EventList 
                events={selectedDateEvents}
                title={`Events on ${format(selectedDate, 'MMMM d, yyyy')}`}
              />
            </div>
          )}
        </>
    </div>
  );
}