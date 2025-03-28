import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css"; 
import accesslogo from "../assets/coppp.png";
import { Link } from "react-router-dom";
import { useState } from "react";

function Navbar({ isSidebarOpen, setIsSidebarOpen, handleLogout, user }) {
  
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Define role-based navigation
  const navLinks = {
    admin: [
      { path: "/home", icon: "bi-house", label: "Home" },
      { path: "/classroom", icon: "bi-people", label: "Classroom" },
      { path: "/course", icon: "bi-book", label: "Course" },
      { path: "/settings", icon: "bi-gear", label: "Settings" },
    ],
    faculty: [
      { path: "/home", icon: "bi-house", label: "Home" },
      { path: "/settings", icon: "bi-gear", label: "Settings" },
    ],
    student: [
      { path: "/home", icon: "bi-house", label: "Home" },
      { path: "/settings", icon: "bi-gear", label: "Settings" },
    ],
  };

  // ✅ Determine links based on role (Default: No Links)
  const role = user?.role?.toLowerCase() || "";
  const userNavLinks = navLinks[role] || [];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`sidebar bg-light ${isSidebarOpen || isHovered ? "open" : ""}`} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <nav className="nav flex-column p-3">
          <Link className="nav-link" to="/home">
            <img src={accesslogo} alt="access logo" className="logo me-2" /> 
            <span>Home</span>
          </Link>

          {/* Render role-based links */}
          {userNavLinks.map((link) => (
            <Link key={link.path} className="nav-link" to={link.path}>
              <i className={`bi ${link.icon} me-2`}></i> 
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button at the bottom */}
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i> 
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export default Navbar;
