import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import api from "../api";
import { Trip } from "../types/types";

// ════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════

export interface TripCreate {
  name: string;
  description?: string | null;
  conversation_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TripUpdate {
  name?: string;
  description?: string | null;
  conversation_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseTripReturn {
  // Queries
  trips: Trip[] | undefined;
  isLoadingTrips: boolean;
  tripsError: Error | null;
  getTrip: (tripId: number) => UseQueryResult<Trip, Error>;
  getTrips: () => Promise<Trip[]>;

  // Mutations
  createTrip: (name: string, conversationId?: number, description?: string) => Promise<Trip>;
  deleteTrip: (tripId: number) => Promise<void>;
  updateTrip: (tripId: number, updates: Partial<TripUpdate>) => Promise<Trip>;
  setTripDate: (tripId: number, start: Date | string, end: Date | string) => Promise<Trip>;

  // Mutation states
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useTrip = (): UseTripReturn => {
  const queryClient = useQueryClient();

  // 🔍 Fetch all trips
  const tripsQuery = useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await api.get<Trip[]>("/trips/getTrips");
      return res.data;
    },
  });

  // 🔍 Fetch single trip
  const getTripQuery = (tripId: number): UseQueryResult<Trip, Error> =>
    useQuery<Trip, Error>({
      queryKey: ["trip", tripId],
      queryFn: async () => {
        const res = await api.get<Trip>(`/trips/${tripId}`);
        return res.data;
      },
      enabled: !!tripId,
    });

  // ✏️ Create trip mutation
  const createTripMutation = useMutation<Trip, Error, TripCreate>({
    mutationFn: async (tripData) => {
      const res = await api.post<Trip>("/trips/create", {
        name: tripData.name,
        conversation_id: tripData.conversation_id,
        description: tripData.description,
      });
      return res.data;
    },
    onSuccess: (newTrip) => {
      queryClient.setQueryData<Trip[]>(["trips"], (old) => [...(old || []), newTrip]);
    },
  });

  // 🗑️ Delete trip mutation
  const deleteTripMutation = useMutation<void, Error, number>({
    mutationFn: async (tripId) => {
      await api.delete(`/trips/${tripId}`);
    },
    onSuccess: (_, tripId) => {
      queryClient.setQueryData<Trip[]>(["trips"], (old) =>
        old?.filter((t) => t.id !== tripId)
      );
      queryClient.removeQueries({ queryKey: ["trip", tripId] });
    },
  });

  // ✏️ Update trip mutation
  const updateTripMutation = useMutation<Trip, Error, { tripId: number; updates: Partial<TripUpdate> }>({
    mutationFn: async ({ tripId, updates }) => {
      const oldTripRes = await api.get<Trip>(`/trips/${tripId}`);
      const oldTrip = oldTripRes.data;

      const payload: Trip = {
        id: oldTrip.id,
        name: updates.name ?? oldTrip.name,
        description: updates.description ?? oldTrip.description,
        user_id: oldTrip.user_id,
        conversation_id: updates.conversation_id ?? oldTrip.conversation_id,
        start_date: updates.start_date ?? oldTrip.start_date,
        end_date: updates.end_date ?? oldTrip.end_date,
      };

      const res = await api.put<Trip>(`/trips/${tripId}`, payload);
      return res.data;
    },
    onSuccess: (updatedTrip, { tripId }) => {
      queryClient.setQueryData<Trip>(["trip", tripId], updatedTrip);
      queryClient.setQueryData<Trip[]>(["trips"], (old) =>
        old?.map((t) => (t.id === tripId ? updatedTrip : t))
      );
    },
  });

  // 📅 Set trip dates helper
  const setTripDate = async (tripId: number, start: Date | string, end: Date | string): Promise<Trip> => {
    const startStr = typeof start === "string" ? start : start.toISOString();
    const endStr = typeof end === "string" ? end : end.toISOString();

    return updateTripMutation.mutateAsync({
      tripId,
      updates: { start_date: startStr, end_date: endStr },
    });
  };

  const getTrips = async (): Promise<Trip[]> => {
    return queryClient.fetchQuery<Trip[]>({
      queryKey: ["trips"],
      queryFn: async () => {
        const res = await api.get<Trip[]>("/trips/getTrips");
        return res.data;
      },
    });
  };

  return {
    // Queries
    trips: tripsQuery.data,
    isLoadingTrips: tripsQuery.isLoading,
    tripsError: tripsQuery.error,
    getTrip: getTripQuery,
    getTrips,

    // Mutations
    createTrip: (name, conversationId, description) =>
      createTripMutation.mutateAsync({ name, conversation_id: conversationId, description }),
    deleteTrip: (tripId) => deleteTripMutation.mutateAsync(tripId),
    updateTrip: (tripId, updates) =>
      updateTripMutation.mutateAsync({ tripId, updates }),
    setTripDate,

    // Loading/Error states for mutations
    isCreating: createTripMutation.isPending,
    isDeleting: deleteTripMutation.isPending,
    isUpdating: updateTripMutation.isPending,
  };
};