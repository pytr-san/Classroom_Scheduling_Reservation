import { createContext, useState, useEffect } from "react";
import axios from "axios";
import  axiosInstance  from './../axios.jsx';

const AuthContext = createContext({});

export const AuthProvider = ({ children, handlelogout }) => {
    const [auth, setAuth] = useState({});
    const [loading, setLoading] = useState(true);
   
    
    useEffect(() => {
        //on refresh reload the user session
        const token = localStorage.getItem("accessToken");
        const user = JSON.parse(localStorage.getItem("user"));
        const role = localStorage.getItem("role");

        if (token && user && role) {
            setAuth({ token, user, role });
        }
        setLoading(false);

        // Axios response interceptor
        // const responseInterceptor = axios.interceptors.response.use(
        //     response => response,
        //     error => {
        //         if (error.response && error.response.status === 401) {
        //             console.log("⛔ Access token expired, logging out...");
        //             if (typeof handlelogout === "function") {
        //                 handlelogout(); // use the passed prop function
        //             }
        //         }
        //         return Promise.reject(error);
        //     }
        // );
        // return () => {
        //     axios.interceptors.response.eject(responseInterceptor); // Cleanup on unmount
        // };

    }, []);
    // useEffect(() => {

    //     const refreshToken = async () => {
    //         try {
    //             // Only refresh the token if there's no valid token or user in the state
    //             const res = await axiosInstance.get('/auth/refresh');
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

    if (loading) {
        return <div>Loading...</div>; // Show loading until authentication state is resolved
    }

    return (
        <AuthContext.Provider  value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;