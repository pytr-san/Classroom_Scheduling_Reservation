import { createContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children, handlelogout }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);
   
    
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const user = JSON.parse(localStorage.getItem("user"));
        const role = localStorage.getItem("role");

        if (token && user && role) {
            setAuth({ token, user, role });
        }
        setLoading(false);

    }, []);
 
    if (loading) {
        return <div>Loading...</div>; 
    }

    return (
        <AuthContext.Provider  value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;