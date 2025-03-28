import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
    const { auth } = useAuth();

    // If user is not authenticated, redirect to login
    if (!auth.token) {
        return <Navigate to="/login" />;
    }

    // If user does not have required role, redirect to unauthorized page
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
