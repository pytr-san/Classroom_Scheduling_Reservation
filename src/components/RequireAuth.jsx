import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return (

        allowedRoles.includes(auth?.role)
            ? <Outlet />
            : auth?.user
                ? <Navigate to = "unauthorized" state = {{ from: location}} replace />
                : <Navigate to= "/Login" state = {{ from: location}} replace />
    )

}

export default RequireAuth;