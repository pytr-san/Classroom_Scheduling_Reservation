import { useState, useEffect } from "react";
import "./ClassroomReservation.css";
import { Button, InputGroup, Form } from "react-bootstrap";
import { FaUsers, FaSearch, FaCamera } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import RoomDetailModal from "../../components/Modal/RoomDetailModal";  

const ClassroomReservation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const classrooms = state?.classrooms || [];

  // Load rooms from localStorage or use the initial classroom data
  const storedRooms = JSON.parse(localStorage.getItem("rooms")) || classrooms;
  const [rooms, setRooms] = useState(storedRooms);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Open modal and set the selected room
  const handleShow = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };
  
  // Close modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };
  
   // Handle Confirm button click (for example, save reservation)
   const handleConfirm = () => {
    alert("Reservation confirmed for " + selectedRoom.room_name);
    handleClose(); // Close the modal after confirmation
  };

  // Handle Edit button click (for example, open the room details for editing)
  const handleEdit = () => {
    alert("Editing room: " + selectedRoom.room_name);
    // You can add logic here to allow editing of room details
    handleClose();
  };
  
  // Save updated rooms to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }, [rooms]);

  // Handle checkbox click to toggle room availability
  const handleUnavailableToggle = (index) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].status = updatedRooms[index].status === 1 ? 0 : 1; // Toggle status
    setRooms(updatedRooms);
  };

  // Handle image upload
  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedRooms = [...rooms];
        updatedRooms[index].image = reader.result; // Store base64 image
        setRooms(updatedRooms);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mt-4">
      <header className="header">
        <h1>Classroom Reservation</h1>
        <div className="d-flex justify-content-end">
          <Button variant="outline-secondary" className="ms-auto" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left fs-5"></i>
          </Button>
        </div>
      </header>

      <div className="d-flex align-items-center gap-3 mt-3">
        <div className="sub-header">
          <Button variant="secondary">Rooms</Button>
          <span >3rd Floor Classrooms</span>
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto">
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control type="text" placeholder="Search..." className="search-input" />
          </InputGroup>
        </div>
      </div>

      <div className="classroom-grid">
        {rooms.map((room, index) => (
          <div key={index} className={`classroom-card ${room.status === 0 ? "unavailable" : ""}`}>
            
            {/* ✅ Capacity in the top-left */}
            <div className="capacity">
              <FaUsers className="user-icon" /> {room.capacity || "N/A"}
            </div>

            {/* ✅ Top-right container for checkbox & camera button */}
            <div className="top-right-container">
              {/* Unavailable checkbox */}
              <label className="unavailable-checkbox">
                <input
                  type="checkbox"
                  checked={room.status === 0}
                  onChange={() => handleUnavailableToggle(index)}
                />
                <h7>Unavailable</h7>
              </label>

              {/* ✅ Camera Icon as a Button */}
              <button
                className="camera-button"
                onClick={() => document.getElementById(`file-upload-${index}`).click()}
              >
                <FaCamera className="camera-icon" />
              </button>

              {/* Hidden File Input */}
              <input
                id={`file-upload-${index}`}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(index, e)}
              />
            </div>

            {/* ✅ Room image or upload option */}
            <div className="classroom-content">
              {room.image ? (
                <div className="classroom-image">
                  <img src={room.image} alt={room.room_name} />
                </div>
              ) : (
                <p>No Image Available</p>
              )}
            </div>
            <p className="room-name">{room.room_name}</p>

            {/* Buttons that appear on hover */}
            <div className="button1-container">
              {room.status !== 0 && (
                <Button className="reservation-btn"
                onClick={() => handleShow(room)} 
                >CREATE RESERVATION</Button>
              )}
            </div>

          </div>
        ))}
      </div>
      
      {/* Modal to display room details */}
      <RoomDetailModal  // Using the imported modal component
        show={showModal}
        handleClose={handleClose}
        selectedRoom={selectedRoom}
        handleConfirm={handleConfirm}
        handleEdit={handleEdit}
      />

    </div>
  );
};

export default ClassroomReservation;
