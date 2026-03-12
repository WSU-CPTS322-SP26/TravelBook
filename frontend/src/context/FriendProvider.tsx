import { FriendContext } from "./FriendContext";
import { useState } from "react";
import { Friend } from "../types/types";
import api from "../api";

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const [friends, setFriends] = useState<Friend[]>([]);

    const getFriends = async () => {
        try {
            const response = await api.get("/friends/getFriends");
            setFriends(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching friends:", error);
            return [];
        }
    };

    const getUsername = async (userId: number): Promise<string> => {
        try {
            const response = await api.get(`/friends/getUsername/${userId}`);
            console.log(`Fetched username for userId ${userId}: ${response.data}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching username:", error);
            return "Unknown User";
        }
    };

    const addFriend = async (userId: number) => {
        try {
            await api.post(`/friends/addFriend/${userId}`);
            await getFriends(); // Refresh friend list after adding
        } catch (error) {
            console.error("Error adding friend:", error);
        }
    };

    const removeFriend = async (userId: number) => {
        try {
            await api.delete(`/friends/removeFriend/${userId}`);
            await getFriends(); // Refresh friend list after removing
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    return (
        <FriendContext.Provider value={{ friends, getFriends, getUsername, addFriend, removeFriend }}>
            {children}
        </FriendContext.Provider>
    );
}

export default FriendProvider;