import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import axios from "axios";
import "./RoomScheduleTemp.css";
import AssignModal from "./AssignModal.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const RoomScheduleTemp = () => {
  
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [roomHeaders, setRoomHeaders] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

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

console.log("format:", selectedCourse);
    // Fetch subjects and proctors (example)
    useEffect(() => {
      // Fetch professors
      axios.get('http://localhost:8000/api/professors', { withCredentials: true })
        .then(res => {
          console.log("Professors Data:", res.data);
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
      console.log("data:", courseId);
        if (!courseId) return;
      
        axios.get('http://localhost:8000/api/subjects', {
          params: {
            courseId,
            yearLevel: formattedYear,
          },
          withCredentials: true,
        })
        .then((res) => {
          console.log('Subjects Data:', res.data);
          setSubjects(res.data);
        })
        .catch((err) => console.error('Error fetching subjects:', err));
      }, [activeTab]);
      
      
    
    //   // Fetch rooms
    //   axios.get('http://localhost:8000/api/rooms', { withCredentials: true })
    //     .then(res => {
    //       console.log("Rooms Data:", res.data);
    //       setRooms(res.data);
    //     })
    //     .catch(err => console.error('Error fetching rooms:', err));
    // }, [course, yearLevel]);
   

  // useEffect(() => {
  //   if (location.state?.newSchedule) {
  //     const { selectedCourse, selectedYear, selectedSection, selectedRooms } = location.state.newSchedule;
  //     setSchedules((prev) => [...prev, location.state.newSchedule]);
  //     setSelectedCourse(selectedCourse);
  //     setSelectedYear(selectedYear);
  //     setSelectedSection(selectedSection);
  //     setRoomHeaders(selectedRooms.map((room) => room.room_name));
  //     setActiveTab(`${selectedCourse} - ${selectedYear} - ${selectedSection}`);
  //   }
  // }, [location.state]);

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
  const handleMouseDown = (row, col, tabId) => {
    setIsSelecting(true);
    setStartCell({ row, col, tabId });
    setEndCell(null);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting) {
      setEndCell({ row, col });
    }
  };
  const handleMouseUp = () => {
    setIsSelecting(false);   

    if (!startCell || !endCell || startCell.col !== endCell.col){ 

      return;}
  
    const startRow = Math.min(startCell.row, endCell.row);
    const endRow = Math.max(startCell.row, endCell.row);
    const key = startCell.tabId;
  
    setMergedCells(prev => {
      const updated = { ...prev };
      updated[key] = updated[key] || [];
      updated[key].push({
        startRow,
        col: startCell.col,
        rowSpan: endRow - startRow + 1,
        tabId: key
      });
      return updated;
    });
  
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

  const handleMergedCellClick = (mergedData) => {
    setSelectedMergedCell(mergedData);
    setShowAssignModal(true);
  };

  const handleAssignSubject = (assignmentData) => {
    const { subject, course, proctor, mergedCell } = assignmentData;

    console.log("Assigned data:", subject, course, proctor, mergedCell);
    setMergedCells((prev) => {
      const updated = { ...prev };
      const key = mergedCell.tabId;
      
      // Find the merged cell that was clicked and update it with the subject and proctor
      updated[key] = updated[key].map(cell => 
        cell.startRow === mergedCell.startRow && cell.col === mergedCell.col
          ? { ...cell, subject, proctor }
          : cell
      );
      return updated;
    });
    setShowAssignModal(false);
  };

  const downloadPDF = async () => {
    if (!tableRef.current || !activeTab) return;
  
    const highlighted = tableRef.current.querySelectorAll('.highlight-row');
    highlighted.forEach(el => el.classList.remove('highlight-row'));

    const canvas = await html2canvas(tableRef.current, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY, // fixes scroll offset issues
      backgroundColor: "#ffffff", // ensure white background if needed
    });

    highlighted.forEach(el => el.classList.add('highlight-row'));
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("landscape", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${activeTab}.pdf`);
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

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="room-schedule-container">
      <div className="schedule-header">
        <h2>Room Schedule</h2>
        <div className="right-controls">
          <select><option>Examination</option></select>
          <select><option>1st Semester</option></select>
          <button className="create-btn" onClick={() => setShowModal(true)}>+ Create</button>
        </div>
      </div>

      <div className="schedule-body">
        {/* Vertical Tabs */}
        <div className="tabs">
          {schedules.map((schedule, index) => (
            <button
              key={index}
              className={`tab-button ${activeTab === `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}` ? 'active' : ''}`}
              onClick={() => handleTabClick(`${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`)}
            >
              {schedule.selectedCourse} - {schedule.selectedYear}{schedule.selectedSection}
            </button>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="schedule-content">
          {schedules.map((schedule, index) => {
            const tabName = `${schedule.selectedCourse} - ${schedule.selectedYear} - ${schedule.selectedSection}`;
            if (tabName === activeTab) {
              return (
                <div key={index} className="schedule-table-wrapper" ref={tableRef}>
                  <table className="schedule-table">
                    <thead>
                      <tr className="highlight-header-row">
                        <th className="time-header">Time</th>
                        {schedule.selectedRooms.map((room, roomIndex) => (
                          <th key={roomIndex}>{room.room_name}</th>
                        ))}
                        <th className="add-header">+ Add</th>
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
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex, tabName)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}

                              >
                              {merged ? (
                                    <div
                                      className="merged-cell"
                                      onClick={() => {
                                        console.log("Clicked merged cell:", merged);
                                        handleMergedCellClick(merged); // 🔥 Trigger modal
                                      }}
                                      style={{
                                        height: `${merged.rowSpan * 30}px`, // Adjust row height if needed
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#e8f4fd",
                                        border: "1px solid #ccc",
                                        width: "100%",
                                      
                                        userSelect: "none"
                                      }}
                                    >
                                      <div>{merged.subject ? merged.subject : "Click to assign"}</div>
                                      <div>{merged.proctor ? `Proctor: ${merged.proctor}` : ""}</div>
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
        <button className="nav-btn">{"<"}</button>
        <button className="nav-btn">{">"}</button>
        <button className="publish-btn" onClick={downloadPDF}
        >Publish and Download</button>
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
          const { selectedCourse, selectedYear, selectedSection, selectedRooms } = newSchedule;
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
