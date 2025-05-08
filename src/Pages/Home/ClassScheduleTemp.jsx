import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, Dropdown, DropdownButton, Tooltip, OverlayTrigger, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck, faTimes, faDownload, faUndo, faSave, faPrint, faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
import "./schedule.css";
import "./table.css";
import  axiosInstance  from '../../axios.jsx';
import { useNavigate } from 'react-router-dom';

const ClassSchedule = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = useState("Select Section");
    const [selectedCells, setSelectedCells] = useState(new Set());
    const [mergedCells, setMergedCells] = useState({});
    const [cellStatus, setCellStatus] = useState({});
    const [cellDetails, setCellDetails] = useState({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourse, setNewCourse] = useState("BSIT");
    const [newSection, setNewSection] = useState("");
    const [courses, setCourses] = useState({
        BSIT: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
        BSCPE: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
        BSCS: ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"],
    });

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedCellKey, setSelectedCellKey] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("Semester 1");
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("2023-2024");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const scheduleTableRef = useRef(null);
    const [savedSchedules, setSavedSchedules] = useState({});
    const [conflicts, setConflicts] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [yearLevel, setYearLevel] = useState('');
    const [courseId, setCourseId] = useState(''); // Store the course_id, not the name
    const [courseName, setCourseName] = useState(''); 
    const [year, setYear] = useState('');
    const [course, setCourse] = useState([]);

    // Fetch courses from the backend
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await  axiosInstance.get('/api/course');
                setCourse(response.data); // Store courses
                
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses');
            }
        };

        fetchCourses();
    }, []);

    const handleCourseChange = (event) => {
        const selectedCourse = course.find(course => course.course_name === event.target.value);
        setCourseName(event.target.value);
        setCourseId(selectedCourse?.course_id || ''); // Store the course_id
        setYear('');
    };

    const handleYearChange = (event) => {
        setYear(event.target.value);
    };

    
    const handleFilter = () => {
        if (courseName && courseId && year ) {
          console.log(courseName, courseId, year);
          setCourseId(courseId);
          setCourseName(courseName);
          setYearLevel(year);
  
          setShowFilterModal(false);
        } else {
            alert('Please select Course and year level');
        }
    };

    // Hardcoded course data for years and sections
    const courseData = {
      BSIT: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      },
      BSCPE: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      },
      BSCS: {
        years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      },
    };

    const selectedCourseData = courseData[courseName] || {};


    const times = [
        "7:00 - 8:00", "8:00 - 9:00", "9:00 - 10:00", "10:00 - 11:00",
        "11:00 - 12:00", "12:00 - 1:00", "1:00 - 2:00", "2:00 - 3:00",
        "3:00 - 4:00", "4:00 - 5:00", "5:00 - 6:00", "6:00 - 7:00"
    ];

    useEffect(() => {
        axiosInstance.get('/api/professors')
            .then(res => setProfessors(res.data))
            .catch(err => console.error('Error fetching professors:', err));

        if (courseId && yearLevel) {
            axiosInstance.get('/api/subjects', {
                params: { courseId: courseId, yearLevel: yearLevel }})
                .then(res => {
                    if (res.data && Array.isArray(res.data)) {
                        setSubjects(res.data);
                    } else {
                        setSubjects([]);
                        console.warn('No subjects found for the initial course and year level.');
                    }
                })
                .catch(err => {
                    console.error('Error fetching subjects:', err);
                    setSubjects([]);
                });
        }

        axiosInstance.get('/api/rooms')
            .then(res => setRooms(res.data))
            .catch(err => console.error('Error fetching rooms:', err));
    }, [courseId, yearLevel]);

    useEffect(() => {
        const saved = localStorage.getItem('allSchedules');
        if (saved) {
            setSavedSchedules(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (selectedSection !== "Select Section" && savedSchedules[selectedSection]) {
            const { mergedCells, cellStatus, cellDetails, selectedSemester, selectedSchoolYear } = savedSchedules[selectedSection];
            setMergedCells(mergedCells || {});
            setCellStatus(cellStatus || {});
            setCellDetails(cellDetails || {});
            setSelectedSemester(selectedSemester || "Semester 1");
            setSelectedSchoolYear(selectedSchoolYear || "2023-2024");
        } else {
            setMergedCells({});
            setCellStatus({});
            setCellDetails({});
        }
    }, [selectedSection, savedSchedules]);

    useEffect(() => {
        const detectConflicts = () => {
            const newConflicts = [];

            for (const [sectionA, scheduleA] of Object.entries(savedSchedules)) {
                for (const [sectionB, scheduleB] of Object.entries(savedSchedules)) {
                    if (sectionA !== sectionB) {
                        for (const [keyA, detailsA] of Object.entries(scheduleA.cellDetails)) {
                            for (const [keyB, detailsB] of Object.entries(scheduleB.cellDetails)) {
                                if (keyA === keyB && detailsA.professor?.name === detailsB.professor?.name) {
                                    if (
                                        detailsA.subject?.subject_name !== detailsB.subject?.subject_name &&
                                        detailsA.room?.room_name !== detailsB.room?.room_name
                                    ) {
                                        newConflicts.push({
                                            sectionA,
                                            sectionB,
                                            professor: detailsA.professor?.name,
                                            subjectA: detailsA.subject?.subject_name,
                                            subjectB: detailsB.subject?.subject_name,
                                            roomA: detailsA.room?.room_name,
                                            roomB: detailsB.room?.room_name,
                                            time: times[parseInt(keyA.split('-')[0])],
                                            cellKey: keyA
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            setConflicts(newConflicts);
        };

        detectConflicts();
    }, [savedSchedules]);

    const semesters = ["Semester 1", "Semester 2"];
    const schoolYears = ["2023-2024", "2024-2025"];
    const yearLevels = ["1", "2", "3", "4"];

    const toggleCellSelection = (key) => {
        setSelectedCells(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(key)) {
                newSelection.delete(key);
            } else {
                newSelection.add(key);
            }
            return newSelection;
        });
    };

    const confirmAction = () => {
        if (selectedCells.size === 1) {
            const key = Array.from(selectedCells)[0];
            setCellStatus(prev => ({
                ...prev,
                [key]: 'Single'
            }));

            setCellDetails(prev => ({
                ...prev,
                [key]: prev[key] || {
                    professor: professors[0] || { name: '' },
                    subject: subjects[0] || { subject_name: '' },
                    room: rooms[0] || { room_name: '' }
                }
            }));
            
            // Keep the cell selected after creation
            setSelectedCells(new Set([key]));
        } else if (selectedCells.size > 1) {
            const cellsArray = Array.from(selectedCells);
            const cellIndices = cellsArray.map(key => {
                const [row, col] = key.split('-').map(Number);
                return { key, row, col };
            });

            const minRow = Math.min(...cellIndices.map(cell => cell.row));
            const maxRow = Math.max(...cellIndices.map(cell => cell.row));
            const minCol = Math.min(...cellIndices.map(cell => cell.col));
            const maxCol = Math.max(...cellIndices.map(cell => cell.col));

            const expectedCellCount = (maxRow - minRow + 1) * (maxCol - minCol + 1);
            if (cellsArray.length !== expectedCellCount) {
                alert("Please select a contiguous rectangular block of cells to merge.");
                setSelectedCells(new Set());
                return;
            }

            for (let row = minRow; row <= maxRow; row++) {
                for (let col = minCol; col <= maxCol; col++) {
                    const key = `${row}-${col}`;
                    if (!selectedCells.has(key)) {
                        alert("Please select a contiguous rectangular block of cells to merge.");
                        setSelectedCells(new Set());
                        return;
                    }
                }
            }

            const rowSpan = maxRow - minRow + 1;
            const colSpan = maxCol - minCol + 1;
            const anchorCell = `${minRow}-${minCol}`;

            setMergedCells(prev => ({
                ...prev,
                [anchorCell]: {
                    cells: cellsArray,
                    rowSpan,
                    colSpan,
                    minRow,
                    maxRow,
                    minCol,
                    maxCol
                }
            }));

            cellsArray.forEach(cell => {
                setCellStatus(prev => ({
                    ...prev,
                    [cell]: 'Merged'
                }));
            });

            setCellDetails(prev => ({
                ...prev,
                [anchorCell]: prev[anchorCell] || {
                    professor: professors[0] || { name: '' },
                    subject: subjects[0] || { subject_name: '' },
                    room: rooms[0] || { room_name: '' }
                }
            }));

            // Keep the anchor cell selected after merge
            setSelectedCells(new Set([anchorCell]));
        } else {
            alert("Please select at least one cell to create or merge.");
        }
    };

    const cancelMerge = () => {
        setSelectedCells(new Set());
    };

    const unmergeCells = () => {
        const cellsToUnmerge = Array.from(selectedCells);

        setMergedCells(prev => {
            const newMergedCells = { ...prev };
            cellsToUnmerge.forEach(cell => {
                const groupKey = Object.keys(newMergedCells).find(key =>
                    newMergedCells[key].cells.includes(cell)
                );
                if (groupKey) {
                    delete newMergedCells[groupKey];
                }
            });
            return newMergedCells;
        });

        cellsToUnmerge.forEach(cell => {
            setCellStatus(prev => ({
                ...prev,
                [cell]: ''
            }));
            setCellDetails(prev => {
                const newDetails = { ...prev };
                delete newDetails[cell];
                return newDetails;
            });
        });

        setSelectedCells(new Set());
    };

    const handleSaveSchedule = () => {
        if (selectedSection === "Select Section") {
            alert("Please select a section before saving.");
            return;
        }
        const scheduleData = {
            mergedCells,
            cellStatus,
            cellDetails,
            selectedSection,
            selectedSemester,
            selectedSchoolYear
        };
        const updatedSchedules = {
            ...savedSchedules,
            [selectedSection]: scheduleData
        };
        setSavedSchedules(updatedSchedules);
        localStorage.setItem('allSchedules', JSON.stringify(updatedSchedules));
        alert("Schedule saved successfully for " + selectedSection + "!");
    };

    const handleDownloadSchedule = () => {
        if (scheduleTableRef.current) {
            html2canvas(scheduleTableRef.current, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg');
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: 'a4'
                });

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const scaledWidth = imgWidth * ratio;
                const scaledHeight = imgHeight * ratio;

                const xOffset = (pdfWidth - scaledWidth) / 2;
                const yOffset = (pdfHeight - scaledHeight) / 2;

                pdf.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);
                pdf.save('class_schedule.pdf');
            });
        }
    };

    const handlePrintSchedule = () => {
        window.print();
    };

    const markCellStatus = (key, status) => {
        const groupKey = Object.keys(mergedCells).find(anchorKey =>
            mergedCells[anchorKey].cells.includes(key)
        );

        if (groupKey) {
            const groupCells = mergedCells[groupKey].cells;
            setCellStatus(prevStatus => {
                const updatedStatus = { ...prevStatus };
                groupCells.forEach(cell => {
                    updatedStatus[cell] = status;
                });
                return updatedStatus;
            });
        } else {
            setCellStatus(prevStatus => ({
                ...prevStatus,
                [key]: status
            }));
        }
    };

    const updateCellDetails = (key, detailType, value) => {
        setCellDetails(prevDetails => ({
            ...prevDetails,
            [key]: {
                ...prevDetails[key],
                [detailType]: value,
            },
        }));
    };

    const handleCreateSection = () => {
        if (!newSection.trim()) {
            alert("Please enter a section name");
            return;
        }

        const updatedCourses = {
            ...courses,
            [newCourse]: [...(courses[newCourse] || []), newSection]
        };

        setCourses(updatedCourses);
        setSelectedSection(`${newCourse} ${newSection}`);
        setNewSection("");
        setShowCreateModal(false);
        setMergedCells({});
        setCellStatus({});
        setCellDetails({});
        setSelectedCells(new Set());
    };

    const handleStatusChange = (key, status) => {
        setSelectedCellKey(key);
        setSelectedStatus(status);
        setShowStatusModal(true);
    };

    const confirmStatusChange = () => {
        markCellStatus(selectedCellKey, selectedStatus);
        setShowStatusModal(false);
    };


    return (
        <Container className="main mt-4">
            <Header
                navigate={navigate}
                setShowCreateModal={setShowCreateModal}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                selectedSchoolYear={selectedSchoolYear}
                setSelectedSchoolYear={setSelectedSchoolYear}
                semesters={semesters}
                schoolYears={schoolYears}
                setShowFilterModal={setShowFilterModal}
                courseName={courseName}
            />

            {conflicts.length > 0 && (
                <Row className="mb-3 conflict-section">
                    <Col>
                        <h5>Detected Conflicts</h5>
                        <Table bordered hover>
                            <thead>
                                <tr>
                                    <th>Section A</th>
                                    <th>Section B</th>
                                    <th>Professor</th>
                                    <th>Subject A</th>
                                    <th>Subject B</th>
                                    <th>Room A</th>
                                    <th>Room B</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conflicts.map((conflict, index) => (
                                    <tr key={index}>
                                        <td>{conflict.sectionA}</td>
                                        <td>{conflict.sectionB}</td>
                                        <td>{conflict.professor}</td>
                                        <td>{conflict.subjectA}</td>
                                        <td>{conflict.subjectB}</td>
                                        <td>{conflict.roomA}</td>
                                        <td>{conflict.roomB}</td>
                                        <td>{conflict.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            )}

            <Row>
                <Col md={3}>
                    <CourseSelector
                        courses={courses}
                        setSelectedSection={setSelectedSection}
                        selectedSection={selectedSection}
                    />
                </Col>
                <Col md={9}>
                    <div ref={scheduleTableRef}>
                        <ScheduleHeader
                            selectedSection={selectedSection}
                            selectedSemester={selectedSemester}
                            selectedSchoolYear={selectedSchoolYear}
                        />
                        <ScheduleTable
                            times={times}
                            selectedCells={selectedCells}
                            mergedCells={mergedCells}
                            cellStatus={cellStatus}
                            cellDetails={cellDetails}
                            toggleCellSelection={toggleCellSelection}
                            handleStatusChange={handleStatusChange}
                            updateCellDetails={updateCellDetails}
                            selectedSection={selectedSection}
                            professors={professors}
                            subjects={subjects}
                            rooms={rooms}
                            conflicts={conflicts}
                        />
                    </div>
                    <ActionButtons
                        selectedCells={selectedCells}
                        confirmAction={confirmAction}
                        cancelMerge={cancelMerge}
                        unmergeCells={unmergeCells}
                    />
                </Col>
            </Row>
            <Legend />
            <SaveAndLoadButtons
                handleSaveSchedule={handleSaveSchedule}
                handleDownloadSchedule={handleDownloadSchedule}
                handlePrintSchedule={handlePrintSchedule}
            />
            <SectionNavigation
                savedSchedules={savedSchedules}
                setSavedSchedules={setSavedSchedules}
                setSelectedSection={setSelectedSection}
                selectedSection={selectedSection}
            />

            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Section</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Course</Form.Label>
                            <Form.Select
                                value={newCourse}
                                onChange={(e) => setNewCourse(e.target.value)}
                            >
                                {Object.keys(courses).map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Section Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter section name"
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateSection}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" /> Create
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} size="sm">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Status</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Set this slot to <strong>{selectedStatus}</strong>?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={confirmStatusChange}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>

{/* filter modal*/}
            <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Filter subjects by Course and year level</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Course</Form.Label>
                    <Form.Select value={courseName} onChange={handleCourseChange}>
                    <option value="">Select a course</option>
                    {course.map((courseData) => (
                        <option key={courseData.course_id} value={courseData.course_name}>
                        {courseData.course_name}
                        </option>
                    ))}
                    </Form.Select>
                </Form.Group>

                {courseName && (
                    <>
                    <Form.Group className="mb-3">
                        <Form.Label>Year</Form.Label>
                        <Form.Select value={year} onChange={handleYearChange}>
                        <option value="">Select a year</option>
                        {selectedCourseData.years?.map((yr) => (
                            <option key={yr} value={yr}>
                            {yr}
                            </option>
                        ))}
                        </Form.Select>
                    </Form.Group>

                    </>
                )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
                Cancel
                </Button>
                <Button variant="primary" onClick={handleFilter}>
                Filter
                </Button>
            </Modal.Footer>
            </Modal>

        </Container>
    );
};

const SectionNavigation = ({ savedSchedules, setSavedSchedules, setSelectedSection, selectedSection }) => {
    const handleDelete = (section) => {
        const updatedSchedules = { ...savedSchedules };
        delete updatedSchedules[section];
        setSavedSchedules(updatedSchedules);
        localStorage.setItem('allSchedules', JSON.stringify(updatedSchedules));
        if (selectedSection === section) {
            setSelectedSection("Select Section");
        }
        alert(`Deleted schedule for ${section}`);
    };

    return (
        <Row className="mt-3">
            <Col>
                <h5>Saved Schedules</h5>
                <div className="d-flex flex-wrap">
                    {Object.keys(savedSchedules).length === 0 ? (
                        <p>No saved schedules yet.</p>
                    ) : (
                        Object.keys(savedSchedules).map((section) => (
                            <div key={section} className="d-flex align-items-center m-1">
                                <Button
                                    variant={selectedSection === section ? "primary" : "outline-secondary"}
                                    onClick={() => setSelectedSection(section)}
                                    className="me-2"
                                >
                                    {section}
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(section)}>
                                    &times;
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </Col>
        </Row>
    );
};

    const Header = ({
        navigate,
        setShowCreateModal,
        selectedSemester,
        setSelectedSemester,
        selectedSchoolYear,
        setSelectedSchoolYear,
        semesters,
        schoolYears,
        setShowFilterModal,
        courseName
    }) => (
        <Row className="mb-3 d-flex justify-content-between align-items-center">
            
            <Col className="d-flex align-items-center">
            <Button variant="outline-secondary" 
            className="px-4"
        style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
            onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left fs-5 "></i>
            </Button>
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                <h4 className="mb-0 align-self-center">Class Schedule</h4>
            </Col>

        <Col className="d-flex justify-content-end">
            <DropdownButton
                title={selectedSemester}
                variant="secondary"
                className="me-2"
                onSelect={(key) => setSelectedSemester(semesters[key])}
            >
                {semesters.map((semester, index) => (
                    <Dropdown.Item
                        key={index}
                        eventKey={index}
                        active={selectedSemester === semester}
                    >
                        {semester}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
            <DropdownButton
                title={selectedSchoolYear}
                variant="secondary"
                className="me-2"
                onSelect={(key) => setSelectedSchoolYear(schoolYears[key])}
            >
                {schoolYears.map((year, index) => (
                    <Dropdown.Item
                        key={index}
                        eventKey={index}
                        active={selectedSchoolYear === year}
                    >
                        {year}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
            <Button variant="success" onClick={() => setShowCreateModal(true)} className="me-2">
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Create
            </Button>
            <Button variant="info" onClick={() => setShowFilterModal(true)}>
    <FontAwesomeIcon icon={faFilter} className="me-2" /> Filter Subjects {courseName}
    </Button>
        </Col>
    </Row>
);

const ScheduleHeader = ({ selectedSection, selectedSemester, selectedSchoolYear }) => (
    <div className="mb-3">
        <h5>Schedule for: {selectedSection}</h5>
        <div className="text-muted">
            {selectedSemester} • {selectedSchoolYear}
        </div>
    </div>
);

const CourseSelector = ({ courses, setSelectedSection, selectedSection }) => (
    <>
        <h5>Select Course & Section</h5>
        {Object.entries(courses).map(([course, sections]) => (
            <DropdownButton
                key={course}
                title={course}
                variant="secondary"
                className="mb-3 w-100 course-dropdown"
            >
                {sections.map((section) => (
                    <Dropdown.Item
                        key={`${course}-${section}`}
                        onClick={() => setSelectedSection(`${course} ${section}`)}
                        active={selectedSection === `${course} ${section}`}
                    >
                        {course} {section}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        ))}
    </>
);

const ScheduleTable = ({
    times,
    selectedCells,
    mergedCells,
    cellStatus,
    cellDetails,
    toggleCellSelection,
    handleStatusChange,
    updateCellDetails,
    selectedSection,
    professors,
    subjects,
    rooms,
    conflicts
}) => {
    const renderDropdowns = (key) => {
        return (
            <div className="cell-content">
                <DropdownButton
                    title={cellDetails[key]?.professor?.name || "Select Professor"}
                    variant="secondary"
                    size="sm"
                    className="mb-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {professors.map((prof, index) => (
                        <Dropdown.Item
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateCellDetails(key, "professor", prof);
                            }}
                        >
                            {prof.name}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>

                <DropdownButton
                    title={cellDetails[key]?.subject?.subject_name || "Select Subject"}
                    variant="secondary"
                    size="sm"
                    className="mb-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    {subjects.map((subj, index) => (
                        <Dropdown.Item
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateCellDetails(key, "subject", subj);
                            }}
                        >
                            {subj.subject_name}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>

                <DropdownButton
                    title={cellDetails[key]?.room?.room_name || "Select Room"}
                    variant="secondary"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    {rooms.map((room, index) => (
                        <Dropdown.Item
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                updateCellDetails(key, "room", room);
                            }}
                        >
                            {room.room_name}
                        </Dropdown.Item>
                    ))}
                </DropdownButton>
            </div>
        );
    };

    return (
        <div className="table-container">
            <Table bordered size="sm" className="text-center custom-schedule-table">
                <thead className="table-header-green">
                    <tr>
                        <th className="time-header">Time</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
                    {times.map((time, timeIndex) => (
                        <tr key={timeIndex}>
                            <td className="time-cell">{time}</td>
                            {Array.from({ length: 6 }).map((_, dayIndex) => {
                                const key = `${timeIndex}-${dayIndex}`;
                                let isMerged = false;
                                let isAnchor = false;
                                let rowSpan = 1;
                                let colSpan = 1;

                                for (const [anchorKey, group] of Object.entries(mergedCells)) {
                                    const { cells, minRow, maxRow, minCol, maxCol } = group;
                                    if (
                                        timeIndex >= minRow &&
                                        timeIndex <= maxRow &&
                                        dayIndex >= minCol &&
                                        dayIndex <= maxCol
                                    ) {
                                        if (key === anchorKey) {
                                            isAnchor = true;
                                            rowSpan = maxRow - minRow + 1;
                                            colSpan = maxCol - minCol + 1;
                                        } else {
                                            isMerged = true;
                                            break;
                                        }
                                    }
                                }

                                if (isMerged) {
                                    return null;
                                }

                                const isConflicted = conflicts.some((conflict) => {
                                    const conflictTimeIndex = times.indexOf(conflict.time);
                                    return (
                                        conflictTimeIndex === timeIndex &&
                                        selectedSection === conflict.sectionA &&
                                        conflict.cellKey === key &&
                                        cellDetails[key]?.professor?.name === conflict.professor
                                    );
                                });

                                const statusClass = isConflicted
                                    ? "cell-conflict"
                                    : cellStatus[key] === "F2F"
                                    ? "cell-f2f"
                                    : cellStatus[key] === "Online"
                                    ? "cell-online"
                                    : "";

                                return (
                                    <td
                                        key={dayIndex}
                                        rowSpan={rowSpan}
                                        colSpan={colSpan}
                                        className={`cell ${selectedCells.has(key) ? "cell-selected" : ""}
                                                   ${statusClass}
                                                   ${isAnchor ? "cell-merged" : ""}`}
                                        onClick={() => toggleCellSelection(key)}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            handleStatusChange(key, "F2F");
                                        }}
                                        onDoubleClick={() => handleStatusChange(key, "Online")}
                                    >
                                        {(cellStatus[key] || selectedCells.has(key)) && renderDropdowns(key)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

const ActionButtons = ({ selectedCells, confirmAction, cancelMerge, unmergeCells }) => (
    <>
        {selectedCells.size > 0 && (
            <div className="mt-2">
                <OverlayTrigger placement="top" overlay={<Tooltip>Create/Merge selected cells</Tooltip>}>
                    <Button variant="success" className="me-2" onClick={confirmAction}>
                        <FontAwesomeIcon icon={faCheck} className="me-2" /> Create/Merge
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Unmerge selected cells</Tooltip>}>
                    <Button variant="danger" className="me-2" onClick={unmergeCells}>
                        <FontAwesomeIcon icon={faUndo} className="me-2" /> Unmerge
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Cancel selection</Tooltip>}>
                    <Button variant="secondary" onClick={cancelMerge}>
                        <FontAwesomeIcon icon={faTimes} className="me-2" /> Cancel
                    </Button>
                </OverlayTrigger>
            </div>
        )}
    </>
);

const Legend = () => (
    <Row className="mt-3">
        <Col className="d-flex justify-content-end align-items-center">
            <div className="legend-box cell-f2f me-2"></div>
            <span className="me-3">F2F</span>
            <div className="legend-box cell-online me-2"></div>
            <span className="me-3">Online</span>
            <div className="legend-box cell-conflict me-2"></div>
            <span className="me-3">Conflict</span>
            <div className="legend-box cell-merged me-2"></div>
            <span className="me-3">Merged</span>
            <div className="legend-box cell-selected me-2"></div>
            <span>Selected</span>
        </Col>
    </Row>
);

const SaveAndLoadButtons = ({ handleSaveSchedule, handleDownloadSchedule, handlePrintSchedule }) => (
    <Row className="mt-3">
        <Col className="d-flex justify-content-end">
            <OverlayTrigger placement="top" overlay={<Tooltip>Save the current schedule</Tooltip>}>
                <Button variant="primary" className="me-2" onClick={handleSaveSchedule}>
                    <FontAwesomeIcon icon={faSave} className="me-2" /> Save
                </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={<Tooltip>Download as PDF</Tooltip>}>
                <Button variant="secondary" className="me-2" onClick={handleDownloadSchedule}>
                    <FontAwesomeIcon icon={faDownload} className="me-2" /> Download
                </Button>
            </OverlayTrigger>
            <OverlayTrigger placement="top" overlay={<Tooltip>Print schedule</Tooltip>}>
                <Button variant="info" onClick={handlePrintSchedule}>
                    <FontAwesomeIcon icon={faPrint} className="me-2" /> Print
                </Button>
            </OverlayTrigger>
        </Col>
    </Row>
);

export default ClassSchedule;