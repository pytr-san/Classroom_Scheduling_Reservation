import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminHome.css';
import bg from "../../assets/bghomepage.jpg";
import Modal from "../../components/Modal/CreateSchedModal.jsx";


const HistoryPanel = ({ show, handleClose, schedules, handleScheduleSelect }) => {
  return (
    <div className={`history-panel-overlay ${show ? 'visible' : ''}`} onClick={handleClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3>Recent Schedules</h3>
          <button className="close-btn" onClick={handleClose}>&times;</button>
        </div>
        <div className="history-content">
          {schedules.map((schedule, index) => (
            <div 
              key={index} 
              className="schedule-item"
              onClick={() => handleScheduleSelect(schedule)}
            >
              <div className="schedule-course">{schedule.course}</div>
              <div className="schedule-date">{schedule.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminHome = () => {
  const [modalShow, setModalShow] = useState(false);
  const [historyShow, setHistoryShow] = useState(false);
  
  const [schedules, setSchedules] = useState([
    { course: "BSCPE_BSIT, BSCS", date: "June 9, 2024 | 10:04AM" }, 
    { course: "BSCPE_BSIT, BSCS", date: "June 9, 2021 | 5:06AM" }
  ]);

  const navigate = useNavigate();

  const handleScheduleSelect = (schedule) => {
    // Extract course, year, and section from the schedule data
    // This is just an example - adjust according to your actual data structure
    const [course, section] = schedule.course.split('_');
    const year = "1st"; // You'll need to extract this from your data
    
    navigate(`/class-schedule/${course}/${year}/${section}`);
  };

  return (
    <div className="app">
      <div className="image-container">
        <img alt="Campus" src={bg} />
        <div className="button-container">
          <button className="btn-create" onClick={() => setModalShow(true)}>Create New Schedule</button>
          <button className="btn-edit" onClick={() => setHistoryShow(true)}>Edit Existing Schedule</button>
        </div>
      </div>

      <Modal show={modalShow} handleClose={() => setModalShow(false)} />
      <HistoryPanel 
        show={historyShow} 
        handleClose={() => setHistoryShow(false)}
        schedules={schedules}
        handleScheduleSelect={handleScheduleSelect}
      />
    </div>
  );
};

export default AdminHome;