import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import api from "../api";
import { Friend, SuggestedFriend } from "../types/types";

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseFriendReturn {
  // Queries
  friends: Friend[] | undefined;
  isLoadingFriends: boolean;
  friendsError: Error | null;
  getUsername: (userId: number) => UseQueryResult<string, Error>;
  getName: (userId: number) => UseQueryResult<string, Error>;
  getSuggestedFriends: (limit?: number) => UseQueryResult<SuggestedFriend[], Error>;

  // Mutations
  addFriend: (userId: number) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
  refetchFriends: () => Promise<void>;

  // Mutation states
  isAddingFriend: boolean;
  isRemovingFriend: boolean;
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

  // 🔍 Fetch username for a specific user
  const getUsernameQuery = (userId: number): UseQueryResult<string, Error> =>
    useQuery<string, Error>({
      queryKey: ["username", userId],
      queryFn: async () => {
        const res = await api.get<string>(`/friends/getUsername/${userId}`);
        return res.data;
      },
      enabled: !!userId,
    });

  // 🔍 Fetch name for a specific user
  const getNameQuery = (userId: number): UseQueryResult<string, Error> =>
    useQuery<string, Error>({
      queryKey: ["name", userId],
      queryFn: async () => {
        const res = await api.get<string>(`/friends/getName/${userId}`);
        return res.data;
      },
      enabled: !!userId,
    });

  // 🔍 Fetch suggested friends
  const getSuggestedFriendsQuery = (limit?: number): UseQueryResult<SuggestedFriend[], Error> =>
    useQuery<SuggestedFriend[], Error>({
      queryKey: ["suggestedFriends", limit],
      queryFn: async () => {
        const params = limit ? { limit } : {};
        const res = await api.get<SuggestedFriend[]>("/friends/getSuggestedFriends", { params });
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
    getUsername: getUsernameQuery,
    getName: getNameQuery,
    getSuggestedFriends: getSuggestedFriendsQuery,

    // Mutations
    addFriend: (userId) => addFriendMutation.mutateAsync(userId),
    removeFriend: (userId) => removeFriendMutation.mutateAsync(userId),
    refetchFriends,

    // Loading/Error states for mutations
    isAddingFriend: addFriendMutation.isPending,
    isRemovingFriend: removeFriendMutation.isPending,
  };
};
