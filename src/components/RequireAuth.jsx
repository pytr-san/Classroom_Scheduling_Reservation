import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../Hooks/useAuth";

const RequireAuth = ({ allowedRoles }) => {
    const { auth} = useAuth();
    const location = useLocation();
    console.log("Current auth:", auth);
    console.log("Allowed roles:", allowedRoles);

    // if (!auth?.user) {
    //     return <Navigate to="/login" state={{ from: location }} replace />;
    // }
    
    // if (allowedRoles.includes(auth?.role)) {
    //     return <Outlet />;
    // }
//<Navigate to="/unauthorized" state={{ from: location }} replace />;
    return  (

        allowedRoles.includes(auth?.role)
            ? <Outlet />
            : auth?.user
                ? <Navigate to = "unauthorized" state = {{ from: location}} replace />
                : <Navigate to= "/Login" state = {{ from: location}} replace />
    )

};

export default RequireAuth;