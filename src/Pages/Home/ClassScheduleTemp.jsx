import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Table, Button, Dropdown, DropdownButton, Tooltip, OverlayTrigger, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faCheck, faTimes, faDownload, faUndo, faSave, faPrint, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios"; // Already present, kept for clarity
import { useLocation } from 'react-router-dom'; // Added as requested
import CreateScheduleModal from "./CreateScheduleModal";
import StatusChangeModal from "./StatusChangeModal";
import "./schedule.css";
import "./table.css";

const ClassSchedule = () => {
  const [selectedScheduleKey, setSelectedScheduleKey] = useState(null);
  const [selectedSection, setSelectedSection] = useState("Select Section");
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [mergedCells, setMergedCells] = useState({});
  const [cellStatus, setCellStatus] = useState({});
  const [cellDetails, setCellDetails] = useState({}); 
  const [allSchedules, setAllSchedules] = useState({});
  const [scheduleNames, setScheduleNames] = useState([]);
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

  const times = ["7:00 - 8:00", "8:00 - 9:00", "9:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 1:00", "1:00 - 2:00", "2:00 - 3:00", "3:00 - 4:00", "4:00 - 5:00", "5:00 - 6:00", "6:00 - 7:00"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [professors, setProfessors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const semesters = ["Semester 1", "Semester 2"];
  const schoolYears = ["2023-2024", "2024-2025"];


  const location = useLocation();
  const courseName = location.state?.courseName || '';
  const courseId = location.state?.courseId || '';
  const year = location.state?.year || '';
  const section = location.state?.section || '';

  const [course, setCourse] = useState(courseId);
  const [yearLevel, setYearLevel] = useState(year);

  useEffect(() => {
    const savedSchedules = localStorage.getItem("allSchedules");
    if (savedSchedules) {
      const parsedSchedules = JSON.parse(savedSchedules);
      setAllSchedules(parsedSchedules);
      setScheduleNames(Object.keys(parsedSchedules));
      if (!selectedScheduleKey && Object.keys(parsedSchedules).length > 0) {
        loadSchedule(Object.keys(parsedSchedules)[0]);
      }
    }
  }, []);

  useEffect(() => {
    detectConflicts();
  }, [mergedCells, cellDetails, selectedScheduleKey, allSchedules]);

  // Added API requests from your request
  useEffect(() => {
    // Fetch professors
    axios.get('http://localhost:8000/api/professors', { withCredentials: true })
      .then(res => {
        console.log("Professors Data:", res.data);
        setProfessors(res.data);
      })
      .catch(err => console.error('Error fetching professors:', err));

    // Fetch subjects based on course and yearLevel
    if (course && yearLevel) {
      axios.get('http://localhost:8000/api/subjects', {
        params: {
          course: course,
          yearLevel: yearLevel
        },
        withCredentials: true
      })
        .then(res => {
          console.log("Subjects Data:", res.data);
          setSubjects(res.data);
        })
        .catch(err => console.error('Error fetching subjects:', err));
    }

    // Fetch rooms
    axios.get('http://localhost:8000/api/rooms', { withCredentials: true })
      .then(res => {
        console.log("Rooms Data:", res.data);
        setRooms(res.data);
      })
      .catch(err => console.error('Error fetching rooms:', err));
  }, [course, yearLevel]);

  const saveScheduleToDB = async () => {
    if (selectedSection === "Select Section") return alert("Please select a section.");
    try {
      const [course, section] = selectedSection.split(" ");
      const schedules = Object.entries(mergedCells).flatMap(([anchorKey, group]) => {
        const [rowStart, colStart] = anchorKey.split("-").map(Number);
        const { rowSpan, colSpan } = group;
        return Array.from({ length: rowSpan * colSpan }, (_, i) => {
          const row = rowStart + Math.floor(i / colSpan);
          const col = colStart + (i % colSpan);
          const [timeStart, timeEnd] = times[row].split(" - ");
          const details = cellDetails[anchorKey] || {};
          return {
            year: selectedSchoolYear.split("-")[0],
            course,
            section,
            day: days[col],
            time_start: timeStart,
            time_end: timeEnd,
            semester: selectedSemester,
            mode: cellStatus[`${row}-${col}`] || "F2F",
            last_updated: new Date().toISOString(),
            faculty_id: professors.indexOf(details.professor) + 1 || null,
            student_id: null,
            room_id: rooms.indexOf(details.room) + 1 || null,
            course_id: subjects.indexOf(details.subject) + 1 || null,
          };
        });
      });
      if (!schedules.length) return alert("No schedule data to save.");
      const response = await axios.post("http://localhost:8000/api/schedules/save", { schedules }, { withCredentials: true });
      alert(response.data.message || "Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule.");
    }
  };

  const detectConflicts = () => {
    if (!selectedScheduleKey || !allSchedules[selectedScheduleKey]) return;
    const currentSchedule = allSchedules[selectedScheduleKey];
    const newConflicts = [];
    const currentEntries = Object.entries(currentSchedule.mergedCells).flatMap(([anchorKey, group]) => {
      const [rowStart, colStart] = anchorKey.split("-").map(Number);
      const details = currentSchedule.cellDetails[anchorKey] || {};
      return Array.from({ length: group.rowSpan * group.colSpan }, (_, i) => ({
        time: times[rowStart + Math.floor(i / group.colSpan)],
        day: days[colStart + (i % group.colSpan)],
        professor: details.professor,
        room: details.room,
        section: currentSchedule.selectedSection,
      }));
    });

    Object.entries(allSchedules).forEach(([scheduleKey, schedule]) => {
      if (scheduleKey === selectedScheduleKey) return;
      Object.entries(schedule.mergedCells).forEach(([anchorKey, group]) => {
        const [rowStart, colStart] = anchorKey.split("-").map(Number);
        const details = schedule.cellDetails[anchorKey] || {};
        Array.from({ length: group.rowSpan * group.colSpan }, (_, i) => {
          const otherTime = times[rowStart + Math.floor(i / group.colSpan)];
          const otherDay = days[colStart + (i % group.colSpan)];
          currentEntries.forEach(entry => {
            if (entry.day === otherDay && entry.time === otherTime) {
              if (entry.professor === details.professor) newConflicts.push({
                type: "Professor",
                professor: details.professor,
                time: otherTime,
                day: otherDay,
                section1: entry.section,
                section2: schedule.selectedSection,
              });
              if (entry.room === details.room) newConflicts.push({
                type: "Room",
                room: details.room,
                time: otherTime,
                day: otherDay,
                section1: entry.section,
                section2: schedule.selectedSection,
              });
            }
          });
        });
      });
    });
    setConflicts(newConflicts);
  };

  const saveCurrentSchedule = () => {
    if (selectedSection === "Select Section") return alert("Please select a section.");
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
      const updated = { ...prev, [scheduleKey]: scheduleData };
      localStorage.setItem("allSchedules", JSON.stringify(updated));
      return updated;
    });
    if (!scheduleNames.includes(scheduleKey)) setScheduleNames(prev => [...prev, scheduleKey]);
    saveScheduleToDB();
  };

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

  const deleteSchedule = (scheduleKey) => {
    if (!window.confirm(`Delete schedule for ${scheduleKey}?`)) return;
    setAllSchedules(prev => {
      const updated = { ...prev };
      delete updated[scheduleKey];
      localStorage.setItem("allSchedules", JSON.stringify(updated));
      return updated;
    });
    setScheduleNames(prev => prev.filter(name => name !== scheduleKey));
    if (selectedScheduleKey === scheduleKey) {
      setSelectedScheduleKey(null);
      setMergedCells({});
      setCellStatus({});
      setCellDetails({});
      setSelectedSection("Select Section");
      setSelectedCells(new Set());
    }
  };

  const toggleCellSelection = (key) => setSelectedCells(prev => new Set(prev.has(key) ? [...prev].filter(k => k !== key) : [...prev, key]));

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


      // CHANGED
      setCellDetails(prev => ({
        ...prev,
        [firstCell]: prev[firstCell] || {
          professor: professors[0] ? professors[0].name : '',
          subject: subjects[0] ? subjects[0].subject_name : '',
          room: rooms[0] ? rooms[0].room_name : ''
        }
      }));//CHANGED

      setSelectedCells(new Set());
    }

    if (selectedCells.size < 2) return alert("Please select at least two cells.");
    const cellsArray = Array.from(selectedCells);
    const cellIndices = cellsArray.map(key => key.split("-").map(Number));
    const [minRow, maxRow, minCol, maxCol] = [
      Math.min(...cellIndices.map(c => c[0])),
      Math.max(...cellIndices.map(c => c[0])),
      Math.min(...cellIndices.map(c => c[1])),
      Math.max(...cellIndices.map(c => c[1])),
    ];
    if (cellsArray.length !== (maxRow - minRow + 1) * (maxCol - minCol + 1)) {
      alert("Please select a contiguous rectangular block.");
      setSelectedCells(new Set());
      return;
    }
    const anchorCell = `${minRow}-${minCol}`;
    setMergedCells(prev => ({
      ...prev,
      [anchorCell]: {
        cells: cellsArray,
        rowSpan: maxRow - minRow + 1,
        colSpan: maxCol - minCol + 1,
        minRow,
        maxRow,
        minCol,
        maxCol,
      },
    }));
    cellsArray.forEach(cell => setCellStatus(prev => ({ ...prev, [cell]: "Merged" })));
    setCellDetails(prev => ({
      ...prev,
      [anchorCell]: prev[anchorCell] || {
        professor: professors.length > 0 ? professors[0] : "No Professor",
        subject: subjects.length > 0 ? subjects[0] : "No Subject",
        room: rooms.length > 0 ? rooms[0] : "No Room"
      }
    }));
    
    setSelectedCells(new Set());
  };

  const cancelMerge = () => setSelectedCells(new Set());

  const unmergeCells = () => {
    const cellsToUnmerge = Array.from(selectedCells);
    setMergedCells(prev => {
      const newMergedCells = { ...prev };
      cellsToUnmerge.forEach(cell => {
        const groupKey = Object.keys(newMergedCells).find(key => newMergedCells[key].cells.includes(cell));
        if (groupKey) delete newMergedCells[groupKey];
      });
      return newMergedCells;
    });
    cellsToUnmerge.forEach(cell => setCellStatus(prev => ({ ...prev, [cell]: "" })));
    setSelectedCells(new Set());
  };

  const handleDownloadSchedule = () => {
    if (scheduleTableRef.current) {
      html2canvas(scheduleTableRef.current, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
        const ratio = Math.min(pdf.internal.pageSize.getWidth() / canvas.width, pdf.internal.pageSize.getHeight() / canvas.height);
        pdf.addImage(imgData, "PNG",
          (pdf.internal.pageSize.getWidth() - canvas.width * ratio) / 2,
          (pdf.internal.pageSize.getHeight() - canvas.height * ratio) / 2,
          canvas.width * ratio,
          canvas.height * ratio
        );
        pdf.save("class_schedule.pdf");
      });
    }
  };

  const handlePrintSchedule = () => window.print();

  const markCellStatus = (key, status) => {
    const groupKey = Object.keys(mergedCells).find(anchorKey => mergedCells[anchorKey].cells.includes(key));
    setCellStatus(prev => ({
      ...prev,
      ...(groupKey ? Object.fromEntries(mergedCells[groupKey].cells.map(cell => [cell, status])) : { [key]: status }),
    }));
  };

  const updateCellDetails = (key, detailType, value) => setCellDetails(prev => ({ ...prev, [key]: { ...prev[key], [detailType]: value } }));

  const handleCreateSchedule = () => {
    if (!newSection.trim()) return alert("Please enter a section name");
    const sectionKey = `${newCourse} ${newSection}`;
    const scheduleKey = `${sectionKey}-${selectedSemester}-${selectedSchoolYear}`;
    const newSchedule = {
      mergedCells: {},
      cellStatus: {},
      cellDetails: {},
      selectedSection: sectionKey,
      selectedSemester,
      selectedSchoolYear,
    };
    setAllSchedules(prev => {
      const updated = { ...prev, [scheduleKey]: newSchedule };
      localStorage.setItem("allSchedules", JSON.stringify(updated));
      return updated;
    });
    setScheduleNames(prev => [...new Set([...prev, scheduleKey])]); // Avoid duplicates
    setSelectedScheduleKey(scheduleKey);
    setSelectedSection(sectionKey);
    setMergedCells({});
    setCellStatus({});
    setCellDetails({});
    setSelectedCells(new Set());
    setNewSection("");
    setShowCreateModal(false);
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
      <Row className="mb-3">
        <Col>
          <DropdownButton title={selectedScheduleKey || "Select Schedule"} variant="outline-primary" className="w-100">
            {scheduleNames.map(name => (
              <Dropdown.Item key={name} onClick={() => loadSchedule(name)} active={selectedScheduleKey === name}>
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
      {conflicts.length > 0 && (
        <Row className="mb-3">
          <Col>
            <Alert variant="warning">
              <Alert.Heading>Schedule Conflicts Detected!</Alert.Heading>
              <ul>
                {conflicts.map((conflict, index) => (
                  <li key={index}>
                    {conflict.type} conflict: {conflict.type === "Professor"
                      ? `${conflict.professor} is scheduled in both ${conflict.section1} and ${conflict.section2}`
                      : `${conflict.room} is booked by both ${conflict.section1} and ${conflict.section2}`} on {conflict.day} at {conflict.time}
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

      <CreateScheduleModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        newCourse={newCourse}
        setNewCourse={setNewCourse}
        newSection={newSection}
        setNewSection={setNewSection}
        courses={courses}
        handleCreateSchedule={handleCreateSchedule}
      />
      <StatusChangeModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        selectedStatus={selectedStatus}
        confirmStatusChange={confirmStatusChange}
      />
    </Container>
  );
};

const Header = ({ setShowCreateModal, selectedSemester, setSelectedSemester, selectedSchoolYear, setSelectedSchoolYear, semesters, schoolYears }) => (
  <Row className="mb-3 d-flex justify-content-between align-items-center">
    <Col className="d-flex align-items-center">
      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
      <h4>Class Schedule</h4>
    </Col>
    <Col className="d-flex justify-content-end">
      <DropdownButton title={selectedSemester} variant="secondary" className="me-2" onSelect={(key) => setSelectedSemester(semesters[key])}>
        {semesters.map((semester, index) => <Dropdown.Item key={index} eventKey={index} active={selectedSemester === semester}>{semester}</Dropdown.Item>)}
      </DropdownButton>
      <DropdownButton title={selectedSchoolYear} variant="secondary" className="me-2" onSelect={(key) => setSelectedSchoolYear(schoolYears[key])}>
        {schoolYears.map((year, index) => <Dropdown.Item key={index} eventKey={index} active={selectedSchoolYear === year}>{year}</Dropdown.Item>)}
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
    <div className="text-muted">{selectedSemester} • {selectedSchoolYear}</div>
  </div>
);

const CourseSelector = ({ courses, setSelectedSection, selectedSection }) => (
  <>
    <h5>Select Course & Section</h5>
    {Object.entries(courses).map(([course, sections]) => (
      <DropdownButton key={course} title={course} variant="secondary" className="mb-3 w-100 course-dropdown" onSelect={(section) => setSelectedSection(`${course} ${section}`)}>
        {sections.map((section) => (
          <Dropdown.Item key={`${course}-${section}`} eventKey={section} active={selectedSection === `${course} ${section}`}>{course} {section}</Dropdown.Item>
        ))}
      </DropdownButton>
    ))}
  </>
);

const ScheduleTable = ({ times, selectedCells, mergedCells, cellStatus, cellDetails, toggleCellSelection, handleStatusChange, updateCellDetails, selectedSection, professors, subjects, rooms }) => (
  <div className="table-container">
    <Table bordered size="sm" className="text-center custom-schedule-table">
      <thead className="table-header-green">
        <tr><th className="time-header">Time</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>
      </thead>
      <tbody>
        {times.map((time, timeIndex) => (
          <tr key={timeIndex}>
            <td className="time-cell">{time}</td>
            {Array.from({ length: 6 }).map((_, dayIndex) => {
              const key = `${timeIndex}-${dayIndex}`;
              let isMerged = false, isAnchor = false, rowSpan = 1, colSpan = 1;
              for (const [anchorKey, group] of Object.entries(mergedCells)) {
                const { cells, minRow, maxRow, minCol, maxCol } = group;
                if (timeIndex >= minRow && timeIndex <= maxRow && dayIndex >= minCol && dayIndex <= maxCol) {
                  if (key === anchorKey) { isAnchor = true; rowSpan = maxRow - minRow + 1; colSpan = maxCol - minCol + 1; } else { isMerged = true; break; }
                }
              }
              if (isMerged) return null;
              const statusClass = cellStatus[key] === "F2F" ? "cell-f2f" : cellStatus[key] === "Online" ? "cell-online" : cellStatus[key] === "Time Conflict" ? "cell-conflict" : "";
              return (
                <td key={dayIndex} rowSpan={rowSpan} colSpan={colSpan} className={`cell ${selectedCells.has(key) ? "cell-selected" : ""} ${statusClass} ${isAnchor ? "cell-merged" : ""}`}
                  onClick={() => toggleCellSelection(key)} onContextMenu={(e) => { e.preventDefault(); handleStatusChange(key, "F2F"); }} onDoubleClick={() => handleStatusChange(key, "Online")}>
                  {isAnchor && (
                    <div className="cell-content">
                    <DropdownButton title={cellDetails[key]?.professor?.name || "Select Professor"} variant="secondary" size="sm" onSelect={(value) => updateCellDetails(key, "professor", value)} className="mb-1">
  {professors.map((prof, index) => (
    <Dropdown.Item key={index} eventKey={prof.name}>{prof.name}</Dropdown.Item>
  ))}
</DropdownButton>

<DropdownButton title={cellDetails[key]?.subject?.title || "Select Subject"} variant="secondary" size="sm" onSelect={(value) => updateCellDetails(key, "subject", value)} className="mb-1">
  {subjects.map((subj, index) => (
    <Dropdown.Item key={index} eventKey={subj.title}>{subj.title}</Dropdown.Item>
  ))}
</DropdownButton>

<DropdownButton title={cellDetails[key]?.room?.number || "Select Room"} variant="secondary" size="sm" onSelect={(value) => updateCellDetails(key, "room", value)}>
  {rooms.map((room, index) => (
    <Dropdown.Item key={index} eventKey={room.number}>{room.number}</Dropdown.Item>
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

const ActionButtons = ({ selectedCells, confirmMerge, cancelMerge, unmergeCells }) => (
  selectedCells.size > 1 && (
    <div className="mt-2">
      <OverlayTrigger placement="top" overlay={<Tooltip>Merge selected cells</Tooltip>}>
        <Button variant="success" className="me-2" onClick={confirmMerge}><FontAwesomeIcon icon={faCheck} className="me-2" /> Merge</Button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Unmerge selected cells</Tooltip>}>
        <Button variant="danger" className="me-2" onClick={unmergeCells}><FontAwesomeIcon icon={faUndo} className="me-2" /> Unmerge</Button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Cancel selection</Tooltip>}>
        <Button variant="secondary" onClick={cancelMerge}><FontAwesomeIcon icon={faTimes} className="me-2" /> Cancel</Button>
      </OverlayTrigger>
    </div>
  )
);

const Legend = () => (
  <Row className="mt-3">
    <Col className="d-flex justify-content-end align-items-center">
      <div className="legend-box cell-f2f me-2"></div><span className="me-3">F2F</span>
      <div className="legend-box cell-online me-2"></div><span className="me-3">Online</span>
      <div className="legend-box cell-conflict me-2"></div><span className="me-3">Conflict</span>
      <div className="legend-box cell-merged me-2"></div><span className="me-3">Merged</span>
      <div className="legend-box cell-selected me-2"></div><span>Selected</span>
    </Col>
  </Row>
);

const SaveAndLoadButtons = ({ handleSaveSchedule, handleDownloadSchedule, handlePrintSchedule }) => (
  <Row className="mt-3">
    <Col className="d-flex justify-content-end">
      <OverlayTrigger placement="top" overlay={<Tooltip>Save the current schedule</Tooltip>}>
        <Button variant="primary" className="me-2" onClick={handleSaveSchedule}><FontAwesomeIcon icon={faSave} className="me-2" /> Save</Button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Download as PDF</Tooltip>}>
        <Button variant="secondary" className="me-2" onClick={handleDownloadSchedule}><FontAwesomeIcon icon={faDownload} className="me-2" /> Download</Button>
      </OverlayTrigger>
      <OverlayTrigger placement="top" overlay={<Tooltip>Print schedule</Tooltip>}>
        <Button variant="info" onClick={handlePrintSchedule}><FontAwesomeIcon icon={faPrint} className="me-2" /> Print</Button>
      </OverlayTrigger>
    </Col>
  </Row>
);

export default ClassSchedule;