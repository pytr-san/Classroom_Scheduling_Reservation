import React, { useState, useEffect } from "react";
import useAuth from "../../Hooks/useAuth";
import AdminAccess from "../../components/AdminAccess";
import AdminHome from "./AdminHome";
import StudentDashboard from "./StudentDashboard.jsx";
import FacultyDashboard from "./FacultyDashboard.jsx";

const Home = () => {
    const { auth } = useAuth();
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

    if (!auth.user) {
        return <div>Loading user data...</div>;
    }

    return (
        <div>
            {/* <h1>Welcome, {auth.user.name}!</h1> */}

            {auth.user.role === "admin" && (
                <>
                    {!hasAdminAccess ? (
                        <AdminAccess onAccessGranted={onAccessGranted} />
                    ) : (
   
                        <AdminHome/>
                    )}
                </>
            )}

            {auth.user.role === "faculty" && (
                <FacultyDashboard/>
            )}

            {auth.user.role === "student" && (
                < StudentDashboard/>
            )}
        </div>
    );
};

export default Home;
