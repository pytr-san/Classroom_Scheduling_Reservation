import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth} = useAuth();
    const location = useLocation();
        
    console.log("Current auth:", auth);

    return  (

      allowedRoles.includes(auth?.user?.role)
            ? <Outlet />
            : auth?.user
                ? <Navigate to = "unauthorized" state = {{ from: location}} replace />
                : <Navigate to= "/Login" state = {{ from: location}} replace />
    )

};

export default RequireAuth;