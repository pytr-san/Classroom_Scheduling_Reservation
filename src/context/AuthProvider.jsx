import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);
    
    // useEffect(() => {

    //     const refreshToken = async () => {
    //         try {
    //             // Only refresh the token if there's no valid token or user in the state
    //             const res = await axios.get('http://localhost:8000/auth/refresh', { withCredentials: true });
    //         if (newToken) {
    //                 // If the refresh was successful, update the auth state with the new token
    //                 console.log("New Token:", newToken);  // Log the new token
    //                 console.log("User Info:", user);     
    //                 setAuth(prevState => ({
    //                     ...prevState,
    //                     user,
    //                     token: newToken, // Update access token
    //                 }));
    //             }
    //         } catch (err) {
    //             console.log("No active session, user is logged out", err);
    //             setAuth({});
    //         } finally {
    //             setLoading(false); // Set loading to false after the request completes
    //         }
    //     };

    //     // If there's no user or token, try to refresh the session
    //     if (!auth.user && !auth.token) {
    //         refreshToken();
    //     } else {
    //         setLoading(false); // If user and token exist, no need to refresh
    //     }
    // }, [auth.user, auth.token]); // Dependency array ensures refresh happens if auth state changes

    // if (loading) {
    //     return <div>Loading...</div>; // Show loading until authentication state is resolved
    // }

    return (
        <AuthContext.Provider  value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;