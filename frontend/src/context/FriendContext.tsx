import {createContext, useContext } from "react";
import { Friend } from "../types/types";

export const FriendContext = createContext({
    friends: [] as Friend[],
    getFriends: async () => {},
    getUsername: async (userId: number): Promise<string> => Promise.resolve(""),
    addFriend: async (userId: number) => {},
    removeFriend: async (userId: number) => {},
});
export const useFriend = () => useContext(FriendContext);