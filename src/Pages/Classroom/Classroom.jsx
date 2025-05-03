import React, { useState, useEffect } from "react";
import useAuth from "../../Hooks/useAuth";
import AdminAccess from "../../components/AdminAccess";
import AccessClassroom from "./AccessClassroom.jsx";

const Classroom = () => {
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

            {auth.user.role === "admin" && (
                <>
                    {!hasAdminAccess ? (
                        <AdminAccess onAccessGranted={onAccessGranted} />
                    ) : (
   
                        <AccessClassroom/>
                    )}
                </>
            )}

        </div>
    );
};
    
export default Classroom;
