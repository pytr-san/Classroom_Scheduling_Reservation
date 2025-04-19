import React from "react";
import { Modal, Button } from "react-bootstrap";

const StatusChangeModal = ({ show, onHide, selectedStatus, confirmStatusChange }) => (
  <Modal show={show} onHide={onHide} size="sm">
    <Modal.Header closeButton>
      <Modal.Title>Confirm Status</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      Set this slot to <strong>{selectedStatus}</strong>?
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>Cancel</Button>
      <Button variant="primary" onClick={confirmStatusChange}>Confirm</Button>
    </Modal.Footer>
  </Modal>
);

export default StatusChangeModal;