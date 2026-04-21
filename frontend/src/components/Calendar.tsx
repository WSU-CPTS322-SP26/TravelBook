import React, { useState } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Event } from '../types/types';
import './Calendar.css';

interface CalendarProps {
  events?: Event[];
  onDateClick?: (date: Date, dayEvents: Event[]) => void;
}

export default function Calendar({ events = [], onDateClick }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      if (!event.start) return false;
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Handle date click
  const handleDateClick = (value: any) => {
    const date = Array.isArray(value) ? value[0] : value;
    if (date instanceof Date) {
      setSelectedDate(date);
      const dayEvents = getEventsForDate(date);
      if (onDateClick) {
        onDateClick(date, dayEvents);
      }
    }
  };

  // Custom tile content to show event badges
  const tileContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="event-badge">
        <span className="badge bg-warning text-dark">
          {dayEvents.length}
        </span>
      </div>
    );
  };

  return (
    <div>
      <ReactCalendar
        value={selectedDate}
        onClickDay={handleDateClick}
        tileContent={tileContent}
        className="react-calendar-custom"
      />
      </div>
  );
}
