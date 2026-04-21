import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import api from "../api";
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Calendar</h2>
        {user && (
          <button
            className="btn btn-sm btn-primary"
            onClick={fetchAllEvents}
            disabled={isLoadingEvents}
          >
            {isLoadingEvents ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </div>

      {!user ? (
        <div className="alert alert-info" role="alert">
          <strong>Please log in</strong> to view the calendar.
        </div>
      ) : (
        <>
          {/* Calendar Component */}
          {isLoadingEvents && (
            <div className="alert alert-warning">Loading events...</div>
          )}

          <Calendar
            defaultView='month'
            events={formattedEvents}
            localizer={localizer}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            selectable
            style={{ height: 500 }}
          />

          {/* Events Display Box */}
          {selectedDate && (
            <div className="card mt-4 shadow">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  Events on {format(selectedDate, 'MMMM d, yyyy')}
                </h5>
              </div>
              <div className="card-body">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-muted mb-0">No events scheduled for this date.</p>
                ) : (
                  <div>
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="alert alert-primary mb-3"
                        role="alert"
                      >
                        <h6 className="alert-heading mb-2">{event.title}</h6>
                        {event.description && (
                          <p className="mb-2">
                            <strong>Description:</strong> {event.description}
                          </p>
                        )}
                        {event.start && (
                          <p className="mb-0">
                            <strong>Time:</strong> {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                          </p>
                        )}
                        {event.location?.name && (
                          <p className="mb-0">
                            <strong>Location:</strong> {event.location.name}
                            {event.location.address && ` - ${event.location.address}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}