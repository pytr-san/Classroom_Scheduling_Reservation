import { useState } from "react";

const ProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle modal
  const toggleModal = () => setIsOpen(!isOpen);

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
          <p><strong>Name:</strong> Juan Dela Cruz</p>
          <p><strong>Email:</strong> c26-2025-02@spist.edu.ph</p>
          <button className="logout-btn">Log out</button>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
