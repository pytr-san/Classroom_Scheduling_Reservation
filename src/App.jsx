
import Navbar from "./components/Navbar.jsx";
import Home from "./Pages/Home/Home.jsx"
import Classroom from "./Pages/Classroom/Classroom.jsx"
import Header from "./components/Header.jsx";
import Course from "./Pages/Course/Course.jsx"
import Settings from "./Pages/Settings/Settings.jsx"
import Register from "./Pages/Register.jsx"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./Pages/Login.jsx";
import ManageCourse from "./Pages/Course/ManageCourse.jsx";
import ErrorBoundary from "./components/ErrorBoundary"  
import axios from "axios";


// //axios.defaults.baseURL ='http://localhost:8000'
// axios.defaults.withCredentials = true

function App() {

    // Load authentication state from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem("isAuthenticated") === "true"  
    );  
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Update localStorage when authentication state changes
    useEffect(() => {
        localStorage.setItem("isAuthenticated", isAuthenticated.toString());
    }, [isAuthenticated]);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
      };
      
      const handleLogout = () => {
                const confirmLogout = window.confirm("Are you sure you want to log out?");
        
        if (confirmLogout) {
            localStorage.removeItem("isAuthenticated"); // Remove from local storage
            localStorage.removeItem("token"); // Remove JWT token if stored
            setIsAuthenticated(false); // Update state
      }
    };
    return(
        <>
        <div className="app-container">
        {/* Show Navbar & Sidebar only if user is authenticated */}
            {isAuthenticated && (
            <>
                <Header toggleSidebar= {toggleSidebar} />
                <Navbar isSidebarOpen= {isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} className="navbar" />
            </>
            )}

            <div className="main-content">
            <Routes>
                
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={setIsAuthenticated} />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/" /> : <Register setAuth={setIsAuthenticated} />}
                />

                {/* Private Routes */}
                {isAuthenticated ? (
                    <>
                        <Route path="/" element={<Home />} />
                        <Route path="/classroom" element={<Classroom />} />
                        <Route path="/course" element={<Course />} />
                        <Route path="/course/:id/ManageCourse" element={<ManageCourse />} />
                        <Route path="/settings" element={<Settings />} />
                    </>
                ) : (
                    <Route path="*" element={<Navigate to="/login" />} />
                )}
            </Routes>
            </div>
        </div>
        </>
    )
}

export default App