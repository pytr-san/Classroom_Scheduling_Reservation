import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import spistlogo from "../assets/logo1.png";
import { useState, useEffect, useRef } from "react";
import useAuth from "../Hooks/useAuth";

function Header({ toggleSidebar, user, handleLogout }) {
  const [isActive, setIsActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for profile modal
  const inactivityTimer = useRef(null);
  const { auth } = useAuth();
  // Function to set active status
  const markUserActive = () => {
    setIsActive(true);
    resetInactivityTimer();
  };

  // Reset user to inactive after 5 minutes
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.log("User is now inactive!"); // Debugging log
      setIsActive(false);
    }, 300000); // 5 minutes
  };

  useEffect(() => {
    if (auth.user) {
      setIsActive(true); // Set active when user logs in
      resetInactivityTimer();

      // Listen for user activity (mouse, keyboard)
      window.addEventListener("mousemove", markUserActive);
      window.addEventListener("keydown", markUserActive);

      return () => {
        window.removeEventListener("mousemove", markUserActive);
        window.removeEventListener("keydown", markUserActive);
        clearTimeout(inactivityTimer.current);
      };
    }
  }, [auth.user]); // Runs when `user` changes

  // Function to toggle profile modal
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsProfileOpen(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 sticky-top shadow">
        <button className="btn btn-light me-3" onClick={toggleSidebar}>
          <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
        </button>
        <img src={spistlogo} alt="spist logo" className="img-icon me-3" />
        <a className="navbar-brand" href="#">
          Southern Philippines Institute of Science and Technology
        </a>

        {/* Right Section */}
        <div className="ms-auto d-flex align-items-center">
          {/* Notification Bell */}
          <div className="position-relative me-3">
            <i className="bi bi-bell-fill text-white" style={{ fontSize: "1.5rem", cursor: "pointer" }}></i>
            <span className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill">
              1 {/* Replace with real count */}
            </span>
          </div>

          {/* User Profile Section */}
          {auth.user && (
            <div className="d-flex align-items-center position-relative">
              <span className="me-2 text-white fw-bold">{auth.user.email}</span>
              <div className="position-relative" onClick={toggleProfile} style={{ cursor: "pointer" }}>
                <i className="bi bi-person-circle text-white" style={{ fontSize: "1.8rem" }}></i>
                {/* Active Status Indicator */}
                {isActive && (
                  <span
                    className="position-absolute"
                    style={{
                      top: "1px",
                      right: "1px",
                      width: "13px",
                      height: "13px",
                      backgroundColor: "#00ff00",
                      borderRadius: "50%",
                      border: "2px solid white",
                      zIndex: 1, // Keep on top
                    }}
                  ></span>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Profile Modal */}
      {isProfileOpen && (
        <>
          <div className="modal-overlay show" onClick={handleClickOutside}></div>
          <div className="profile-modal open">
            <span className="close-btn" onClick={toggleProfile}>×</span>
            <h2>Profile</h2>
            <div className="profile-content">
              <i className="bi bi-person-circle" style={{ fontSize: "4rem" }}></i>
              <p><strong>Name:</strong> {user?.name || "Juan Dela Cruz"}</p>
              <p><strong>Email:</strong> {user?.email || "c26-2025-02@spist.edu.ph"}</p>
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
