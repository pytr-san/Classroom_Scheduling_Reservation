import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './home.css';

const Modal = ({ show, handleClose }) => {
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const navigate = useNavigate();

  const handleCourseChange = (event) => {
    setCourse(event.target.value);
    setYear('');
    setSection('');
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
    setSection('');
  };

  const handleSectionChange = (event) => {
    setSection(event.target.value);
  };

  const handleCreateSchedule = () => {
    if (course && year && section) {
      navigate(`/class-schedule/${course}/${year}/${section}`);
    } else {
      alert('Please select Course, Year, and Section.');
    }
  };

  const courseData = {
    BSIT: {
      years: ['1st', '2nd', '3rd', '4th'],
      sections: {
        '1st': ['1A', '1B'],
        '2nd': ['2A', '2B'],
        '3rd': ['3A', '3B'],
        '4th': ['4A']
      },
    },
    BSCPE: {
      years: ['1st', '2nd', '3rd', '4th'],
      sections: {
        '1st': ['1A'],
        '2nd': ['2A'],
        '3rd': ['3A'],
        '4th': ['4A'],
      },
    },
    BSCS: {
      years: ['1st', '2nd', '3rd', '4th'],
      sections: {
        '1st': ['1A'],
        '2nd': ['2A'],
        '3rd': ['3A'],
        '4th': ['4A'],
      },
    },
  };

  const selectedCourseData = courseData[course] || {};

  return (
    show && (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Select Course, Year, and Section</h2>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <select id="course" className="form-control" value={course} onChange={handleCourseChange}>
              <option value="">Select a course</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCPE">BSCPE</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>
          {course && (
            <>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select id="year" className="form-control" value={year} onChange={handleYearChange}>
                  <option value="">Select a year</option>
                  {selectedCourseData.years?.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} Year
                    </option>
                  ))}
                </select>
              </div>

              {year && (
                <div className="form-group">
                  <label htmlFor="section">Section</label>
                  <select id="section" className="form-control" value={section} onChange={handleSectionChange}>
                    <option value="">Select a section</option>
                    {selectedCourseData.sections[year]?.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreateSchedule}>Create Schedule</button>
          </div>
        </div>
      </div>
    )
  );
};

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

const Home = () => {
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
        <img alt="Campus" src="/bghomepage.jpg" />
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

export default Home;