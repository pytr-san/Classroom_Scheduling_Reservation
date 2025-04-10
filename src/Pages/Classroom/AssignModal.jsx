import React, { useState,useEffect } from 'react';
import PropTypes from 'prop-types';

const AssignModal = ({ show, handleClose, onAssign, selectedMergedCell, subjects, proctors }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProctor, setSelectedProctor] = useState('');   

  useEffect(() => {
    if (show) {
      console.log("Modal opened with:", selectedMergedCell);
    }
  }, [show]);

  const handleSubmit = () => {
    if (!selectedSubject || !selectedProctor) {
      alert("Please select both a subject and a proctor.");
      return;
    }

    // Prepare assignment data
    const assignmentData = {
      subject: selectedSubject,
      proctor: selectedProctor,
      mergedCell: selectedMergedCell,
    };

    // Call onAssign function passed down from parent component
    onAssign(assignmentData);

    // Reset input fields
    setSelectedSubject('');
    setSelectedProctor('');

    // Close the modal
    handleClose();
  };

  if (!show) return null; // Return nothing if the modal is not visible

  return (
    <div className="modal-overlay" >
      <div className="modal-content">
        <h2>Assign Subject</h2>
        <p>Assign a subject to the selected time slot.</p>

        <div>
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject, index) => (
              <option key={index} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="proctor">Proctor:</label>
          <select
            id="proctor"
            value={selectedProctor}
            onChange={(e) => setSelectedProctor(e.target.value)}
          >
            <option value="">Select Proctor</option>
            {proctors.map((proctor, index) => (
              <option key={index} value={proctor.id}>
                {proctor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-buttons">
          <button onClick={handleSubmit}>Assign</button>
          <button onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Define the PropTypes to make sure the correct data is passed
AssignModal.propTypes = {
  show: PropTypes.bool.isRequired, // If the modal should be shown or not
  handleClose: PropTypes.func.isRequired, // Function to close the modal
  onAssign: PropTypes.func.isRequired, // Function to handle the assignment
  selectedMergedCell: PropTypes.object.isRequired, // The merged cell that was clicked
  subjects: PropTypes.array.isRequired, // Array of subjects to choose from
  proctors: PropTypes.array.isRequired, // Array of proctors to choose from
};  

export default AssignModal;
