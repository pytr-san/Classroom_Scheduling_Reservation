import { Modal, Button } from "react-bootstrap";

const ConfirmInstructor = ({ show, onHide, onConfirm, instructorName, disabled  }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Assigned Instructor </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to Assign"<strong>{instructorName}</strong>" as an instructor?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="success" onClick={onConfirm} disabled={disabled}>Confirm</Button>  
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmInstructor;
