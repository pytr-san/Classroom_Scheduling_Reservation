
import useAuth from "../../Hooks/useAuth";
import "./settings.css"
import axios from "axios";

const Settings = () => {
    const { auth, setAuth } = useAuth(); // ✅ Get user role
    const user = auth?.user;

    const setLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        try {
            await axios.post("http://localhost:8000/auth/logout", { withCredentials: true });
            sessionStorage.removeItem("adminAccess"); 
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

    <div className="settings-page">
        <div className="settings-container">
     
            {auth?.role === "admin" && (
              
                <div className="admin">
                    <h2>🔑 Admin Settings</h2>
                    <p>Manage system settings, user accounts, and security policies.</p>
                    <button>Change Password</button>
                    <button>Manage Users</button>
                </div>

                
            )}

            {auth?.role === "faculty" && (
                <div className="faculty">
                    <h2>📚 Faculty Settings</h2>
                    <p>Update course materials, modify profile, and change password.</p>
                    <button>Change Password</button>
                    <button>Update Profile</button>
                </div>
            )}

            {auth?.role === "student" && (
                <div className="student">
                    <h2>🎓 Student Settings</h2>
                    <p>Update personal information and change password.</p>
                    <button>Change Password</button>
                    <button>Update Profile</button>
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
            </div>
        </div>

    </div>
    );
}


export default Settings;