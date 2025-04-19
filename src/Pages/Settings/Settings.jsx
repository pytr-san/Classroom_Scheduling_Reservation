import { useNavigate } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";


const Settings = () => {
    const { auth } = useAuth();
    const navigate = useNavigate();

    const handlePasswordChange = () => {
        const path = "/admin/change-password";
        navigate(path);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>

            {auth?.role === "admin" && (
                <div className="admin-settings">
                    <h2>🔑 Admin Settings</h2>
                    <p>Manage system settings, user accounts, and security policies.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>
                    <button>Manage Users</button>
                </div>
            )}

            {auth?.role === "faculty" && (
                <div className="faculty-settings">
                    <h2>📚 Faculty Settings</h2>
                    <p>Update course materials, modify profile, and change password.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>
                    <button>Update Profile</button>
                </div>
            )}

            {auth?.role === "student" && (
                <div className="student-settings">
                    <h2>🎓 Student Settings</h2>
                    <p>Update personal information and change password.</p>
                    <button onClick={handlePasswordChange}>Change Password</button>
                    <button>Update Profile</button>
                </div>
            )}
        </div>
    );
};

export default Settings;