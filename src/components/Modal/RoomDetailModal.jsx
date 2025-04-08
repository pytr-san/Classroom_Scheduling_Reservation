import React, { useState } from "react";
import { Modal, Button, Form  } from "react-bootstrap";
import './RoomDetailModal.css';  // Import your report CSS

const RoomDetailModal = ({ show, handleClose, selectedRoom, handleConfirm, handleEdit }) => {
  // State to manage the editable reservation details
  const [reservedBy, setReservedBy] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');

  // Generate report function
  const generateReport = () => {
    if (!reservedBy || !reservationDate || !reservationTime) {
      alert("Please fill out all reservation details before generating the report.");
      return;
    }
  
    const reportWindow = window.open('', '', 'height=800,width=600');
    const roomDetails = selectedRoom ? selectedRoom : {};
  
    const reportContent = `
      <div class="report-container">
        <div class="report-header">
          <h1>Classroom Reservation Form</h1>
          <p>Reservation Confirmation</p>
        </div>
  
        <div class="report-content">
          <div class="section">
            <h3>Room Details</h3>
            <p><strong>Room Name:</strong> ${roomDetails.room_name || 'N/A'}</p>
            <p><strong>Capacity:</strong> ${roomDetails.capacity || 'N/A'}</p>
            <p><strong>Status:</strong> ${roomDetails.status === 0 ? 'Unavailable' : 'Available'}</p>
          </div>
  
          <div class="section">
            <h3>Reservation Details</h3>
            <p><strong>Reserved By:</strong> ${reservedBy || '[Your Name]'}</p>
            <p><strong>Date:</strong> ${reservationDate || '[Reservation Date]'}</p>
            <p><strong>Time:</strong> ${reservationTime || '[Reservation Time]'}</p>
          </div>
        </div>
  
        <button class="print-button" onclick="window.print()">Print Report</button>
      </div>
    `;
  
    reportWindow.document.write(reportContent);
    reportWindow.document.close(); // Necessary for the content to load properly
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Room Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedRoom ? (
          <div>
            <h5>{selectedRoom.room_name}</h5>
            <p><strong>Capacity:</strong> {selectedRoom.capacity}</p>
            <p><strong>Status:</strong> {selectedRoom.status === 0 ? "Unavailable" : "Available"}</p>
            {selectedRoom.image && <img src={selectedRoom.image} alt={selectedRoom.room_name} className="img-fluid" />}
          </div>
        ) : (
          <p>Loading room details...</p>
        )}

        {/* Editable reservation fields */}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Reserved By</Form.Label>
            <Form.Control
              type="text"
              value={reservedBy}
              onChange={(e) => setReservedBy(e.target.value)}
              placeholder="Enter your name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reservation Date</Form.Label>
            <Form.Control
              type="date"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reservation Time</Form.Label>
            <Form.Control
              type="time"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          Confirm
        </Button>
        <Button variant="warning" onClick={handleEdit}>
          Edit
        </Button>
        <Button variant="info" onClick={generateReport}>
          Create Reservation Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomDetailModal;
