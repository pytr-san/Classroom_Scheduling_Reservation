import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, Dropdown, DropdownButton, Tooltip, OverlayTrigger, Modal, Form, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck, faTimes, faDownload, faUndo, faSave, faPrint, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";
import "./schedule.css";
import "./table.css";


const ClassSchedule = () => {
  // State for the currently selected schedule
 
  const [selectedScheduleKey, setSelectedScheduleKey] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Select Section");
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [mergedCells, setMergedCells] = useState({});
  const [cellStatus, setCellStatus] = useState({});
  const [cellDetails, setCellDetails] = useState({});
  
  // State for all schedules
  const [allSchedules, setAllSchedules] = useState({});
  const [scheduleNames, setScheduleNames] = useState([]);
  
  // Other state
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
  const [conflicts, setConflicts] = useState([]);
  const scheduleTableRef = useRef(null);

  const times = [
    "7:00 - 8:00", "8:00 - 9:00", "9:00 - 10:00", "10:00 - 11:00",
    "11:00 - 12:00", "12:00 - 1:00", "1:00 - 2:00", "2:00 - 3:00",
    "3:00 - 4:00", "4:00 - 5:00", "5:00 - 6:00", "6:00 - 7:00"
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [professors, setProfessors] = useState([]); 
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const semesters = ["Semester 1", "Semester 2"];
  const schoolYears = ["2023-2024", "2024-2025"];

  // Load all schedules from localStorage on component mount
  // useEffect(() => {
  //   const savedSchedules = localStorage.getItem("allSchedules");
  //   if (savedSchedules) {
  //     const parsedSchedules = JSON.parse(savedSchedules);
  //     setAllSchedules(parsedSchedules);
  //     setScheduleNames(Object.keys(parsedSchedules));
      
  //     // Load the first schedule by default if none is selected
  //     if (!selectedScheduleKey && Object.keys(parsedSchedules).length > 0) {
  //       const firstKey = Object.keys(parsedSchedules)[0];
  //       loadSchedule(firstKey);
  //     }
  //   }
  // }, []);

  // Detect conflicts whenever the schedule changes
  useEffect(() => {
    detectConflicts();
  }, [mergedCells, cellDetails, selectedScheduleKey, allSchedules]);

  // Save schedule to database
  const saveScheduleToDB = async () => {
    if (selectedSection === "Select Section") {
      alert("Please select a section before saving.");
      return;
    }

    try {
      const [course, section] = selectedSection.split(" ");
      const schedules = [];
      const currentDate = new Date().toISOString();

      Object.entries(mergedCells).forEach(([anchorKey, group]) => {
        const [rowStart, colStart] = anchorKey.split("-").map(Number);
        const { rowSpan, colSpan } = group;

        for (let row = rowStart; row < rowStart + rowSpan; row++) {
          for (let col = colStart; col < colStart + colSpan; col++) {
            const key = `${row}-${col}`;
            const [timeStart, timeEnd] = times[row].split(" - ");
            const details = cellDetails[anchorKey] || {};

            schedules.push({
              year: selectedSchoolYear.split("-")[0],
              course,
              section,
              day: days[col],
              time_start: timeStart,
              time_end: timeEnd,
              semester: selectedSemester,
              mode: cellStatus[key] || "F2F",
              last_updated: currentDate,
              faculty_id: professors.indexOf(details.professor) + 1 || null,
              student_id: null,
              room_id: rooms.indexOf(details.room) + 1 || null,
              course_id: subjects.indexOf(details.subject) + 1 || null,
            });
          }
        }
      });

      if (schedules.length === 0) {
        alert("No schedule data to save. Please add some classes.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8000/api/schedules/save",
        { schedules },
        { withCredentials: true }
      );
      
      alert(response.data.message || "Schedule saved to database successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule to database");
    }
  };

  // Detect time conflicts across all schedules
  const detectConflicts = () => {
    if (!selectedScheduleKey) return;

    const currentSchedule = allSchedules[selectedScheduleKey];
    if (!currentSchedule) return;

    const newConflicts = [];
    const currentEntries = [];

    // Get all entries from current schedule
    Object.entries(currentSchedule.mergedCells).forEach(([anchorKey, group]) => {
      const [rowStart, colStart] = anchorKey.split("-").map(Number);
      const details = currentSchedule.cellDetails[anchorKey] || {};

      for (let row = rowStart; row < rowStart + group.rowSpan; row++) {
        for (let col = colStart; col < colStart + group.colSpan; col++) {
          currentEntries.push({
            time: times[row],
            day: days[col],
            professor: details.professor,
            room: details.room,
            section: currentSchedule.selectedSection,
          });
        }
      }
    });

    // Check against all other schedules
    Object.entries(allSchedules).forEach(([scheduleKey, schedule]) => {
      if (scheduleKey === selectedScheduleKey) return;

      Object.entries(schedule.mergedCells).forEach(([anchorKey, group]) => {
        const [rowStart, colStart] = anchorKey.split("-").map(Number);
        const details = schedule.cellDetails[anchorKey] || {};

        for (let row = rowStart; row < rowStart + group.rowSpan; row++) {
          for (let col = colStart; col < colStart + group.colSpan; col++) {
            const otherTime = times[row];
            const otherDay = days[col];

            // Check if this overlaps with any entry in current schedule
            currentEntries.forEach(entry => {
              if (entry.day === otherDay && entry.time === otherTime) {
                // Check for professor conflict
                if (entry.professor === details.professor) {
                  newConflicts.push({
                    type: "Professor",
                    professor: details.professor,
                    time: otherTime,
                    day: otherDay,
                    section1: entry.section,
                    section2: schedule.selectedSection,
                  });
                }
                
                // Check for room conflict
                if (entry.room === details.room) {
                  newConflicts.push({
                    type: "Room",
                    room: details.room,
                    time: otherTime,
                    day: otherDay,
                    section1: entry.section,
                    section2: schedule.selectedSection,
                  });
                }
              }
            });
          }
        }
      });
    });

    setConflicts(newConflicts);
  };

  // Save current schedule to the collection
  const saveCurrentSchedule = () => {
    if (!selectedSection || selectedSection === "Select Section") {
      alert("Please select a section before saving.");
      return;


    }

    const scheduleData = {
      mergedCells,
      cellStatus,
      cellDetails,
      selectedSection,
      selectedSemester,
      selectedSchoolYear,
    };

    const scheduleKey = `${selectedSection}-${selectedSemester}-${selectedSchoolYear}`;
    
    setAllSchedules(prev => {
      const updated = {...prev, [scheduleKey]: scheduleData};
      localStorage.setItem("allSchedules", JSON.stringify(updated));
      return updated;
    });

    if (!scheduleNames.includes(scheduleKey)) {
      setScheduleNames(prev => [...prev, scheduleKey]);
    }

    // Also save to database
    saveScheduleToDB();
  };

  // Load a specific schedule
  const loadSchedule = (scheduleKey) => {
    const schedule = allSchedules[scheduleKey];
    if (!schedule) return;

    setSelectedScheduleKey(scheduleKey);
    setMergedCells(schedule.mergedCells || {});
    setCellStatus(schedule.cellStatus || {});
    setCellDetails(schedule.cellDetails || {});
    setSelectedSection(schedule.selectedSection || "Select Section");
    setSelectedSemester(schedule.selectedSemester || "Semester 1");
    setSelectedSchoolYear(schedule.selectedSchoolYear || "2023-2024");
    setSelectedCells(new Set());
  };

  // Delete a schedule
  const deleteSchedule = (scheduleKey) => {
    if (!window.confirm(`Delete schedule for ${scheduleKey}?`)) return;
    
    setAllSchedules(prev => {
      const updated = {...prev};
      delete updated[scheduleKey];
      localStorage.setItem("allSchedules", JSON.stringify(updated));
      return updated;
    });

    setScheduleNames(prev => prev.filter(name => name !== scheduleKey));
    
    if (selectedScheduleKey === scheduleKey) {
      // Clear current schedule if we're deleting the active one
      setSelectedScheduleKey(null);
      setMergedCells({});
      setCellStatus({});
      setCellDetails({});
      setSelectedSection("Select Section");
      setSelectedCells(new Set());
    }
  };

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
    if (selectedCells.size < 2) {
      alert("Please select at least two cells to merge.");
      return;
    }

    const cellsArray = Array.from(selectedCells);
    const cellIndices = cellsArray.map((key) => {
      const [row, col] = key.split("-").map(Number);
      return { key, row, col };
    });

    const minRow = Math.min(...cellIndices.map((cell) => cell.row));
    const maxRow = Math.max(...cellIndices.map((cell) => cell.row));
    const minCol = Math.min(...cellIndices.map((cell) => cell.col));
    const maxCol = Math.max(...cellIndices.map((cell) => cell.col));

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

    setMergedCells((prev) => ({
      ...prev,
      [anchorCell]: {
        cells: cellsArray,
        rowSpan,
        colSpan,
        minRow,
        maxRow,
        minCol,
        maxCol,
      },
    }));

    cellsArray.forEach((cell) => {
      setCellStatus((prev) => ({
        ...prev,
        [cell]: "Merged",
      }));
    });

    setCellDetails((prev) => ({
      ...prev,
      [anchorCell]: prev[anchorCell] || {
        professor: professors[0],
        subject: subjects[0],
        room: rooms[0],
      },
    }));

    setSelectedCells(new Set());
  };

  const cancelMerge = () => {
    setSelectedCells(new Set());
  };

  const unmergeCells = () => {
    const cellsToUnmerge = Array.from(selectedCells);

    setMergedCells((prev) => {
      const newMergedCells = { ...prev };
      cellsToUnmerge.forEach((cell) => {
        const groupKey = Object.keys(newMergedCells).find((key) =>
          newMergedCells[key].cells.includes(cell)
        );

        if (groupKey) {
          delete newMergedCells[groupKey];
        }
      });
      return newMergedCells;
    });

    cellsToUnmerge.forEach((cell) => {
      setCellStatus((prev) => ({
        ...prev,
        [cell]: "",
      }));
    });

    setSelectedCells(new Set());
  };

  const handleDownloadSchedule = () => {
    if (scheduleTableRef.current) {
      html2canvas(scheduleTableRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "px",
          format: "a4",
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

        pdf.addImage(imgData, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);
        pdf.save("class_schedule.pdf");
      });
    }
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const markCellStatus = (key, status) => {
    const groupKey = Object.keys(mergedCells).find((anchorKey) =>
      mergedCells[anchorKey].cells.includes(key)
    );

    if (groupKey) {
      const groupCells = mergedCells[groupKey].cells;
      setCellStatus((prevStatus) => {
        const updatedStatus = { ...prevStatus };
        groupCells.forEach((cell) => {
          updatedStatus[cell] = status;
        });
        return updatedStatus;
      });
    } else {
      setCellStatus((prevStatus) => ({
        ...prevStatus,
        [key]: status,
      }));
    }
  };

  const updateCellDetails = (key, detailType, value) => {
    setCellDetails((prevDetails) => ({
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
      [newCourse]: [...(courses[newCourse] || []), newSection],
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
      
      {/* Schedule selector dropdown */}
      <Row className="mb-3">
        <Col>
          <DropdownButton
            title={selectedScheduleKey || "Select Schedule"}
            variant="outline-primary"
            className="w-100"
          >
            {scheduleNames.map(name => (
              <Dropdown.Item 
                key={name} 
                onClick={() => loadSchedule(name)}
                active={selectedScheduleKey === name}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span>{name}</span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSchedule(name);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-danger" />
                  </Button>
                </div>
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
      </Row>
      
      {/* Conflict alerts */}
      {conflicts.length > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="warning">
              <Alert.Heading>Schedule Conflicts Detected!</Alert.Heading>
              <ul>
                {conflicts.map((conflict, index) => (
                  <li key={index}>
                    {conflict.type} conflict: {conflict.type === "Professor" ? 
                      `${conflict.professor} is scheduled in both ${conflict.section1} and ${conflict.section2}` : 
                      `${conflict.room} is booked by both ${conflict.section1} and ${conflict.section2}`} 
                    on {conflict.day} at {conflict.time}
                  </li>
                ))}
              </ul>
            </Alert>
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
        handleSaveSchedule={saveCurrentSchedule}
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
                {Object.keys(courses).map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
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
  schoolYears,
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
        onSelect={(section) => setSelectedSection(`${course} ${section}`)}
      >
        {sections.map((section) => (
          <Dropdown.Item
            key={`${course}-${section}`}
            eventKey={section}
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
  conflicts, // Add conflicts prop

  
}) => {
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
                  const [anchorRow, anchorCol] = anchorKey.split("-").map(Number);

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

                const statusClass =
                  cellStatus[key] === "F2F"
                    ? "cell-f2f"
                    : cellStatus[key] === "Online"
                    ? "cell-online"
                    : cellStatus[key] === "Time Conflict"
                    ? "cell-conflict"
                    : "";

                return (
                  <td
                    key={dayIndex}
                    rowSpan={rowSpan}
                    colSpan={colSpan}
                    className={`cell ${
                      selectedCells.has(key) ? "cell-selected" : ""
                    } ${statusClass} ${isAnchor ? "cell-merged" : ""}`}
                    onClick={() => toggleCellSelection(key)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleStatusChange(key, "F2F");
                    }}
                    onDoubleClick={() => handleStatusChange(key, "Online")}
                  >
                    {isAnchor && (
                      <div className="cell-content">
                        <DropdownButton
                          title={
                            cellDetails[key]?.professor || "Select Professor"
                          }
                          variant="secondary"
                          size="sm"
                          onSelect={(value) =>
                            updateCellDetails(key, "professor", value)
                          }
                          className="mb-1"
                        >
                          {professors.map((prof, index) => (
                            <Dropdown.Item key={index} eventKey={prof}>
                              {prof}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        <DropdownButton
                          title={cellDetails[key]?.subject || "Select Subject"}
                          variant="secondary"
                          size="sm"
                          onSelect={(value) =>
                            updateCellDetails(key, "subject", value)
                          }
                          className="mb-1"
                        >
                          {subjects.map((subj, index) => (
                            <Dropdown.Item key={index} eventKey={subj}>
                              {subj}
                            </Dropdown.Item>
                          ))}
                        </DropdownButton>
                        <DropdownButton
                          title={cellDetails[key]?.room || "Select Room"}
                          variant="secondary"
                          size="sm"
                          onSelect={(value) =>
                            updateCellDetails(key, "room", value)
                          }
                        >
                          {rooms.map((room, index) => (
                            <Dropdown.Item key={index} eventKey={room}>
                              {room}
                            </Dropdown.Item>
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
    </div>
  );
};

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

const SaveAndLoadButtons = ({
  handleSaveSchedule,
  handleDownloadSchedule,
  handlePrintSchedule,
}) => (
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