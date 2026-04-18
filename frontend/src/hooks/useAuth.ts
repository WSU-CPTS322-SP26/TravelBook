import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { User } from "../types/types";

// ════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

// ════════════════════════════════════════════════════════
// RETURN TYPE
// ════════════════════════════════════════════════════════

export interface UseAuthReturn {
  // Queries
  user: User | undefined;
  isLoadingUser: boolean;
  userError: Error | null;
  isAuthReady: boolean;

  // Mutations
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Mutation states
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
}

// ════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ════════════════════════════════════════════════════════

export const useAuth = (): UseAuthReturn => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  // 🔍 Fetch current user
  const currentUserQuery = useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get<User>("/auth/me");
      return res.data;
    },
    enabled: !!token,
    retry: false,
  });

  // 🔐 Login mutation
  const loginMutation = useMutation<void, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const params = new URLSearchParams();
      params.append("username", credentials.username);
      params.append("password", credentials.password);
      
      const tokenRes = await api.post<{ access_token: string }>("/auth/token", params);
      const newToken = tokenRes.data.access_token;
      
      // Set token in localStorage and API headers
      localStorage.setItem("token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    },
    onSuccess: () => {
      // Fetch current user after successful login
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // 📝 Register mutation
  const registerMutation = useMutation<void, Error, RegisterData>({
    mutationFn: async (data) => {
      // Register the user
      await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password,
      });

      // Auto-login after registration
      const params = new URLSearchParams();
      params.append("username", data.username);
      params.append("password", data.password);
      
      const tokenRes = await api.post<{ access_token: string }>("/auth/token", params);
      const newToken = tokenRes.data.access_token;
      
      // Set token in localStorage and API headers
      localStorage.setItem("token", newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    },
    onSuccess: () => {
      // Fetch current user after successful registration
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  // 🚪 Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // Clear token from localStorage and API headers
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      api.interceptors.request.clear();
    },
    onSuccess: () => {
      // Clear current user cache
      queryClient.setQueryData(["currentUser"], null);
      queryClient.removeQueries({ queryKey: ["currentUser"] });
    },
  });

  return {
    // Queries
    user: currentUserQuery.data,
    isLoadingUser: currentUserQuery.isLoading,
    userError: currentUserQuery.error,
    isAuthReady: !currentUserQuery.isLoading,

    // Mutations
    login: (username, password) =>
      loginMutation.mutateAsync({ username, password }),
    register: (name, username, email, password) =>
      registerMutation.mutateAsync({ name, username, email, password }),
    logout: () => logoutMutation.mutateAsync(),

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
