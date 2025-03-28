import { useState } from "react";
import useAuth
 from "../../Hooks/useAuth";
const ProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle modal
  const toggleModal = () => setIsOpen(!isOpen);
  const { auth } = useAuth();

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Profile Button */}
      <div onClick={toggleModal} style={{ cursor: "pointer" }}>
        <i className="bi bi-person-circle text-white" style={{ fontSize: "1.8rem" }}></i>
      </div>

      {/* Overlay */}
      <div className={`modal-overlay ${isOpen ? "show" : ""}`} onClick={handleClickOutside}></div>

      {/* Profile Modal */}
      <div className={`profile-modal ${isOpen ? "open" : ""}`}>
        <span className="close-btn" onClick={toggleModal}>×</span>
        <h2>Profile</h2>
        <div className="profile-content">
          <i className="bi bi-person-circle" style={{ fontSize: "4rem" }}></i>
          <p><strong>Name:</strong> {user?.name || "No name provided"}</p>
          <p><strong>Email:</strong> {user?.email || "No email provided"}</p>
          <button className="logout-btn">Log out</button>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
