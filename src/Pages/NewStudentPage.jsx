import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './studentpage.css';

const NewStudentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {};

    const [selectedOption, setSelectedOption] = useState({
        course: null,
        year: null,
        section: null
    });

    const handleSelect = (type, value) => {
        setSelectedOption(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleConfirm = () => {
        if (selectedOption.course && selectedOption.year && selectedOption.section) {
            navigate("/class-schedule", {
                state: { 
                    course: selectedOption.course, 
                    year: selectedOption.year, 
                    section: selectedOption.section, 
                    user 
                }
            });
        }
    };

    return (
        <div className="student-page-container">
            <div className="header">
                <h1>WELCOME BACK TO ACCESS DEPARTMENT</h1>
                <p className="subheader">Fill to View Class Schedule</p>
            </div>

            <div className="selection-container">
                <div className="selection-group">
                    <h3>COURSE</h3>
                    <div className="options-row">
                        {["BST", "BSCS", "BSCPE"].map((course) => (
                            <div 
                                key={course}
                                className={`option-card ${selectedOption.course === course ? 'selected' : ''}`}
                                onClick={() => handleSelect('course', course)}
                            >
                                {course}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="selection-group">
                    <h3>YEAR</h3>
                    <div className="options-row">
                        {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                            <div 
                                key={year}
                                className={`option-card ${selectedOption.year === year ? 'selected' : ''}`}
                                onClick={() => handleSelect('year', year)}
                            >
                                {year}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="selection-group">
                    <h3>SECTION</h3>
                    <div className="options-row">
                        {["Section A", "Section B"].map((section) => (
                            <div 
                                key={section}
                                className={`option-card ${selectedOption.section === section ? 'selected' : ''}`}
                                onClick={() => handleSelect('section', section)}
                            >
                                {section}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                className="confirm-button"
                onClick={handleConfirm}
                disabled={!selectedOption.course || !selectedOption.year || !selectedOption.section}
            >
                CONFIRM
            </button>
        </div>
    );
};

export default NewStudentPage;