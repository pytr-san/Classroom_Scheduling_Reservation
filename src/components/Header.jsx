import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Header.css";
import spistlogo from "../assets/logo1.png";
import { useState, useEffect, useRef } from "react";
import useAuth from "../Hooks/useAuth";

function Header({ toggleSidebar, user, handleLogout }) {
  const [isActive, setIsActive] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);


  const inactivityTimer = useRef(null);
  const { auth } = useAuth();
  

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
    }, 100000); // 5 minutes
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
  const toggleUpload = () => setIsUploadOpen(!isUploadOpen);

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsProfileOpen(false);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setIsUploadOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = async () => {
    if (!editedName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const imageData = profileImage?.includes(",") ? profileImage.split(",")[1] : null;

      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedName, image: imageData }),
      });

      if (response.ok) {
        setIsEditing(false);
        setIsUploadOpen(false);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setEditedName(user?.name || "");
    setIsEditing(false);
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
              {profileImage ? (
                <img src={profileImage} alt="Preview" className="rounded-circle" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
              ) : (
                <i className="bi bi-person-circle" style={{ fontSize: "4rem" }}></i>
              )}
              <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                  onClick={toggleUpload}
                >
             
                  Change Profile Photo
                </button>
              </div>

              <p>
                <strong>Name:</strong>{" "}
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="form-control d-inline-block me-2"
                      style={{ width: "60%" }}
                    />
                    <button onClick={handleSaveClick} className="btn btn-sm btn-success me-1" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={handleCancelEdit} className="btn btn-sm btn-secondary">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {editedName}
                    <button onClick={handleEditClick} className="btn btn-sm btn-outline-secondary ms-2">
                      Edit
                    </button>
                  </>
                )}
              </p>

              <p><strong>Email:</strong> {user?.email || ""}</p>
              <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
          </div>
        </>
      )}

      {isUploadOpen && (
        <>
          <div className="modal-overlay show" onClick={handleClickOutside}></div>
          <div className="profile-modal open">
            <span className="close-btn" onClick={toggleUpload}>×</span>
            <h2>Upload Profile Photo</h2>
            <div className="profile-content">
              <input type="file" accept="image/*" onChange={handleImageChange} className="form-control mb-3" />
              <button className="btn btn-primary" style={{ width: "50%", margin: "0 auto" }} onClick={handleSaveClick} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
