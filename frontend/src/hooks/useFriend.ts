import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import api from "../api";
import { Friend, SuggestedFriend } from "../types/types";

// ════════════════════════════════════════════════════════
// HOOK: Get User Name
// ════════════════════════════════════════════════════════

export const useUserName = (userId: number | undefined | null): UseQueryResult<string, Error> => {
  return useQuery<string, Error>({
    queryKey: ["userName", userId],
    queryFn: async () => {
      const res = await api.get<string>(`/friends/getName/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};

// ════════════════════════════════════════════════════════
// HOOK: Get User Username
// ════════════════════════════════════════════════════════

export const useUserUsername = (userId: number | undefined | null): UseQueryResult<string, Error> => {
  return useQuery<string, Error>({
    queryKey: ["userName", userId],
    queryFn: async () => {
      const res = await api.get<string>(`/friends/getUsername/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
};

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseFriendReturn {
  // Queries
  friends: Friend[] | undefined;
  isLoadingFriends: boolean;
  friendsError: Error | null;
  suggestedFriends: SuggestedFriend[] | undefined;
  isLoadingSuggestedFriends: boolean;
  suggestedFriendsError: Error | null;

  // Mutations
  addFriend: (userId: number) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
  sendFriendRequest: (userId: number) => Promise<void>;
  refetchFriends: () => Promise<void>;

  // Mutation states
  isAddingFriend: boolean;
  isRemovingFriend: boolean;
  isSendingRequest: boolean;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useFriend = (): UseFriendReturn => {
  const queryClient = useQueryClient();

  // 🔍 Fetch all friends
  const friendsQuery = useQuery<Friend[]>({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await api.get<Friend[]>("/friends/getFriends");
      return res.data;
    },
  });

  // 🔍 Fetch suggested friends (default limit 5)
  const suggestedFriendsQuery = useQuery<SuggestedFriend[], Error>({
    queryKey: ["suggestedFriends"],
    queryFn: async () => {
      const res = await api.get<SuggestedFriend[]>("/friends/getSuggestedFriends", { 
        params: { limit: 5 } 
      });
      return res.data;
    },
  });

  // ➕ Add friend mutation
  const addFriendMutation = useMutation<void, Error, number>({
    mutationFn: async (userId) => {
      await api.post(`/friends/addFriend/${userId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch friends list
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      // Invalidate suggested friends since they may have changed
      queryClient.invalidateQueries({ queryKey: ["suggestedFriends"] });
    },
  });

  // 📨 Send friend request mutation
  const sendFriendRequestMutation = useMutation<void, Error, number>({
    mutationFn: async (userId) => {
      await api.post(`/friends/sendFriendRequest/${userId}`);
    },
    onSuccess: () => {
      // Invalidate suggested friends since sending a request removes them from suggestions
      queryClient.invalidateQueries({ queryKey: ["suggestedFriends"] });
    },
  });

  // ➖ Remove friend mutation
  const removeFriendMutation = useMutation<void, Error, number>({
    mutationFn: async (userId) => {
      await api.delete(`/friends/removeFriend/${userId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch friends list
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      // Invalidate suggested friends since they may have changed
      queryClient.invalidateQueries({ queryKey: ["suggestedFriends"] });
    },
  });

  // 🔄 Manual refetch for friends
  const refetchFriends = async (): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: ["friends"] });
  };

  return {
    // Queries
    friends: friendsQuery.data,
    isLoadingFriends: friendsQuery.isLoading,
    friendsError: friendsQuery.error,
    suggestedFriends: suggestedFriendsQuery.data,
    isLoadingSuggestedFriends: suggestedFriendsQuery.isLoading,
    suggestedFriendsError: suggestedFriendsQuery.error,

    // Mutations
    addFriend: (userId) => addFriendMutation.mutateAsync(userId),
    removeFriend: (userId) => removeFriendMutation.mutateAsync(userId),
    sendFriendRequest: (userId) => sendFriendRequestMutation.mutateAsync(userId),
    refetchFriends,

    // Loading/Error states for mutations
    isAddingFriend: addFriendMutation.isPending,
    isRemovingFriend: removeFriendMutation.isPending,
    isSendingRequest: sendFriendRequestMutation.isPending,
  };
};
