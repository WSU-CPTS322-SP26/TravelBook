import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import api from "../api";
import { Event } from "../types/types";

// ════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════

export interface EventCreate {
  title: string;
  description?: string | null;
  trip_id: number;
  start: string | Date;
  end: string | Date;
  location: Record<string, any>;
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  trip_id?: number;
  start?: string | Date;
  end?: string | Date;
  location?: Record<string, any>;
}

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseEventReturn {
  // Queries
  getEventsByTrip: (tripId: number) => UseQueryResult<Event[], Error>;
  getEventById: (eventId: number) => UseQueryResult<Event, Error>;
  getEventsByDate: (date: string | Date) => UseQueryResult<Event[], Error>;

  // Mutations
  createEvent: (eventData: EventCreate) => Promise<Event>;
  updateEvent: (eventId: number, updates: Partial<EventUpdate>) => Promise<Event>;
  deleteEvent: (eventId: number) => Promise<void>;

  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useEvent = (): UseEventReturn => {
  const queryClient = useQueryClient();

  // 🔍 Fetch events by trip
  const getEventsByTripQuery = (tripId: number): UseQueryResult<Event[], Error> =>
    useQuery<Event[], Error>({
      queryKey: ["events", "trip", tripId],
      queryFn: async () => {
        const res = await api.get<Event[]>(`/events/by-trip/${tripId}`);
        return res.data;
      },
      enabled: !!tripId,
    });

  // 🔍 Fetch single event by ID
  const getEventByIdQuery = (eventId: number): UseQueryResult<Event, Error> =>
    useQuery<Event, Error>({
      queryKey: ["event", eventId],
      queryFn: async () => {
        const res = await api.get<Event>(`/events/by-id/${eventId}`);
        return res.data;
      },
      enabled: !!eventId,
    });

  // 🔍 Fetch events by date
  const getEventsByDateQuery = (date: string | Date): UseQueryResult<Event[], Error> => {
    const dateStr = typeof date === "string" ? date : date.toISOString();
    return useQuery<Event[], Error>({
      queryKey: ["events", "date", dateStr],
      queryFn: async () => {
        const res = await api.get<Event[]>(`/events/by-date/${dateStr}`);
        return res.data;
      },
      enabled: !!dateStr,
    });
  };

  // ✏️ Create event mutation
  const createEventMutation = useMutation<Event, Error, EventCreate>({
    mutationFn: async (eventData) => {
      const res = await api.post<Event>("/events/create", {
        title: eventData.title,
        description: eventData.description,
        trip_id: eventData.trip_id,
        start: typeof eventData.start === "string" ? eventData.start : eventData.start.toISOString(),
        end: typeof eventData.end === "string" ? eventData.end : eventData.end.toISOString(),
        location: eventData.location,
      });
      return res.data;
    },
    onSuccess: (newEvent) => {
      // Invalidate events by trip query
      queryClient.invalidateQueries({ queryKey: ["events", "trip", newEvent.trip_id] });
      // Invalidate events by date query
      queryClient.invalidateQueries({ queryKey: ["events", "date"] });
    },
  });

  // ✏️ Update event mutation
  const updateEventMutation = useMutation<Event, Error, { eventId: number; updates: Partial<EventUpdate> }>({
    mutationFn: async ({ eventId, updates }) => {
      const oldEventRes = await api.get<Event>(`/events/by-id/${eventId}`);
      const oldEvent = oldEventRes.data;

      const startValue = updates.start ?? oldEvent.start;
      const endValue = updates.end ?? oldEvent.end;
      const startStr = typeof startValue === "string" ? startValue : startValue.toISOString();
      const endStr = typeof endValue === "string" ? endValue : endValue.toISOString();

      const payload = {
        title: updates.title ?? oldEvent.title,
        description: updates.description ?? oldEvent.description,
        trip_id: updates.trip_id ?? oldEvent.trip_id,
        start: startStr,
        end: endStr,
        location: updates.location ?? oldEvent.location,
      };

      const res = await api.put<Event>(`/events/${eventId}`, payload);
      return res.data;
    },
    onSuccess: (updatedEvent, { eventId }) => {
      // Update single event cache
      queryClient.setQueryData<Event>(["event", eventId], updatedEvent);
      // Invalidate events by trip
      queryClient.invalidateQueries({ queryKey: ["events", "trip", updatedEvent.trip_id] });
      // Invalidate events by date
      queryClient.invalidateQueries({ queryKey: ["events", "date"] });
    },
  });

  // 🗑️ Delete event mutation
  const deleteEventMutation = useMutation<void, Error, { eventId: number; tripId: number }>({
    mutationFn: async ({ eventId }) => {
      await api.delete(`/events/${eventId}`);
    },
    onSuccess: (_, { eventId, tripId }) => {
      // Remove from event cache
      queryClient.removeQueries({ queryKey: ["event", eventId] });
      // Invalidate events by trip
      queryClient.invalidateQueries({ queryKey: ["events", "trip", tripId] });
      // Invalidate events by date
      queryClient.invalidateQueries({ queryKey: ["events", "date"] });
    },
  });

  return {
    // Queries
    getEventsByTrip: getEventsByTripQuery,
    getEventById: getEventByIdQuery,
    getEventsByDate: getEventsByDateQuery,

    // Mutations
    createEvent: (eventData) => createEventMutation.mutateAsync(eventData),
    updateEvent: (eventId, updates) =>
      updateEventMutation.mutateAsync({ eventId, updates }),
    deleteEvent: (eventId) => {
      // Need tripId for cache invalidation - this will be fetched from cache
      const cachedEvent = queryClient.getQueryData<Event>(["event", eventId]);
      return deleteEventMutation.mutateAsync({
        eventId,
        tripId: cachedEvent?.trip_id || 0,
      });
    },

    // Loading/Error states for mutations
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
  };
};
