import { useState, useEffect } from "react";
import "./ClassroomReservation.css";
import { Button, InputGroup, Form } from "react-bootstrap";
import { FaUsers,  FaClipboardCheck, FaSearch, FaCamera, FaTicketAlt } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import RoomDetailModal from "../../components/Modal/RoomDetailModal";  
import toast from "react-hot-toast";

const ClassroomReservation = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const classrooms = state?.classrooms || [];
  const currentFloor = state?.floor || 1;

  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  // Initialize rooms state and load from localStorage by floor
  const [rooms, setRooms] = useState(() => {
    const storedRooms = JSON.parse(localStorage.getItem(`rooms-${currentFloor}`)); // Store rooms by floor
    if (storedRooms && storedRooms.length) {
      return storedRooms;
    }
    return classrooms || []; // Use classrooms passed from the previous page
  });


  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleShow = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };
  
  const handleClose = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const handleConfirm = () => {
    alert("Reservation confirmed for " + selectedRoom.room_name);
    handleClose(); 
  };

  const handleEdit = () => {
    alert("Editing room: " + selectedRoom.room_name);
    handleClose();
  };

  // Persist rooms in localStorage whenever they change (per floor)
  useEffect(() => {
    localStorage.setItem(`rooms-${currentFloor}`, JSON.stringify(rooms)); // Save by floor
  }, [rooms, currentFloor]);

  const handleUnavailableToggle = (index) => {
    const updatedRooms = [...rooms]; 
    updatedRooms[index].status = updatedRooms[index].status === 1 ? 0 : 1; 
    setRooms(updatedRooms); 
  };

  const handleImageUpload = (index, event) => {
    const file = event.target.files[0];
    
    if (file) {

      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type. Please upload an image.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedRooms = [...rooms];
        updatedRooms[index].image = reader.result; // Store base64 image
        setRooms(updatedRooms);

        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  

  const getFloorLabel = (floor) => `${floor}${getOrdinalSuffix(floor)} Floor`;
  const floorLabel = getFloorLabel(currentFloor);

  const filteredRooms = rooms.filter((room) => 
    room.floor_building?.toLowerCase() === floorLabel.toLowerCase()
  );

  return (
    <div className="container mt-4">
      <header className="header" >
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" onClick={() => navigate(-1)} className="back-btn me-2" >
            <i className="bi bi-arrow-left fs-5"></i>
          </Button>
          <h1 className="mb-0 d-flex align-items-center">
            <i className="bi bi-file-earmark-check fs-1 me-2"></i>
            Classroom Reservation
          </h1>
        </div>
      </header>



      <div className="d-flex align-items-center gap-3 mt-3">
        <div className="sub-header">
          <h2><span>{floorLabel} Classrooms</span></h2>
          
        </div>

      </div>

      <div className="classroom-grid">
        {(filteredRooms.length > 0 ? filteredRooms : rooms).map((room, index) => (
          <div key={index} className={`classroom-card ${room.status === 0 ? "unavailable" : ""}`}>
            
            {/* ✅ Capacity in the top-left */}
            <div className="capacity">
              <FaUsers className="user-icon" /> {room.capacity || "N/A"}
            </div>

            {/* ✅ Top-right container for checkbox & camera button */}
            <div className="top-right-container">

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
                            {/* Unavailable checkbox */}
                            <label className="unavailable-checkbox">
                <input
                  type="checkbox"
                  checked={room.status === 0}
                  onChange={() => handleUnavailableToggle(index)}
                />
              </label>
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
                <Button className="reservation-btn" onClick={() => handleShow(room)}>CREATE RESERVATION</Button>
              )}
            </div>
            {room.status === 0 && <span className="unavailable-text">Unavailable</span>}
          </div>
        ))}
      </div>

      {/* Modal to display room details */}
      <RoomDetailModal 
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
