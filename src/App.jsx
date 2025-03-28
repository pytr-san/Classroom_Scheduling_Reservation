
import Navbar from "./components/Navbar.jsx";
import Home from "./Pages/Home/Home.jsx";
import Classroom from "./Pages/Classroom/Classroom.jsx";
import Header from "./components/Header.jsx";
import Course from "./Pages/Course/Course.jsx";
import Settings from "./Pages/Settings/Settings.jsx";
import Register from "./Pages/Register.jsx";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect} from "react"; // ✅ Moved `useContext` here
import Login from "./Pages/Login.jsx";
import ManageCourse from "./Pages/Course/ManageCourse.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";
import AuthContext from "./context/AuthProvider";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import useAuth from "./Hooks/useAuth.jsx";
import { useCallback } from "react";
    const ROLES ={
        'student': "student",
        'admin': "admin",
        'faculty': "faculty"
    }

    function App() {

       // const [isAuthenticated, setIsAuthenticated] = useState(false);
      //  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
     
        // const { auth ,setAuth} = useAuth();
        // const navigate = useNavigate();

        // const [loading, setLoading] = useState(true);  // ✅ Added Loading State
        // //const [user, setUser] = useState(null);
    
        //     // ✅ Verify token on page load
        //     const verifyToken = useCallback(async () => {
        //         try {
        //             const response = await axios.get("http://localhost:8000/auth/verify-token", { withCredentials: true });
            
        //             if (response.data.valid && response.data.user) {
        //                 setAuth((prev) => {
        //                     // Only update if different
        //                     if (prev.token !== response.data.token) {
        //                         return {
        //                             user: response.data.user,
        //                             token: response.data.token,
        //                             role: response.data.user.role 
        //                         };
        //                     }
        //                     return prev;
        //                 });
        //             }
        //         } catch (error) {
        //             console.error("Token verification failed:", error.message);
        //         }
        //         setLoading(false);
        //     }, [setAuth]);
            
        
        //     useEffect(() => {
        //         let isMounted = true; // ✅ Prevent setting state if unmounted

        //         const checkAuth = async () => {
        //             await verifyToken();
        //         };

        //         checkAuth();

        //         return () => { isMounted = false }; // ✅ Cleanup
        //     }, [verifyToken]);
                

  

        // if (loading) {
        //     return <div>Loading...</div>; // Prevents flicker while checking auth
        // }

        return(
            <Routes>

                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path ="/" element={<Layout />}>
                    {/* Protected Routes (With Layout) */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin, ROLES.student, ROLES.faculty]} />}> 
                            <Route path="/" element={<Home />} />
                            <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Admin-Only Routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
                            <Route path="/classroom" element={<Classroom />} />
                            <Route path="/course" element={<Course />} />
                            <Route path="/course/:id/manage" element={<ManageCourse />} />         
                    </Route>
                </Route>
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        )
    }

    export default App