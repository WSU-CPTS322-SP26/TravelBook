import {createContext, useContext } from "react";
import { Friend, SuggestedFriend } from "../types/types";

export const FriendContext = createContext({
    friends: [] as Friend[],
    getFriends: async () => {},
    getUsername: async (userId: number): Promise<string> => Promise.resolve(""),
    getName: async (userId: number): Promise<string> => Promise.resolve(""),
    addFriend: async (userId: number) => {},
    removeFriend: async (userId: number) => {},
    getSuggestedFriends: async (limit?: number): Promise<SuggestedFriend[]> => Promise.resolve([]),
});
export const useFriend = () => useContext(FriendContext);