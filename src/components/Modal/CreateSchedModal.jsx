import "./CreateSchedModal.css";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
        <div className="modal-overlay" onClick={handleClose} style={{ display: "flex" }}>
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

  export default Modal;
  