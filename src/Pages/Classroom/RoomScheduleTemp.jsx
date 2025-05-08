import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import { Button } from "react-bootstrap";
import  axiosInstance  from '../../axios.jsx';
import "./RoomScheduleTemp.css";
import AssignModal from "./AssignModal.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import toast from "react-hot-toast";
import { FaExclamationTriangle } from "react-icons/fa";

const RoomScheduleTemp = () => {
  
  const tableRef = useRef(null);
  const pdfContainerRef = useRef(null);
  const [printMode, setPrintMode] = useState(false);
  const [downloading, setDownloading] = useState(false);


  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [roomHeaders, setRoomHeaders] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [courses, setCourses] = useState([]);

  // const [selectedDate,   ] = useState(new Date());

  // State for cell merging
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [endCell, setEndCell] = useState(null);
  const [mergedCells, setMergedCells] = useState({});
  const [selectedMergedCell, setSelectedMergedCell] = useState(null);

  // Modal for assigning proctor/subject
  const [subjects, setSubjects] = useState([]);
  const [proctors, setProctors] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/classrooms/list");
        setClassrooms(response.data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };
    fetchClassrooms();
  }, []);

  // Logic for handling mouse down, up, and enter for cell selection and merging
  const handleMouseDown = (row, col, tabId, roomName) => {
    setIsSelecting(true);
    setStartCell({ row, col, tabId, room_name: roomName});
    setEndCell(null);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting) {
      setEndCell({ row, col });
    }
  };

    // Fetch subjects and proctors (example)
    useEffect(() => {
      // Fetch professors
      axiosInstance.get('/api/professors')
        .then(res => {
          setProctors(res.data);
        })
        .catch(err => console.error('Error fetching professors:', err));

        axiosInstance.get('/classrooms/get-all-courses')
        .then(res => {
          setCourses(res.data);
        })
        .catch(err => {
          console.error('Failed to fetch courses:', err);
          setError('Could not load courses');
        });
      }, []);


      const yearNumberToString = (num) => {
        switch (parseInt(num)) {
          case 1: return '1st Year';
          case 2: return '2nd Year';
          case 3: return '3rd Year';
          case 4: return '4th Year';
          default: return '';
        }
      };
      
      useEffect(() => {
        if (!activeTab) return;
      
        const [courseName, year, section] = activeTab.split(" - ");
      
        const formattedYear = yearNumberToString(year);

        const matchedCourse = courses.find(c => c.course_name === courseName);
        if (!matchedCourse) return;
        
        const courseId = matchedCourse.course_id;

        if (!courseId) return;
        axiosInstance.get('/api/subjects', {
          params: {
            courseId,
            yearLevel: formattedYear,
          }
        })
        .then((res) => {
          setSubjects(res.data);
        })
        .catch((err) => console.error('Error fetching subjects:', err));
      }, [activeTab]);
      

      //save Schedule
      const saveScheduleByTab = () => {

        if (!schedules || schedules.length === 0) {
          toast.error("No schedules to save.");
          return;
        }
    
        const allSchedulesData = schedules.map((schedule) => {
          const tabData = {
            course: schedule.selectedCourse,
            year: schedule.selectedYear,
            section: schedule.selectedSection,
            rooms: [],
            mergedCells: {}, 
          };
    

          schedule.selectedRooms.forEach((room, roomIndex) => {
            const roomData = {
              room_name: room.room_name,
              time_slots: [], 
            };
    

            timeSlots.forEach((timeSlot, rowIndex) => {
         
              const mergedCell = isCellMerged(rowIndex, roomIndex, `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`);
              
              const cellKey = `${rowIndex}-${roomIndex}`;
              const cellData = {
                timeSlot,
                subject: mergedCell?.subject || '',  
                proctor: mergedCell?.proctor || '',  
                isMerged: !!mergedCell,  
                rowSpan: mergedCell?.rowSpan || 1,  
                startRow: mergedCell?.startRow ?? rowIndex,  
                day: mergedCell?.day || '',
              };
    
              if (mergedCell && mergedCell.startRow === rowIndex) {
                tabData.mergedCells[cellKey] = {
                  row: rowIndex,
                  col: roomIndex,
                  rowSpan: mergedCell.rowSpan,
                  subject: mergedCell.subject,
                  proctor: mergedCell.proctor,
                  day: mergedCell.day,
                };
              }
              
              roomData.time_slots.push(cellData);
            });
    
            tabData.rooms.push(roomData);
          });
    
          return tabData;
        });
    
        localStorage.setItem("schedules", JSON.stringify(allSchedulesData));
        toast.success("All schedules saved!");
      };
    
      

      useEffect(() => {
          const savedSchedules = JSON.parse(localStorage.getItem("schedules")) || [];
      
        if (savedSchedules.length > 0) {
          const restoredSchedules = savedSchedules.map((tab) => {
            const restoredRooms = tab.rooms.map((room, colIndex) => {
              const restoredTimeSlots = room.time_slots.map((timeSlot, rowIndex) => {
                const cellKey = `${rowIndex}-${colIndex}`;
                const mergedCell = tab.mergedCells?.[cellKey];
    
                if (mergedCell?.rowSpan) {
                  return {
                    ...timeSlot,
                    isMerged: true,
                    rowSpan: mergedCell.rowSpan,
                    subject: mergedCell.subject,
                    proctor: mergedCell.proctor,
                    day: mergedCell.day,
                    startRow: mergedCell.row,
                  };
                }
    
                return timeSlot;
              });
    
              return {
                room_name: room.room_name,
                time_slots: restoredTimeSlots,
              };
            });
    
            return {
              selectedCourse: tab.course,
              selectedYear: tab.year,
              selectedSection: tab.section,
              selectedRooms: restoredRooms,
              mergedCells: tab.mergedCells,
            };
          });
    
          setSchedules(restoredSchedules);
    
          // Set first tab
          const firstTab = savedSchedules[0];
          if (firstTab) {
            const firstTabName = `${firstTab.course} - ${firstTab.year} - ${firstTab.section}`;
            setActiveTab(firstTabName);
          }
    
          // Restore mergedCells
          const mergedMap = {};
          savedSchedules.forEach((tab) => {
            const tabId = `${tab.course} - ${tab.year} - ${tab.section}`;
            mergedMap[tabId] = Object.entries(tab.mergedCells || {}).map(([key, cell]) => ({
              startRow: cell.row,
              col: cell.col,
              rowSpan: cell.rowSpan,
              subject: cell.subject,
              proctor: cell.proctor,
              day: cell.day,
              room_name: tab.rooms[cell.col]?.room_name || "",
              tabId,
            }));
          });
          setMergedCells(mergedMap);
        }
      }, []);
    


  const handleAssignSubject = (assignmentData) => {
    const { subject, proctor, mergedCell, day } = assignmentData;
    let conflictingTab = null;
    // Check for conflicts: same room, same day, and overlapping time
    const hasConflict = Object.entries(mergedCells).some(([tabId, cells]) => {
      return cells.some(cell => {
        const sameRoom = cell.room_name === mergedCell.room_name; 
        const sameDay = cell.day === day; 

        const sameTime =
          (mergedCell.startRow >= cell.startRow && mergedCell.startRow < cell.startRow + cell.rowSpan) ||
          (mergedCell.startRow + mergedCell.rowSpan - 1 >= cell.startRow &&
            mergedCell.startRow + mergedCell.rowSpan - 1 < cell.startRow + cell.rowSpan) ||
          (mergedCell.startRow <= cell.startRow &&
            mergedCell.startRow + mergedCell.rowSpan - 1 >= cell.startRow + cell.rowSpan - 1);
            const conflict = sameRoom && sameDay && sameTime && tabId !== mergedCell.tabId;

            if (conflict) {
              conflictingTab = tabId; // Capture the tab of the conflict
            }
      
            return conflict;  
      });
    });

    if (hasConflict) {
      toast.error(`⚠️ Conflict: Room already booked on ${day} during that time in tab "${conflictingTab}".`);
      return;
    }
  
    // No conflict, assign subject and proctor
    setMergedCells((prev) => {
      const updated = { ...prev };
      const key = mergedCell.tabId;
  
      updated[key] = updated[key].map(cell =>
        cell.startRow === mergedCell.startRow && cell.col === mergedCell.col
          ? { ...cell, subject, proctor, day,room_name: cell.room_name || mergedCell.room_name }  // Assign values to the selected cell
          : cell
      );

      return updated;
    });
  
    setShowAssignModal(false); 
  };


  const handleMouseUp = () => {
    setIsSelecting(false);
    // Validate selection (if the selection is valid)
    if (!startCell || !endCell || startCell.col !== endCell.col) {
      return;
    }
  
    // Determine the start and end row based on the selection
    const startRow = Math.min(startCell.row, endCell.row);
    const endRow = Math.max(startCell.row, endCell.row);
    const key = startCell.tabId;  // This is the day
    const col = startCell.col;    // This is the room index
    const roomName = startCell.room_name;  // Track room name
    const timeRange = `${timeSlots[startRow]} - ${timeSlots[endRow]}`;  // Time range based on rows
    const day = startCell.day;  // Track day
  
    // Check for conflicts: same room, same day, and overlapping time
    const hasConflict = Object.entries(mergedCells).some(([otherTabId, cells]) => {
      return cells.some(cell => {
        const sameRoom = cell.room_name === roomName;  // Same room name
        const sameDay = cell.day === day;  // Same day
        const timeOverlap =
          (startRow >= cell.startRow && startRow < cell.startRow + cell.rowSpan) ||
          (endRow >= cell.startRow && endRow < cell.startRow + cell.rowSpan) ||
          (startRow <= cell.startRow && endRow >= cell.startRow + cell.rowSpan - 1);
  
        return sameRoom && sameDay && timeOverlap && otherTabId !== key;
      });
    });
  
    if (hasConflict) {
      // Conflict detected: same room, same day, and overlapping time
      toast.error(`⚠️ Conflict: This room is already booked on ${day} during that time.`);
      setStartCell(null);
      setEndCell(null);
      return;
    }
  
    // No conflict, proceed to add merged cell
    setMergedCells(prev => {
      const updated = { ...prev };
      updated[key] = updated[key] || [];
      updated[key].push({
        startRow,
        col,
        rowSpan: endRow - startRow + 1,
        tabId: key,
        timeRange,
        room_name: roomName,  // Track room name
        day,  // Track day
      });
      return updated;
    });
  
    // Clear the selected cells
    setStartCell(null);
    setEndCell(null);
  };
  
  
  

  const isCellMerged = (row, col, tabId) => {
    const merges = mergedCells[tabId] || [];
    return merges.find(m =>
      m.col === col &&
      row >= m.startRow &&
      row < m.startRow + m.rowSpan
    ) || null;
  };
  const cancelMerge = () => {
    setMergedCells((prev) => {
      const updated = { ...prev };
      const key = selectedMergedCell.tabId;
      updated[key] = updated[key].filter(
        (cell) => !(cell.startRow === selectedMergedCell.startRow && cell.col === selectedMergedCell.col)
      );
      return updated;
    });
    setShowAssignModal(false); // Close the modal if it's open
  }; 

  const handleMergedCellClick = (merged) => {
    setSelectedMergedCell(merged);
    setShowAssignModal(true);
  };


  

  const downloadPDF = async () => {

    if (!tableRef.current || !activeTab || !pdfContainerRef.current) {
      toast("No schedule data to download.",{
        icon: <FaExclamationTriangle color="orange" />,
      });
      return;
    }
    if (!selectedExam || !selectedSemester) {
      toast("Please select both Examination and Semester.", {
        icon: <FaExclamationTriangle color="orange" />,
      });
      return;
    }

    const highlighted = tableRef.current.querySelectorAll('.highlight-row');
    highlighted.forEach(el => el.classList.remove('highlight-row'));

    setDownloading(true);  
    setPrintMode(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(pdfContainerRef.current, {
      scale: 1.5,
      useCORS: true,
      scrollY: -window.scrollY, // fixes scroll offset issues
      backgroundColor: "#ffffff", // ensure white background if needed
    });

    highlighted.forEach(el => el.classList.add('highlight-row'));
    const imgData = canvas.toDataURL("image/jpeg", 0.7 );

    setPrintMode(false); 
    setDownloading(false);
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${activeTab}.pdf`);
  };
  
  const ClearSchedule = () => {
    const existingSchedules = JSON.parse(localStorage.getItem("schedules")) || [];
  
    if (existingSchedules.length === 0) {
      toast.error("There are no saved schedules to delete.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to clear all schedules?");
    if (!confirmed) return;
  
    localStorage.removeItem("schedules");
    setSchedules([]);
    setSelectedSemester(null);
    setSelectedExam(null);
    setMergedCells({});
    setSelectedMergedCell(null);
    toast.success("Schedules Deleted!");
  };
  

  const timeSlots = [
    "7:00 am - 7:30 am", "7:30 am - 8:00 am", "8:00 am - 8:30 am", "8:30 am - 9:00 am", 
    "9:00 am - 9:30 am", "9:30 am - 10:00 am", "10:00 am - 10:30 am", "10:30 am - 11:00 am", 
    "11:00 am - 11:30 am", "11:30 am - 12:00 pm", "12:00 pm - 12:30 pm", "12:30 pm - 1:00 pm", 
    "1:00 pm - 1:30 pm", "1:30 pm - 2:00 pm", "2:00 pm - 2:30 pm", "2:30 pm - 3:00 pm", 
    "3:00 pm - 3:30 pm", "3:30 pm - 4:00 pm", "4:00 pm - 4:30 pm", "4:30 pm - 5:00 pm", 
    "5:00 pm - 5:30 pm", "5:30 pm - 6:00 pm", "6:00 pm - 6:30 pm", "6:30 pm - 7:00 pm", 
    "7:00 pm - 7:30 pm", "7:30 pm - 8:00 pm", "8:00 pm - 8:30 pm"
  ];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleDeleteTab = (tabToDelete) => {
    // Delete tab from schedules
    const updatedSchedules = schedules.filter(schedule => {
      const name = `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`;
      return name !== tabToDelete;
    });
  
    // Update schedules
    setSchedules(updatedSchedules);
    localStorage.setItem("schedules", JSON.stringify(updatedSchedules));
  
    // If the deleted tab is the active one, set the active tab to the first one or null if no tabs left
    if (tabToDelete === activeTab && updatedSchedules.length > 0) {
      const firstTab = updatedSchedules[0];
      const firstTabName = `${firstTab.selectedCourse} - ${firstTab.selectedYear} - ${firstTab.selectedSection}`;
      setActiveTab(firstTabName);
    } else if (updatedSchedules.length === 0) {
      setActiveTab(null);
    }
  
    // Clear merged cells related to the deleted tab
    const updatedMergedCells = { ...mergedCells };
    const tabToDeleteMergedCellsKey = `${tabToDelete}`;
    delete updatedMergedCells[tabToDeleteMergedCellsKey]; // Remove merged cells for the deleted tab
    setMergedCells(updatedMergedCells);
  
    // Save updated merged cells to localStorage (optional, depending on your logic)
    localStorage.setItem("mergedCells", JSON.stringify(updatedMergedCells));
  };
  
  
  return (
    <div className="room-schedule-container">
      <div className="schedule-header">
      <Button variant="outline-secondary" 
        className="px-4"
       style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }} 
        onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left fs-5"></i>
      </Button>
        <h2>Examination Schedule</h2>
        <div className="right-controls">

          <button  onClick={saveScheduleByTab} className="save-schedule-btn">Save All</button>
          <button  onClick={ClearSchedule} className="clear-schedule-btn">Delete All Schedules</button>
          <button className="create-btn" onClick={() => setShowModal(true)}>+ Create</button>
        </div>
      </div>


      <div className="schedule-body">
        {/* Vertical Tabs */}
        <div className="tab-list">
          {schedules.map((schedule, index) => {
            const tabName = `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`;
            const isActive = tabName === activeTab;
            return (
              <div
                key={index}
                className={`tab ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(tabName)}
              >
                {tabName}
                <span
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleDeleteTab(tabName);
                  }}
                  style={{
                    marginLeft: "8px",
                    color: "red",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "darkred"; // Change color on hover
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "red"; // Revert color back on hover leave
                  }}
                >
                 x
                </span>
              </div>
            );
          })}
        </div>

        {/* Schedule Table */}
        <div className="schedule-content">
          {schedules.map((schedule, index) => {
            const tabName = `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`;
            if (tabName === activeTab) {
              return (
                <div key={index} className="schedule-table-wrapper"ref={pdfContainerRef} >
                    <div className="dropdown-container" >
                      {printMode ? (
                        <div className="print-friendly">
                          <div className="exam-type"> {`Examination: ${selectedExam || "Examination"}`}</div>
                          <div className="semester-type">{`Semester: ${selectedSemester || "Semester"}`}</div>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                          >
                            <option value="">Examination</option>
                            <option value="Prelim">Prelim</option>
                            <option value="Midterm">Midterm</option>
                            <option value="Final">Final</option>
                          </select>
                          <select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                          >
                            <option value="">Semester</option>
                            <option value="First Semester">First Semester</option>
                            <option value="Second Semester">Second Semester</option>
                          </select>
                        </>
                      )}
                    </div>

                  <table className="schedule-table" ref={tableRef}>
                    <thead>
                      <tr className="highlight-header-row">
                        <th className="time-header">Time</th>
                        {schedule.selectedRooms.map((room, roomIndex) => (
                          <th key={roomIndex}>{room.room_name}</th>
                        ))}
    
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((slot, rowIndex) => (
                        <tr key={rowIndex} 
                        className={rowIndex % 2 === 0 ? "highlight-row" : ""} 
                        >
                          <td  className={rowIndex % 2 === 0 ? "highlight-row" : ""} >{slot}</td>
                          {schedule.selectedRooms.map((room, colIndex) => {
                            const merged = isCellMerged(rowIndex, colIndex, tabName);
                            if (merged && merged.startRow !== rowIndex) return null;
                            return (
                              <td
                                key={colIndex}
                                rowSpan={merged ? merged.rowSpan : 1}
                                className={
                                  startCell && endCell &&
                                  rowIndex >= Math.min(startCell.row, endCell.row) &&
                                  rowIndex <= Math.max(startCell.row, endCell.row) &&
                                  colIndex === startCell.col &&
                                  tabName === startCell.tabId
                                    ? "selected-cell"
                                    : ""
                                }
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex, tabName, room.room_name)}  
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}

                              >
                              {merged ? (
                                    <div
                                      className="merged-cell"
                                      onClick={() => {
                                        handleMergedCellClick(merged); 
                                      }}
                                      style={{
                                        height: `${merged.rowSpan * 30}px`, 
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#a4cbe6",
                                        color:"black",
                                        border: "1px solid #ccc",
                                        width: "100%",
                                      
                                        userSelect: "none"
                                      }}
                                    >
                                      {/* <div>{merged.timeRange}</div> */}
                                      
                                      <div>{merged.day ? merged.day : ""}</div> 
                                      <div>{merged.subject ? `Subject: ${merged.subject}` : "Click to assign"}</div>                                    
                                      <div>{merged.proctor ? `Instructor: ${merged.proctor}` : ""}</div>
                                    </div>
                                    
                                  ) : null}
                              </td>
                            );
                          })}
                          <td></td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Pagination and Download */}
      <div className="pagination-download">
      {downloading ? (
        <button className="publish-btn" disabled>
          <span className="spinner"></span> Generating PDF...
        </button>
      ) : (
        <button className="publish-btn" onClick={downloadPDF}>
          Download
        </button>
      )}
    </div>


      <AssignModal
        show={showAssignModal}
        handleClose={() => setShowAssignModal(false)}
        onAssign={handleAssignSubject}
        selectedMergedCell={selectedMergedCell}
        subjects={subjects} // Pass subjects data
        proctors={proctors} // Pass proctors data
        onCancelMerge={cancelMerge}
        />         

      <RoomSelectionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onConfirm={(newSchedule) => {
          const { selectedCourse, selectedYear, selectedSection, selectedRooms, day } = newSchedule;
          setSchedules((prev) => [...prev, newSchedule]);
          setSelectedCourse(selectedCourse);
          setSelectedYear(selectedYear);  
          setSelectedSection(selectedSection);
          setRoomHeaders(selectedRooms.map((room) => room.room_name));
          setActiveTab(`${selectedCourse} - ${selectedYear} - ${selectedSection}`);
          setShowModal(false);
        }}
        classrooms={classrooms}
      />
    </div> 
    
    
  );
};

export default RoomScheduleTemp;
