import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios"; // For making HTTP requests
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const RoomDetailModal = ({ show, handleClose, selectedRoom, handleConfirm, handleEdit }) => {
  // State to manage the editable reservation details
  const navigate = useNavigate();
  const [reservedBy, setReservedBy] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationStartTime, setReservationStartTime] = useState('');
  const [reservationEndTime, setReservationEndTime] = useState('');

  // Confirm and save the reservation to the database
  const handleConfirmReservation = async () => {
    if(!reservedBy || !reservationDate || !reservationStartTime || !reservationEndTime){
      toast.error("Fill Up the form first to proceed");
      return
    }
    try {
      const newReservation = {
        reservedBy,
        reservationDate,
        reservationStartTime,
        reservationEndTime,
        roomName: selectedRoom.room_name
      };

      // Send data to the server to save to the database
      await axios.post("http://localhost:8000/api/reservations", newReservation, {
        withCredentials: true,
    });
      toast.success("Reservation Successfull!");
      // Close modal and refresh parent page (or notify parent to refresh)
      handleClose();
      setTimeout(() => {
        navigate("/classroom/reservations/table");
    }, 1000);
      
    } catch (error) {
      toast.error("Reservation Failed!");
      console.error("Error confirming reservation:", error);
    }
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
            {/* <p><strong>Status:</strong> {selectedRoom.status === 0 ? "Unavailable" : "Available"}</p> */}
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
            <Form.Label>Reservation Start Time</Form.Label>
            <Form.Control
              type="time"
              value={reservationStartTime}
              onChange={(e) => setReservationStartTime(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reservation End Time</Form.Label>
            <Form.Control
              type="time"
              value={reservationEndTime}
              onChange={(e) => setReservationEndTime(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Close</Button>
        <Button variant="primary" onClick={handleConfirmReservation}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomDetailModal;
  