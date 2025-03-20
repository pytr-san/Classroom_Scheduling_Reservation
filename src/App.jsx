
import Navbar from "./components/Navbar.jsx";
import Home from "./Pages/Home/Home.jsx"
import Classroom from "./Pages/Classroom/Classroom.jsx"
import Header from "./components/Header.jsx";
import Course from "./Pages/Course/Course.jsx"
import Settings from "./Pages/Settings/Settings.jsx"
import Register from "./Pages/Register.jsx"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./Pages/Login.jsx";
import axios from "axios";


axios.defaults.baseURL ='http://localhost:8000'
axios.defaults.withCredentials = true

function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle state

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
      };
    
    return(
        <>
        <div className="app-container">
        {/* Show Navbar & Sidebar only if user is authenticated */}
            {isAuthenticated && (
            <>
                <Header toggleSidebar= {toggleSidebar} />
                <Navbar isSidebarOpen= {isSidebarOpen} className="navbar" />
            </>
            )}

            <div className="main-content">
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" /> : <Login setAuth={() => { 
                        setIsAuthenticated(true); 
                        setIsSidebarOpen(true);}} />}
                />
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/" /> : <Register setAuth={() => {                        
                        setIsAuthenticated(true); 
                        setIsSidebarOpen(true);}} />}
                />

                {/* Private Routes */}
                {isAuthenticated ? (
                    <>
                        <Route path="/" element={<Home />} />
                        <Route path="/classroom" element={<Classroom />} />
                        <Route path="/course" element={<Course />} />
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