import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import "./settings.css"
import  axiosInstance  from '../../axios.jsx';
import AdminAccess from "../../components/AdminAccess";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AdminRegister from "./AdminRegister.jsx";

const Settings = () => {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();
    const [hasAdminAccess, setHasAdminAccess] = useState(
        sessionStorage.getItem("adminAccess") === "granted"
    );

    const onAccessGranted = () => {
        sessionStorage.setItem("adminAccess", "granted"); // ✅ Store in session
        setHasAdminAccess(true); // ✅ Update state
    };

    useEffect(() => {
        if (sessionStorage.getItem("adminAccess") === "granted") {
            setHasAdminAccess(true);
        }
    }, [auth]);


    const handlePasswordChange = () => {
        const path = "/user/change-password";
        navigate(path);
    };
    const handleManageUser = () => {
        const path = "/admin/manage-user";
        navigate(path);
    };

    const user = auth?.user;

    const setLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        try {
            await axiosInstance.post("/auth/logout");
            sessionStorage.removeItem("adminAccess"); 
            setAuth(null);  // ✅ Clear auth state
            navigate("/login");  // Redirect to login page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    // const toggleSidebar = () => {
    //     setIsSidebarOpen((prev) => !prev);
    // };

    if (!auth.user) {
        return <div>Loading user data...</div>;
    }

    const handleDeleteAccount = async () => {
        const confirmation = prompt('⚠️ This action is irreversible.\nType "Confirm Delete" to permanently delete your account.');

        if (confirmation !== "Confirm Delete") {
            toast.error("Account deletion cancelled. You must type 'Confirm Delete' exactly.");
            return;
        }
        try {
          await axiosInstance.delete("/auth/delete-account", {
            data: { email: user?.email, role: auth?.role },
          });
      
          toast.success("Account deleted successfully.");
          sessionStorage.removeItem("adminAccess");
          localStorage.clear();
          setAuth(null);

          setTimeout(() => {
            navigate("/login");
          }, 5000);

        } catch (error) {
          console.error("Account deletion failed:", error);
          toast.error("Failed to delete account. Try again later.");
        }
      };
      
    return (

    <div className="settings-page">
        <div className="settings-container">
     
            {auth?.role === "admin" && (
                              <>
                {!hasAdminAccess ? (
                    <AdminAccess onAccessGranted={onAccessGranted} />
                ) : (
                <div className="admin">
                    <h2>🔑 Admin Settings</h2>
                    <p>Manage system settings, user accounts, and security policies.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>
                    <button onClick={handleManageUser}>Manage Users</button>
                    
                    <div style={{ border: "2px dashed red", marginTop: "20px" }}>
                    <AdminRegister />
                    </div>
                </div>
                    )}
                    </>
                
            )}

            {auth?.role === "faculty" && (
                <div className="faculty">
                    <h2>📚 Faculty Settings</h2>
                    <p>Update course materials, modify profile, and change password.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>
                </div>
            )}

            {auth?.role === "student" && (
                <div className="student">
                    <h2>🎓 Student Settings</h2>
                    <p>Update personal information and change password.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>

                </div>
            )}
        </div>

        <div className="profile-section">
            <h2> Profile</h2>
            <div className="profile-content">
                <i className="bi bi-person-circle profile-icon" ></i>
                <p><strong>Name:</strong> {user?.name || ""}</p>
                <p><strong>Email:</strong> {user?.email || ""}</p>
                <button className="btnlogout" onClick={setLogout}>Sign out</button>
                <button className="btndelete" onClick={handleDeleteAccount}> Delete Account </button>
            </div>
        </div>

    </div>
    );
};

export default Settings;