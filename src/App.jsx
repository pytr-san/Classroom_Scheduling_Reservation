
import Home from "./Pages/Home/Home.jsx";
import Classroom from "./Pages/Classroom/Classroom.jsx";
import Course from "./Pages/Course/Course.jsx";
import Settings from "./Pages/Settings/Settings.jsx";
import Register from "./Pages/Register.jsx";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./Pages/Login.jsx";
import ManageCourse from "./Pages/Course/ManageCourse.jsx";
//import ErrorBoundary from "./components/ErrorBoundary";
import axios from "axios";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth.jsx";
import UnauthorizedPage from "./Unauthorized.jsx";
import AdminAccess from "./components/AdminAccess.jsx"
import ClassSchedule from "./Pages/Home/ClassScheduleTemp.jsx"
import NewStudent from "./Pages/NewStudentPage.jsx";
    const ROLES ={
        student: "student",
        admin: "admin",
        faculty: "faculty"
    }
    axios.defaults.withCredentials = true;

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
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* <Route path="/admin-access" element={<AdminAccess />} /> */}
                
                <Route path ="/" element={<Layout />}>
                    {/* Protected Routes (With Layout) */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin, ROLES.student, ROLES.faculty]} />}> 
                            <Route path="/" element={<Home />} />
                            <Route path="/newstudent" element={<NewStudent />} />
                            <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Admin-Only Routes */}
                    <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
                            <Route path="/class-schedule/:course/:year/:section" element={<ClassSchedule />} />
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