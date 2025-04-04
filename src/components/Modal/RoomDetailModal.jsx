import React from "react";
import { Modal, Button } from "react-bootstrap";

const RoomDetailModal = ({ show, handleClose, selectedRoom, handleConfirm, handleEdit }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Room Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedRoom ? (
          <div>
            <h5>{selectedRoom.room_name}</h5>
            <p style={{color: "black"}}><strong>Capacity:</strong> {selectedRoom.capacity}</p>
            <p style={{color: "black"}}><strong>Status:</strong> {selectedRoom.status === 0 ? "Unavailable" : "Available"}</p>
            {selectedRoom.image && <img src={selectedRoom.image} alt={selectedRoom.room_name} className="img-fluid" />}
          </div>
        ) : (
          <p>Loading room details...</p>
        )}
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
      </Modal.Footer>
    </Modal>
  );
};

export default RoomDetailModal;
