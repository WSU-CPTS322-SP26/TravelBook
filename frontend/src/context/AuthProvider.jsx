import { useState } from "react";
import {AuthContext} from './AuthContext'
import api from "../api";


function AuthProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    
    const generateAccessToken = async(username, password) => {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        let res = await api.post("/auth/token", params);
        setToken(res.data.access_token);
        api.interceptors.request.use((config)=>{
            config.headers.Authorization=`Bearer ${res.data.access_token}`;
            setToken(res.data.access_token);
            return config;
        });
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
        api.interceptors.request.clear();
    };

    const currentUser = () => {
        
    }
    
    return (
    <AuthContext.Provider value={{ user, token, login, register, logout, currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;