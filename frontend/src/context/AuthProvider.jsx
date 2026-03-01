import { useState, useEffect } from "react";
import {AuthContext} from './AuthContext'
import api from "../api";


function AuthProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token")); 

    // log back in if token exists and valid
    useEffect(() => {
        if (!token) return;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`; 
        api.get("/auth/me").then(res => setUser(res.data)).catch(() => {
            setToken(null);
            localStorage.removeItem("token");
        });
    }, []);

    const generateAccessToken = async(username, password) => {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        let res = await api.post("/auth/token", params);
        const newToken = res.data.access_token;
        setToken(newToken);
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    }

    const login = async (username, password) => {
        setUser(username);
        try{
            await generateAccessToken(username, password);
            setUser((await api.get("/auth/me")).data);
        } catch(err){
            console.log(err, "Attempting registration...");
            register(username, password); // TODO: it should not be done here...
        }
    };

    const register = async(username, password) => {
        try{
            const params = {email: username, username:username, password:password};
            await api.post("/auth/register", params).then( async ()=>{ await generateAccessToken(username, password) } );
            setUser((await api.get("/auth/me")).data );
        } catch(err){
            console.log(err)
        }
    }
    
    const logout = () => {
        setUser(null);  
        setToken(null);
        localStorage.removeItem("token")
        api.interceptors.request.clear();
    };

    const currentUser = async () => {
        return await api.get("/auth/me");
    }
    
    return (
    <AuthContext.Provider value={{ user, token, login, register, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;