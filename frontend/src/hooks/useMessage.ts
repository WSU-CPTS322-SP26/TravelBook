import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import api from "../api";
import { Conversation, User } from "../types/types";

// ════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════

export interface MessageCreate {
  content: string;
  conversation_id: number;
  receiver_user_id?: number | null;
}

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseMessageReturn {
  // Queries
  conversations: Conversation[] | undefined;
  isLoadingConversations: boolean;
  conversationsError: Error | null;
  getConversation: (conversationId: number | null | undefined) => UseQueryResult<Conversation, Error>;

  // Mutations
  sendMessage: (msgContent: string, conversationId: number, receiver?: number) => Promise<void>;
  createConversation: () => Promise<number>;
  addConversationParticipant: (conversationId: number, userId: number) => Promise<Conversation>;

  // Mutation states
  isSendingMessage: boolean;
  isCreatingConversation: boolean;
  isAddingParticipant: boolean;

  // Utilities
  resolveAuthor: (message: any, conversationUsers: User[]) => string;
  getConversationName: (conversation: Conversation, currentUser: User) => string;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useMessage = (): UseMessageReturn => {
  const queryClient = useQueryClient();

  // 🔍 Fetch all conversations
  const conversationsQuery = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<Conversation[]>("/messages/conversations");
      return res.data;
    },
  });

  // 🔍 Fetch single conversation
  const getConversation = (conversationId: number | null | undefined): UseQueryResult<Conversation, Error> => {
    return useQuery<Conversation, Error>({
      queryKey: ["conversation", conversationId],
      queryFn: async () => {
        const res = await api.get<Conversation>(`/messages/conversations/${conversationId}`);
        return res.data;
      },
      enabled: !!conversationId,
    });
  };

  // 💬 Send message mutation
  const sendMessageMutation = useMutation<void, Error, MessageCreate>({
    mutationFn: async (messageData) => {
      await api.post("/messages/send", {
        conversation_id: messageData.conversation_id,
        content: messageData.content,
        receiver_user_id: messageData.receiver_user_id,
      });
    },
    onSuccess: (_, messageData) => {
      // Invalidate conversation to refresh message list
      queryClient.invalidateQueries({ queryKey: ["conversation", messageData.conversation_id] });
    },
  });

  // ➕ Create conversation mutation
  const createConversationMutation = useMutation<number, Error, void>({
    mutationFn: async () => {
      const res = await api.post<{ id: number }>("/messages/conversations", {});
      return res.data.id;
    },
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // 👥 Add participant mutation
  const addParticipantMutation = useMutation<Conversation, Error, { conversationId: number; userId: number }>({
    mutationFn: async ({ conversationId, userId }) => {
      const res = await api.post<Conversation>(
        `/messages/conversations/${conversationId}/participants/${userId}`
      );
      return res.data;
    },
    onSuccess: (updatedConversation, { conversationId }) => {
      // Update conversation cache
      queryClient.setQueryData<Conversation>(["conversation", conversationId], updatedConversation);
      // Invalidate conversations list
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // ════════════════════════════════════════════════════════
  // UTILITY FUNCTIONS
  // ════════════════════════════════════════════════════════

  const resolveAuthor = (message: any, conversationUsers: User[] = []): string => {
    const senderId = message?.sender_user_id ?? message?.sender_id;
    const userMap: Record<number, string> = {};
    (conversationUsers || []).forEach((u) => {
      userMap[u.id] = u.username;
    });
    const mappedAuthor = userMap[senderId];
    const incomingAuthor = message?.author;
    const isGenericIncoming =
      typeof incomingAuthor === "string" && /^User\s+\d+$/i.test(incomingAuthor.trim());

    return mappedAuthor ?? (!isGenericIncoming ? incomingAuthor : undefined) ?? `User ${senderId}`;
  };

  const getConversationName = (conversation: Conversation | null, currentUser: User | null): string => {
    if (!conversation) return "Conversation";
    if (conversation.is_group) {
      const explicitName = conversation.name?.trim();
      if (explicitName) return explicitName;

      const participantNames = (conversation.users || [])
        .map((participant) => participant.username?.trim() || `User ${participant.id}`)
        .filter(Boolean);

      return participantNames.length > 0
        ? participantNames.join(", ")
        : `Conversation ${conversation.id}`;
    }
    const otherUser = (conversation.users || []).find(
      (participant) => participant.id !== currentUser?.id
    );
    return otherUser?.username ?? `Conversation ${conversation.id}`;
  };

  return {
    // Queries
    conversations: conversationsQuery.data,
    isLoadingConversations: conversationsQuery.isLoading,
    conversationsError: conversationsQuery.error,
    getConversation,

    // Mutations
    sendMessage: (msgContent, conversationId, receiver) =>
      sendMessageMutation.mutateAsync({
        content: msgContent,
        conversation_id: conversationId,
        receiver_user_id: receiver,
      }),
    createConversation: () => createConversationMutation.mutateAsync(),
    addConversationParticipant: (conversationId, userId) =>
      addParticipantMutation.mutateAsync({ conversationId, userId }),

    // Loading/Error states for mutations
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingConversation: createConversationMutation.isPending,
    isAddingParticipant: addParticipantMutation.isPending,

    // Utilities
    resolveAuthor,
    getConversationName,
  };
};
