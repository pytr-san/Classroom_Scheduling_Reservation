import  { useState } from "react";
import { Modal, Button } from "react-bootstrap"; // Assuming you're using react-bootstrap
import { FaCheck, FaTimes } from "react-icons/fa";

const AddInstructorModal = ({ show, onHide, onConfirm }) => {
  const [instructorName, setInstructorName] = useState("");

  const handleConfirm = () => {
    if (instructorName.trim() !== "") {
      onConfirm(instructorName);
      setInstructorName(""); // Reset input after confirmation
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Instructor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label htmlFor="instructorName" className="form-label">
            Instructor Name (first name...)
          </label>
          <input
            type="text"
            className="form-control"
            id="instructorName"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            placeholder="Enter instructor name"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          <FaTimes /> Cancel
        </Button>
        <Button variant="primary" onClick={handleConfirm} disabled={instructorName.trim() === ""}>
          <FaCheck /> Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddInstructorModal;
