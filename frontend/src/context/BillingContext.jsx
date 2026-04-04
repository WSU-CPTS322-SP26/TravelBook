import { createContext, useContext } from "react";


export const BillingContext = createContext();
export const useBilling = () => useContext(BillingContext);