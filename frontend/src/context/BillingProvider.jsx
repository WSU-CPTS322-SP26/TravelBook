import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext"
import {BillingContext} from './BillingContext'
import api from "../api";

export function BillingProvider({ children }) {
    const [subscription, setSubscription] = useState(null);
    const { token } = useAuth();

  
    const getSubscription = async () => {
        const res = await api.get("billing/get_current");
        setSubscription(res.data);
        return res.data;
    };

    const createSubscription = async (subscriptionData) => {
        const res = await api.post("billing/subscribe", subscriptionData);
        setSubscription(res.data);
        return res.data;
    };

    const updateSubscription = async (subscriptionData) => {
        if(!subscription){
            createSubscription(subscriptionData); 
            return;
        } 
        const res = await api.put("billing/update", subscriptionData);
        setSubscription(res.data);
        return res.data;
    };

    const deleteSubscription = async () =>{
        if(!subscription) return;
        const res = await api.delete("billing/delete");
        setSubscription(null);
        return res;

    }

    useEffect(() => {
        if (!token) return;
        getSubscription().catch(() => setSubscription(null));
    }, [token]);

    return (
        <BillingContext.Provider value={{ subscription, getSubscription, createSubscription, updateSubscription, deleteSubscription }}>
            {children}
        </BillingContext.Provider>
    );
}

export default BillingProvider;