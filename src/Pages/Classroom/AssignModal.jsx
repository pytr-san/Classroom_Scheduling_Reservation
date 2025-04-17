import React, { useState } from 'react';
import "./AssignModal.css"

const AssignModal = ({ show, handleClose, onAssign, selectedMergedCell, subjects, proctors, onCancelMerge }) => {
  // Return null if the modal is not shown
  if (!show) return null;

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProctor, setSelectedProctor] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday'); 

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
console.log("proctors:", proctors);

  const handleSubmit = () => {
    if (!selectedSubject || !selectedProctor || !selectedDay) {
      alert("Please select subject, proctor, and day.");
      return;
    }

    const assignmentData = {
      subject: selectedSubject,
      proctor: selectedProctor,
      mergedCell: selectedMergedCell,
      day: selectedDay, 
    };

    onAssign(assignmentData);
    resetForm();
    handleClose();
  };

  const resetForm = () => {
    setSelectedSubject('');
    setSelectedProctor('');
    setSelectedDay('Day');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Assign Subject</h2>
        <p>Assign a subject to the selected time slot.</p>

        <div>
          <label htmlFor="day">Day:</label>
          <select
            id="day"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject">Subject:</label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value={""}>Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject.subject_id} value={subject.subject_name}>
                {subject.subject_name}
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
            {proctors.map((proctor) => (
              <option key={proctor.faculty_id} value={proctor.name}>
                {proctor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-buttons">
          <button onClick={handleSubmit}>Assign</button>
          <button onClick={handleClose}>Cancel</button>
          <button onClick={onCancelMerge}>Cancel Merge</button>
        </div>
      </div>
    </div>
  );
};



export default AssignModal;
