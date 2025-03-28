


const Home = ({ user }) => {

    if (!user) {
        return <div>Loading user data...</div>;  // ✅ Prevent crash
    }

    return (
        <div>
            <h1>Welcome, {user.name}!</h1>

            {user.role === "admin" && (
                <p>🔹 Admin Dashboard - Manage users, courses, and settings.</p>
            )}

            {user.role === "faculty" && (
                <p>📘 Faculty Panel - View assigned courses and interact with students.</p>
            )}

            {user.role === "student" && (
                <p>🎓 Student Dashboard - Access enrolled courses and track progress.</p>
            )}
        </div>
    )
}
export default Home;