import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import { Button } from "react-bootstrap";
import axios from "axios";
import "./RoomScheduleTemp.css";
import AssignModal from "./AssignModal.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import toast from "react-hot-toast";

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

    // Fetch subjects and proctors (example)
    useEffect(() => {
      // Fetch professors
      axios.get('http://localhost:8000/api/professors', { withCredentials: true })
        .then(res => {
          setProctors(res.data);
        })
        .catch(err => console.error('Error fetching professors:', err));
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
        const courseNameToId = {
          "BSIT": 1,
          "BSCS": 2,
          "BSCPE": 3,
        };
      
        const courseId = courseNameToId[courseName];

        if (!courseId) return;
      
        axios.get('http://localhost:8000/api/subjects', {
          params: {
            courseId,
            yearLevel: formattedYear,
          },
          withCredentials: true,
        })
        .then((res) => {
          setSubjects(res.data);
        })
        .catch((err) => console.error('Error fetching subjects:', err));
      }, [activeTab]);
      
      
      useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("schedules")) || [];
      
        const restoredSchedules = stored.map((tab) => {
          // Reconstruct selectedRooms from saved room names
          const selectedRooms = tab.rooms.map((room) => ({
            room_name: room.room_name
          }));
      
          return {
            selectedCourse: tab.course,
            selectedYear: tab.year,
            selectedSection: tab.section,
            selectedRooms,
            mergedCells: tab.mergedCells || {}, 
          };
        });
      
        setSchedules(restoredSchedules);
    
      }, []);

      //save Schedule
      const saveScheduleByTab = () => {
        // Check if schedules exist and are not empty
        if (!schedules || schedules.length === 0) {
          toast.error("No schedules to save.");
          return;
        }
    
        const allSchedulesData = schedules.map((schedule) => {
          const tabData = {
            course: schedule.selectedCourse,
            year: schedule.selectedYear,
            section: schedule.selectedSection,
            rooms: [], // Array to store room data
            mergedCells: {}, // Object to store merged cell data (keyed by row-col)
          };
    
          // Loop through the rooms in each schedule
          schedule.selectedRooms.forEach((room, roomIndex) => {
            const roomData = {
              room_name: room.room_name,
              time_slots: [], // Array to store time slots for the current room
            };
    
            // Loop through the time slots in the room
            timeSlots.forEach((timeSlot, rowIndex) => {
              // Check if the current cell is merged
              const mergedCell = isCellMerged(rowIndex, roomIndex, `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`);
              
              const cellKey = `${rowIndex}-${roomIndex}`;
              const cellData = {
                timeSlot,
                subject: mergedCell?.subject || '',  // Extract subject or default to empty string
                proctor: mergedCell?.proctor || '',  // Extract proctor or default to empty string
                isMerged: !!mergedCell,  // Boolean to indicate if the cell is merged
                rowSpan: mergedCell?.rowSpan || 1,  // Default rowSpan to 1 if no merge
                startRow: mergedCell?.startRow ?? rowIndex,  // Default to current row if no merge
              };
    
              // If the cell is the starting cell of a merged block, store it in mergedCells
              if (mergedCell && mergedCell.startRow === rowIndex) {
                tabData.mergedCells[cellKey] = {
                  row: rowIndex,
                  col: roomIndex,
                  rowSpan: mergedCell.rowSpan,
                  subject: mergedCell.subject,
                  proctor: mergedCell.proctor,
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
    
      
      
      
      // Helper function to get the active tab (You can implement this based on your application logic)
      // const getActiveTab = () => {

      //   if (!activeTab) return {};
      
      //   const [course, year, section] = activeTab.split(" - ");
      //   return {
      //     course,
      //     year,
      //     section
      //   };
      // };
      
    

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get("http://localhost:8000/classrooms/list", { withCredentials: true });
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



  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem("schedules")) || [];
  
    if (savedSchedules.length > 0) {
      const restoredSchedules = savedSchedules.map((tab) => {
        const restoredRooms = tab.rooms.map((room) => {
          const restoredTimeSlots = room.time_slots.map((timeSlot, rowIndex) => {
            const cellKey = `${rowIndex}-${room.room_name}`;
            const mergedCell = tab.mergedCells[cellKey] || {}; // Default to empty if not found
  
            console.log(`Checking merged cell for ${cellKey}:`, mergedCell);
  
            if (mergedCell.rowSpan) {
              // If merged cell exists, apply merged data
              return {
                ...timeSlot,
                isMerged: true,
                rowSpan: mergedCell.rowSpan,
                subject: mergedCell.subject,
                proctor: mergedCell.proctor,
                startRow: mergedCell.row, // Ensure you have this attribute properly defined
              };
            }
  
            return timeSlot; // Return time slot without modification if not merged
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
  
      // Optionally set active tab
      const firstTab = savedSchedules[0];
      if (firstTab) {
        const firstTabName = `${firstTab.course} - ${firstTab.year} - ${firstTab.section}`;
        console.log("Setting active tab to:", firstTabName);
        setActiveTab(firstTabName);
      }
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
    console.log("startCell:", startCell);
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
    if (!tableRef.current || !activeTab) return;
  
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
    localStorage.clear();  // Clears everything in localStorage
    setSchedules([]);    
    setSelectedSemester(null);
    setSelectedExam(null);  // Clear your local state as well
    setMergedCells({});
    setSelectedMergedCell(null);
    toast.success("Schedules cleared!"); //
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

  return (
    <div className="room-schedule-container">
      <div className="schedule-header">
        <Button variant="outline-secondary" className="" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left fs-5"></i>
        </Button>
        <h2>Examination Schedule</h2>
        <div className="right-controls">

          <button  onClick={saveScheduleByTab} className="save-schedule-btn">Save Schedule</button>
          <button  onClick={ClearSchedule} className="clear-schedule-btn">Clear Schedule</button>
          <button className="create-btn" onClick={() => setShowModal(true)}>+ Create</button>
        </div>
      </div>


      <div className="schedule-body">
        {/* Vertical Tabs */}
        <div className="tabs">
          {schedules.map((schedule, index) => {
            const tabName = `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`;
            return (
              <button
                key={index}
                className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                onClick={() => handleTabClick(tabName)}
              >
                {tabName}
              </button>
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
                                        backgroundColor: "#707372",
                                        color:"white",
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
