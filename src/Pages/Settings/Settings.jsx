
import useAuth from "../../Hooks/useAuth";

const Settings = () => {
    const { auth } = useAuth(); // ✅ Get user role

    return (
        <div className="settings-container">
            <h1>Settings</h1>

            {auth?.role === "admin" && (
                <div>
                    <h2>🔑 Admin Settings</h2>
                    <p>Manage system settings, user accounts, and security policies.</p>
                    <button>Change Password</button>
                    <button>Manage Users</button>
                </div>
            )}

            {auth?.role === "faculty" && (
                <div>
                    <h2>📚 Faculty Settings</h2>
                    <p>Update course materials, modify profile, and change password.</p>
                    <button>Change Password</button>
                    <button>Update Profile</button>
                </div>
            )}

            {auth?.role === "student" && (
                <div>
                    <h2>🎓 Student Settings</h2>
                    <p>Update personal information and change password.</p>
                    <button>Change Password</button>
                    <button>Update Profile</button>
                </div>
            )}
        </div>
    );
}


export default Settings;