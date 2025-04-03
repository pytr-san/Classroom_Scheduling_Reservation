import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, Dropdown, DropdownButton, Tooltip, OverlayTrigger, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck, faTimes, faDownload, faUndo, faSave, faPrint, faPlus } from "@fortawesome/free-solid-svg-icons";
import html2canvas from 'html2canvas';
import "./schedule.css";
import "./table.css";
const ClassSchedule = () => {
  const [selectedSection, setSelectedSection] = useState("Select Section");
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [mergedCells, setMergedCells] = useState({});
  const [cellStatus, setCellStatus] = useState({});
  const [cellDetails, setCellDetails] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState("BSIT");
  const [newSection, setNewSection] = useState("");
  const [courses, setCourses] = useState({
    BSIT: ["1A", "1B", "2A", "2B", "3A", "3B", "4A"],
    BSCPE: ["1", "2", "3", "4"],
    BSCS: ["1", "2", "A", "4"],
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCellKey, setSelectedCellKey] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2023-2024");
  const scheduleTableRef = useRef(null);

  const times = [
    "7:00 - 8:00", "8:00 - 9:00", "9:00 - 10:00", "10:00 - 11:00",
    "11:00 - 12:00", "12:00 - 1:00", "1:00 - 2:00", "2:00 - 3:00",
    "3:00 - 4:00", "4:00 - 5:00", "5:00 - 6:00", "6:00 - 7:00"
  ];

  const professors = ["Ms. Mangalindan", "Mr. Santos", "Mr.Villanueva"];
  const subjects = ["SAAD", "DSA", "IAS"];
  const rooms = ["Room 301", "Computer Lab", "Room 302"];
  const semesters = ["Semester 1", "Semester 2"];
  const schoolYears = ["2023-2024", "2024-2025"];

  useEffect(() => {
    const savedSchedule = localStorage.getItem('classSchedule');
    if (savedSchedule) {
      const { 
        mergedCells = {}, 
        cellStatus = {}, 
        cellDetails = {}, 
        selectedSection: savedSection,
        selectedSemester: savedSemester,
        selectedSchoolYear: savedSchoolYear
      } = JSON.parse(savedSchedule);
      setMergedCells(mergedCells);
      setCellStatus(cellStatus);
      setCellDetails(cellDetails);
      if (savedSection) setSelectedSection(savedSection);
      if (savedSemester) setSelectedSemester(savedSemester);
      if (savedSchoolYear) setSelectedSchoolYear(savedSchoolYear);
    }
  }, []);

  const toggleCellSelection = (key) => {
    setSelectedCells((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        newSelection.add(key);
      }
      return newSelection;
    });
  };

  const confirmMerge = () => {
    if (selectedCells.size > 1) {
      const cellsArray = Array.from(selectedCells);
      const [firstCell, ...restCells] = cellsArray;

      setMergedCells(prev => ({
        ...prev,
        [firstCell]: cellsArray
      }));

      cellsArray.forEach(cell => {
        setCellStatus(prev => ({
          ...prev,
          [cell]: 'Merged'
        }));
      });

      setCellDetails(prev => ({
        ...prev,
        [firstCell]: prev[firstCell] || {
          professor: professors[0],
          subject: subjects[0],
          room: rooms[0]
        }
      }));

      setSelectedCells(new Set());
    }
  };

  const cancelMerge = () => {
    setSelectedCells(new Set());
  };

  const unmergeCells = () => {
    const cellsToUnmerge = Array.from(selectedCells);
    
    setMergedCells(prev => {
      const newMergedCells = {...prev};
      cellsToUnmerge.forEach(cell => {
        const groupKey = Object.keys(newMergedCells).find(key => 
          newMergedCells[key].includes(cell)
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
    });

    setSelectedCells(new Set());
  };

  const handleSaveSchedule = () => {
    const scheduleData = {
      mergedCells,
      cellStatus,
      cellDetails,
      selectedSection,
      selectedSemester,
      selectedSchoolYear
    };
    localStorage.setItem('classSchedule', JSON.stringify(scheduleData));
    alert("Schedule saved successfully!");
  };

  const handleDownloadSchedule = () => {
    if (scheduleTableRef.current) {
      html2canvas(scheduleTableRef.current).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'class_schedule.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const markCellStatus = (key, status) => {
    setCellStatus(prevStatus => ({
      ...prevStatus,
      [key]: status
    }));
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
        setShowCreateModal={setShowCreateModal} 
        selectedSemester={selectedSemester}
        setSelectedSemester={setSelectedSemester}
        selectedSchoolYear={selectedSchoolYear}
        setSelectedSchoolYear={setSelectedSchoolYear}
        semesters={semesters}
        schoolYears={schoolYears}
      />
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
            />
          </div>
          <ActionButtons
            selectedCells={selectedCells}
            confirmMerge={confirmMerge}
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

      {/* Create Section Modal */}
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

      {/* Status Change Confirmation Modal */}
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
    </Container>
  );
};

const Header = ({ 
  setShowCreateModal, 
  selectedSemester, 
  setSelectedSemester, 
  selectedSchoolYear, 
  setSelectedSchoolYear,
  semesters,
  schoolYears
}) => (
  <Row className="mb-3 d-flex justify-content-between align-items-center">
    <Col className="d-flex align-items-center">
      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
      <h4>Class Schedule</h4>
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
      <Button variant="success" onClick={() => setShowCreateModal(true)}>
        <FontAwesomeIcon icon={faPlus} className="me-2" /> Create
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

const ScheduleTable = ({ times, selectedCells, mergedCells, cellStatus, cellDetails, toggleCellSelection, handleStatusChange, updateCellDetails, selectedSection, professors, subjects, rooms }) => (
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
            
            const isMerged = Object.entries(mergedCells).some(([firstCell, group]) => 
              group.includes(key) && key !== firstCell
            );
            if (isMerged) return null;
            
            const isFirstCellOfGroup = mergedCells[key] !== undefined;
            
            return (
              <td
                key={dayIndex}
                rowSpan={isFirstCellOfGroup ? mergedCells[key].length : 1}
                className={`cell ${selectedCells.has(key) ? "cell-selected" : ""}
                           ${cellStatus[key] === 'F2F' ? "cell-f2f" : ""}
                           ${cellStatus[key] === 'Online' ? "cell-online" : ""}
                           ${cellStatus[key] === 'Time Conflict' ? "cell-conflict" : ""}
                           ${isFirstCellOfGroup ? "cell-merged" : ""}`}
                onClick={() => toggleCellSelection(key)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleStatusChange(key, 'F2F');
                }}
                onDoubleClick={() => handleStatusChange(key, 'Online')}
              >
                {isFirstCellOfGroup && (
                  <div className="cell-content">
                    <DropdownButton
                      title={cellDetails[key]?.professor || "Select Professor"}
                      variant="secondary"
                      size="sm"
                      onSelect={(value) => updateCellDetails(key, 'professor', value)}
                      className="mb-1"
                    >
                      {professors.map((prof, index) => (
                        <Dropdown.Item key={index} eventKey={prof}>{prof}</Dropdown.Item>
                      ))}
                    </DropdownButton>
                    <DropdownButton
                      title={cellDetails[key]?.subject || "Select Subject"}
                      variant="secondary"
                      size="sm"
                      onSelect={(value) => updateCellDetails(key, 'subject', value)}
                      className="mb-1"
                    >
                      {subjects.map((subj, index) => (
                        <Dropdown.Item key={index} eventKey={subj}>{subj}</Dropdown.Item>
                      ))}
                    </DropdownButton>
                    <DropdownButton
                      title={cellDetails[key]?.room || "Select Room"}
                      variant="secondary"
                      size="sm"
                      onSelect={(value) => updateCellDetails(key, 'room', value)}
                    >
                      {rooms.map((room, index) => (
                        <Dropdown.Item key={index} eventKey={room}>{room}</Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </div>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </Table>
);

const ActionButtons = ({ selectedCells, confirmMerge, cancelMerge, unmergeCells }) => (
  <>
    {selectedCells.size > 1 && (
      <div className="mt-2">
        <OverlayTrigger placement="top" overlay={<Tooltip>Merge selected cells</Tooltip>}>
          <Button variant="success" className="me-2" onClick={confirmMerge}>
            <FontAwesomeIcon icon={faCheck} className="me-2" /> Merge
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
      <OverlayTrigger placement="top" overlay={<Tooltip>Download as image</Tooltip>}>
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