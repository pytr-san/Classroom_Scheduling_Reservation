import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RoomSelectionModal.css";
import axios from "axios";

const RoomSelectionModal = ({ show, handleClose,onConfirm, classrooms }) => {
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/course", { withCredentials: true });
        setCourses(response.data); // Assuming API returns an array of course names
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
  
    fetchCourses();
  }, []);
    

  const groupedByFloor = (classrooms || []).reduce((acc, room) => {
    const floor = room.floor_building || "Unknown Floor";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const [selectedRooms, setSelectedRooms] = useState([]);

  const handleCheckboxChange = (room) => {
    setSelectedRooms((prev) =>
      prev.some((r) => r.room_id === room.room_id)
        ? prev.filter((r) => r.room_id !== room.room_id)
        : [...prev, room]
    );
  };
  
  
  const handleConfirm = () => {

    const cleanedSelectedRooms = selectedRooms.filter(
      (room) => room.room_id && room.room_name
    );

    if (!selectedCourse || !selectedYear || !selectedSection || selectedRooms.length === 0) {
      alert("Please complete all selections before confirming.");
      return;
    }

    const newSchedule = {
      selectedCourse,
      selectedYear,
      selectedSection,
      selectedRooms: cleanedSelectedRooms,
    };
    onConfirm(newSchedule); 
    handleClose();

    setSelectedRooms([]); // Reset selected rooms to clear the checkboxes
    setSelectedCourse(""); // Reset selected course
    setSelectedYear(""); // Reset selected year
    setSelectedSection(""); 
  };
  useEffect(() => {
    if (!show) {
      // Reset the selected rooms when modal is closed
      setSelectedRooms([]);
      setSelectedCourse("");
      setSelectedYear("");
      setSelectedSection("");
    }
  }, [show]);

  
  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="custom-modal-width">
      <Modal.Header closeButton>
        <Modal.Title>Select Course, Year, and Section</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-3 py-2">
        {/* Course Selection */}
        <div className="d-flex justify-content-between mb-3">
          <Form.Select style={{ width: '30%' }} value={selectedCourse.course_id} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Course</option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.coure_id}>
                {course.course_name}
              </option>
            ))}
          </Form.Select>

          <Form.Select style={{ width: '30%' }} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </Form.Select>

          <Form.Select style={{ width: '30%' }}  value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <option value="">Section</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </Form.Select>

        </div>

        <hr />
        <h6>Select Rooms:</h6>

        {/* Room Selection */}
        <div className="room-columns">
          {Object.entries(groupedByFloor).map(([floorName, rooms], index) => (
            <div key={index} className="room-floor">
              <strong>{floorName}</strong>
              {rooms.map((room, i) => (
                <Form.Check
                  key={room.room_id}
                  type="checkbox"
                  label={`${room.room_name} - (${room.capacity})`}
                  checked={selectedRooms.some((r) => r.room_id === room.room_id)}
                  onChange={() => handleCheckboxChange(room)}
                  className="ms-3"
                />

              ))}
            </div>
          ))}
        </div>
      </Modal.Body>

      {/* Footer Buttons */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button 
        variant="primary" 
        onClick={handleConfirm}
        disabled={
          !selectedCourse ||
          !selectedYear ||
          !selectedSection ||
          selectedRooms.length === 0
        } 
        >
          Confirm 
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default RoomSelectionModal;
