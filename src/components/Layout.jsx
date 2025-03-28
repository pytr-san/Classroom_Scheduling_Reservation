import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Header from "./Header";
import {useState } from "react";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Layout = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8000/auth/logout", { withCredentials: true });

            setAuth({});  // ✅ Clear auth state
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
                    <Header toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
                    <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
                </>


            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
