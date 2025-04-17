import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css"; 
import accesslogo from "../assets/coppp.png";
import { NavLink  } from "react-router-dom";
import useAuth from "../Hooks/useAuth"; // Import useAuth to access user role

function Navbar({ isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const { auth } = useAuth(); // Get auth context to access user role

  return (
    <div
      className={`sidebar bg-light ${isSidebarOpen ? "open" : "closed"}`} 
      onMouseEnter={() => setIsSidebarOpen(true)}
      onMouseLeave={() => setIsSidebarOpen(false)}
    >
      <nav className="nav flex-column p-3">
        {/* Home (Visible to All) */}
        <NavLink  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/">
          <img src={accesslogo} alt="access logo" className="logo me-2" /> 
          <span>Home</span>
        </NavLink >

        {/* Course & Classroom (Only for Admins) */}
        {auth?.role === "admin" && (
          <>
            <NavLink  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/classroom">
              <i className="bi bi-people me-2"></i> <span>Classroom</span>
            </NavLink >
            
            <NavLink  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/course">
              <i className="bi bi-book me-2"></i> <span>Course</span>
            </NavLink >
          </>
        )}

         {/* Settings (Visible to All) */}
        <NavLink  className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} to="/settings">
            <i className="bi bi-gear me-2"></i> <span>Settings</span>
        </NavLink >

      </nav>

      {/* Logout Button at the bottom */}
      <button className="logout-btn" onClick={handleLogout}>
        <i className="bi bi-box-arrow-right me-2"></i> <span>Logout</span>
      </button>
    </div>
  );
}

export default Navbar;
