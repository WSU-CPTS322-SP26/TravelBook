import { useState } from "react";
import {AuthContext} from './AuthContext'
import api from "../api";


function AuthProvider ({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    
    const generateAccessToken = async(username, password) => {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);
        let res = await api.post("/auth/token", params);
        setToken(res.data.access_token);
        api.interceptors.request.use((config)=>{
            config.headers.Authorization=`Bearer ${res.data.access_token}`;
            return config;
        });
    }

    const login = async (username, password) => {
        setUser(username);
        try{
            await generateAccessToken(username, password);
            setUser({ name: username});
        } catch(err){
            console.log(err, "Attempting registration...");
            register(username, password); // TODO: it should not be done here...
        }
        localStorage.setItem("token", token);
    };

    const register = async(username, password) => {
        try{
            const params = {email: username, username:username, password:password};
            await api.post("/auth/register", params).then( async ()=>{ await generateAccessToken(username, password) } );
            setUser({ name: username} );
        } catch(err){
            console.log(err)
        }
    }
    
    const logout = () => {
        setUser(null);
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