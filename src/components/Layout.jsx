import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import {useState } from "react";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import  axiosInstance  from './../axios.jsx';

const Layout = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/auth/logout");
            sessionStorage.removeItem("adminAccess"); 
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            
            setAuth(null);  // ✅ Clear auth state
            navigate("/login");  // Redirect to login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };


    return (
        <div className="app-container">
            <>
                {/* Ensure auth is available before passing to Header */}
                {auth && (
                <>
                    <Header toggleSidebar={toggleSidebar} user={auth.user} handleLogout={handleLogout} />
                    <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
                </>
                )}
            </>

            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
