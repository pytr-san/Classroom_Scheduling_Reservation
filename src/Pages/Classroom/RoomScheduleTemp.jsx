import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import axios from "axios";
import "./RoomScheduleTemp.css";
import AssignModal from "./AssignModal.jsx";

const RoomScheduleTemp = () => {
 
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

    //useEffect(() => {  
    //  if (course && yearLevel) {
    //   axios.get('http://localhost:8000/api/subjects', {
    //       params: {
    //         course: course,
    //         yearLevel: yearLevel
    //       },
    //       withCredentials: true
    //     })
    //     .then(res => {
    //       console.log("Subjects Data:", res.data);
    //       setSubjects(res.data);
    //     })
    //     .catch(err => console.error('Error fetching subjects:', err));
    //           }
    
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
        const response = await axios.get("http://localhost:8000/classrooms/list");
        setClassrooms(response.data);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };
    fetchClassrooms();
  }, []);

  // Logic for handling mouse down, up, and enter for cell selection and merging
  const handleMouseDown = (row, col, tabId) => {
    console.log("Mouse down at:", row, col, tabId);
    setIsSelecting(true);
    setStartCell({ row, col, tabId });
    setEndCell(null);
  };

  const handleMouseEnter = (row, col) => {
    if (isSelecting) {
      console.log("Mouse enter at:", row, col);
      setEndCell((prev) => ({ ...prev, row }));
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  
    if (!startCell || !endCell || startCell.col !== endCell.col) return;
  
    const startRow = Math.min(startCell.row, endCell.row);
    const endRow = Math.max(startCell.row, endCell.row);
    const key = startCell.tabId;
  
    setMergedCells((prev) => {
      const updated = { ...prev };
  
      if (!updated[key]) {
        updated[key] = [];
      }
  
      updated[key] = [
        ...updated[key],
        {
          startRow,
          col: startCell.col,
          rowSpan: endRow - startRow + 1,
          tabId: key
        }
      ];
      console.log("Updated mergedCells:", updated);   
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
  

  const handleMergedCellClick = (mergedData) => {
    console.log("Clicked merged cell:", mergedData);
    setSelectedMergedCell(mergedData);
    setShowAssignModal(true);
  };

  useEffect(() => {
    setMergedCells({
      "BSIT - 1 - A": [
        { startRow: 0, col: 1, rowSpan: 3, tabId: "BSIT - 1 - A" }
      ]
    });
  }, []);
  
  const handleAssignSubject = (assignmentData) => {
    const { subject, course, proctor, mergedCell } = assignmentData;

    console.log("Assigned data:", subject, course, proctor, mergedCell);

    setShowAssignModal(false);
  };

  const timeSlots = [
    "7:00 am - 7:30 am", "7:30 am - 8:00 am", "8:00 am - 8:30 am", "8:30 am - 9:00 am", 
    "9:00 am - 9:30 am", "9:30 am - 10:00 am", "10:00 am - 10:30 am", "10:30 am - 11:00 am", 
    "11:00 am - 11:30 am", "11:30 am - 12:00 pm", "12:00 pm - 12:30 pm", "12:30 pm - 1:00 pm", 
    "1:00 pm - 1:30 pm", "1:30 pm - 2:00 pm", "2:00 pm - 2:30 pm", "2:30 pm - 3:00 pm", 
    "3:00 pm - 3:30 pm", "3:30 pm - 4:00 pm", "4:00 pm - 4:30 pm", "4:30 pm - 5:00 pm", 
    "5:00 pm - 5:30 pm", "5:30 pm - 6:00 pm", "6:00 pm - 6:30 pm", "6:30 pm - 7:00 pm", 
    "7:00 pm - 7:30 pm", "7:30 pm - 8:00 pm", "8:00 pm - 8:30 pm", "8:30 pm - 9:00 pm"
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
                <div key={index} className="schedule-table-wrapper">
                  <table className="schedule-table">
                    <thead>
                      <tr>
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
                          <td className="time-cell">{slot}</td>
                          {schedule.selectedRooms.map((room, colIndex) => {
                            const merged = isCellMerged(rowIndex, colIndex, tabName);
                            if (merged && merged.startRow !== rowIndex) return null;
                            if (merged) {
                              console.log(`Rendering merged cell at row ${rowIndex}, col ${colIndex}`, merged);
                            }
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
                                onClick={() => merged && handleMergedCellClick(merged)}
                                style={{ cursor: merged ? 'pointer' : 'default' }}
                              >

                                {merged ? <div>Click to assign</div> : null}
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

        <AssignModal
        show={showAssignModal}
        handleClose={() => setShowAssignModal(false)}
        onAssign={handleAssignSubject}
        selectedMergedCell={selectedMergedCell}
        subjects={subjects} // Pass subjects data
        proctors={proctors} // Pass proctors data
        /> 
      </div>

      {/* Pagination and Download */}
      <div className="pagination-download">
        <button className="nav-btn">{"<"}</button>
        <button className="nav-btn">{">"}</button>
        <button className="publish-btn"
        >Publish and Download</button>
      </div>

         

      <RoomSelectionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onConfirm={(newData) => {
          const { selectedCourse, selectedYear, selectedSection, selectedRooms } = newData;
          setSchedules((prev) => [...prev, newData]);
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
