import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminHome.css';
import bg from "../../assets/bghomepage.jpg";

const HistoryPanel = ({ show, handleClose, schedules, handleScheduleSelect }) => {
  return (
    <div className={`history-panel-overlay ${show ? 'visible' : ''}`} onClick={handleClose}>
      <div className="history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h3>Recent Schedules</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
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
  const [historyShow, setHistoryShow] = useState(false);

  const [schedules, setSchedules] = useState([
    { course: "BSCPE_BSIT, BSCS", date: "June 9, 2024 | 10:04AM" },
    { course: "BSCPE_BSIT, BSCS", date: "June 9, 2021 | 5:06AM" }
  ]);

  const navigate = useNavigate();

  const handleScheduleSelect = (schedule) => {
    // Extract course and section from the schedule data
    const [course, section] = schedule.course.split('_');
    const year = "1st"; // Replace this with actual year if available in your data

    navigate(`/class-schedule/${course}/${year}/${section}`);
  };

  const handleCreateSchedule = () => {
    navigate("/class-schedule/BSIT/1st/1A"); // Example route, adjust as needed
  };

  return (
    <div className="app">
      <div className="image-container">
        <img alt="Campus" src={bg} />
        <div className="button-container">
          <button className="btn-create" onClick={handleCreateSchedule}>
            Create Class-Schedule
          </button>
          <button className="btn-edit" onClick={() => navigate("/create-room-schedule")}>
            Create Examination-Schedule
          </button>
        </div>
      </div>

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
