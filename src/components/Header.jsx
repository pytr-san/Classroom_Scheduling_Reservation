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

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setIsActive(false);
    }, 100000);
  };

  useEffect(() => {
    if (auth.user) {
      setIsActive(true); 
      resetInactivityTimer();


      window.addEventListener("mousemove", markUserActive);
      window.addEventListener("keydown", markUserActive);

      return () => {
        window.removeEventListener("mousemove", markUserActive);
        window.removeEventListener("keydown", markUserActive);
        clearTimeout(inactivityTimer.current);
      };
    }
  }, [auth.user]); 

  useEffect(() => {
    const savedImage = localStorage.getItem("userProfileImage");
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, []);
  

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleUpload = () => setIsUploadOpen(!isUploadOpen);

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
  const handleSaveClick = () => {
    if (!profileImage) {
      alert("Please select an image.");
      return;
    }
  
    setIsSaving(true);
  
    try {

      localStorage.setItem("userProfileImage", profileImage);

      setIsUploadOpen(false);
    } catch (error) {
      alert("Failed to save image locally. Please try again.");
    } finally {
      setIsSaving(false);
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

        <div className="ms-auto d-flex align-items-center">

        {auth.user && (
            <div className="d-flex align-items-center position-relative">
              <span className="me-2 text-white fw-bold">{auth.user.email}</span>
              <div
                className="position-relative"
                onClick={toggleProfile}
                style={{ cursor: "pointer", width: "40px", height: "40px" }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid white",
                    }}
                  />
                ) : (
                  <i className="bi bi-person-circle text-white" style={{ fontSize: "1.8rem" }}></i>
                )}

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
                      zIndex: 1,
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
  <div className="modal-overlay show" onClick={handleClickOutside}>
    <div className="profile-modal open">
      <span className="close-btn" onClick={toggleProfile}>×</span>
      <h2>Profile</h2>
      <div className="profile-content">
        {profileImage ? (
          <div
            className="position-relative d-inline-block"
            style={{ width: "80px", height: "80px" }}
          >
            <img
              src={profileImage}
              alt="Preview"
              className="rounded-circle"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <button
              onClick={() => {
                localStorage.removeItem("userProfileImage");
                setProfileImage(null);
              }}
              className="delete-img-btn"
            >
             <i className="bi bi-trash"></i>
            </button>
          </div>
        ) : (
          <i className="bi bi-person-circle profile-icon"></i>
        )}
        <div className="mt-2 mb-2">
          <button className="btn btn-secondary btn-sm" onClick={toggleUpload}>
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
                className="form-control d-inline-block me-2 w-60"
              />
              <button
                onClick={handleSaveClick}
                className="btn btn-sm btn-success me-1"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-sm btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {editedName}
              {/* <button
                onClick={handleEditClick}
                className="btn btn-sm btn-outline-secondary ms-2"
              >
                Edit
              </button> */}
            </>
          )}
        </p>

        <p><strong>Email:</strong> {user?.email || ""}</p>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  </div>
)}

{isUploadOpen && (
  <div className="modal-overlay show" onClick={handleClickOutside}>
    <div className="profile-modal open">
      <span className="close-btn" onClick={toggleUpload}>×</span>
      <h2>Upload Profile Photo</h2>
      <div className="profile-content">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-control mb-3"
        />
        <button
          className="btn btn-primary w-50 mx-auto"
          onClick={handleSaveClick}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}

export default Header;
