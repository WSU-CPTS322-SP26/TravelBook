import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";

// ════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════

export interface Subscription {
  id: number;
  user_id: number;
  tier: number;
  monthly: boolean;
  price: number;
  start_date: string;
}

export interface SubscriptionCreate {
  tier: number;
  monthly: boolean;
  price: number;
  start_date: string;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useBilling = () => {
  const queryClient = useQueryClient();

  // 🔍 Fetch current subscription
  const subscriptionQuery = useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      try {
        const res = await api.get<Subscription>("billing/get_current");
        return res.data;
      } catch {
        return null; // 404 means no subscription
      }
    },
  });

  // ✏️ Create subscription
  const createMutation = useMutation<Subscription, Error, SubscriptionCreate>({
    mutationFn: async (data) => {
      const res = await api.post<Subscription>("billing/subscribe", data);
      return res.data;
    },
    onSuccess: (newSub) => {
      queryClient.setQueryData<Subscription>(["subscription"], newSub);
    },
  });

  // ✏️ Update subscription (creates if doesn't exist)
  const updateMutation = useMutation<Subscription, Error, SubscriptionCreate>({
    mutationFn: async (data) => {
      const current = queryClient.getQueryData<Subscription>(["subscription"]);
      if (!current) {
        const res = await api.post<Subscription>("billing/subscribe", data);
        return res.data;
      }
      const res = await api.put<Subscription>("billing/update", data);
      return res.data;
    },
    onSuccess: (updatedSub) => {
      queryClient.setQueryData<Subscription>(["subscription"], updatedSub);
    },
  });

  // 🗑️ Delete subscription
  const deleteMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.delete("billing/delete");
    },
    onSuccess: () => {
      queryClient.setQueryData(["subscription"], null);
    },
  });

  return {
    // Query
    subscription: subscriptionQuery.data ?? null,
    isLoadingSubscription: subscriptionQuery.isLoading,
    subscriptionError: subscriptionQuery.error,

    // Mutations
    createSubscription: (data: SubscriptionCreate) => createMutation.mutateAsync(data),
    updateSubscription: (data: SubscriptionCreate) => updateMutation.mutateAsync(data),
    deleteSubscription: () => deleteMutation.mutateAsync(),

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};