import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RoomSelectionModal.css";

const RoomSelectionModal = ({ show, handleClose, onConfirm }) => {
  const floors = [
    { name: "1st Floor", rooms: ["Room 101", "Room 102", "Room 103", "Computer Lab", "Electronics Lab", "AV Room"] },
    { name: "2nd Floor", rooms: ["Room 201", "Room 202", "Room 203", "Computer Lab", "Electronics Lab", "AV Room"] },
    { name: "3rd Floor", rooms: ["Room 301", "Room 302", "Room 303", "Computer Lab", "Electronics Lab", "AV Room"] },
    { name: "4th Floor", rooms: ["Room 401", "Room 402", "Room 403", "Computer Lab", "Electronics Lab", "AV Room"] },
  ];

  const [selectedRooms, setSelectedRooms] = useState([]);

  const handleCheckboxChange = (room) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedRooms);
    }
    handleClose(); // Close modal after confirming
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Select Course, Year, and Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Course Selection */}
        <div className="d-flex justify-content-between mb-3">
          <Form.Select className="w-30">
            <option>Course</option>
            <option>BS Computer Science</option>
            <option>BS Information Technology</option>
            <option>BS Electronics Engineering</option>
          </Form.Select>
          <Form.Select className="w-30">
            <option>Year</option>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </Form.Select>
          <Form.Select className="w-30">
            <option>Section</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </Form.Select>
        </div>

        <hr />
        <h6>Select Rooms:</h6>

        {/* Room Selection */}
        <div className="row">
          {floors.map((floor, index) => (
            <div key={index} className="col-md-6 mb-3">
              <strong>{floor.name}</strong>
              {floor.rooms.map((room, i) => (
                <Form.Check
                  key={i}
                  type="checkbox"
                  label={room}
                  checked={selectedRooms.includes(room)}
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
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomSelectionModal;
