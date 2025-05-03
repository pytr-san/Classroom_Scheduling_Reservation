import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./CreateSchedModal.css";

const Modal = ({ show, handleClose}) => {
    const [courseId, setCourseId] = useState(''); // Store the course_id, not the name
    const [courseName, setCourseName] = useState(''); // Store the course name for display
    const [year, setYear] = useState('');
    const [section, setSection] = useState('');
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch courses from the backend
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/course', {
                    withCredentials: true,
                });
                setCourses(response.data); // Store courses
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses');
            }
        };

        fetchCourses();
    }, []);

    const handleCourseChange = (event) => {
        const selectedCourse = courses.find(course => course.course_name === event.target.value);
        setCourseName(event.target.value);
        setCourseId(selectedCourse?.course_id || ''); // Store the course_id
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
        if (courseName && courseId && year && section) {
          console.log(courseName, courseId, year, section);
            // Navigate to the target route with course_id, year, and section as state
            navigate(`/class-schedule/${courseId}/${year}/${section}`, {
                state: { courseName,courseId, year, section }
            });
        } else {
            alert('Please select Course, Year, and Section.');
        }
    };

    // Hardcoded course data for years and sections
    const courseData = {
      BSIT: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        sections: {
          '1st Year': ['1A', '1B'],
          '2nd Year': ['2A', '2B'],
          '3rd Year': ['3A', '3B'],
          '4th Year': ['4A', '4B']
        },
      },
      BSCPE: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        sections: {
          '1st Year': ['1A'],
          '2nd Year': ['2A'],
          '3rd Year': ['3A'],
          '4th Year': ['4A'],
        },
      },
      BSCS: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        sections: {
          '1st Year': ['1A'],
          '2nd Year': ['2A'],
          '3rd Year': ['3A'],
          '4th Year': ['4A'],
        },
      },
    };

    const selectedCourseData = courseData[courseName] || {};

    return (
        show && (
            <div className="modal-overlay" onClick={handleClose} style={{ display: "flex" }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2>Select Course, Year, and Section</h2>
                    <div className="form-group">
                        <label htmlFor="course">Course</label>
                        <select id="course" className="form-control" value={courseName} onChange={handleCourseChange}>
                            <option value="">Select a course</option>
                            {courses.map((courseData) => (
                                <option key={courseData.course_id} value={courseData.course_name}>
                                    {courseData.course_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {courseName && (
                        <>
                            <div className="form-group">
                                <label htmlFor="year">Year</label>
                                <select id="year" className="form-control" value={year} onChange={handleYearChange}>
                                    <option value="">Select a year</option>
                                    {selectedCourseData.years?.map((yr) => (
                                        <option key={yr} value={yr}>
                                            {yr} 
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
