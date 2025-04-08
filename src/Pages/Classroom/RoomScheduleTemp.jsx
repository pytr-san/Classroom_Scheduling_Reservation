import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import axios from "axios";
import "./RoomScheduleTemp.css";

const RoomScheduleTemp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [roomHeaders, setRoomHeaders] = useState([]);
  const [activeTab, setActiveTab] = useState(null); // Track active tab

  useEffect(() => {
    if (location.state?.newSchedule) {
      const { selectedCourse, selectedYear, selectedSection, selectedRooms } = location.state.newSchedule;
      setSchedules((prev) => [...prev, location.state.newSchedule]);
      setSelectedCourse(selectedCourse);
      setSelectedYear(selectedYear);
      setSelectedSection(selectedSection);
      setRoomHeaders(selectedRooms.map((room) => room.room_name));
      setActiveTab(`${selectedCourse} - ${selectedYear} - ${selectedSection}`); // Set active tab
    }
  }, [location.state]);

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

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleModalConfirm = (newData) => {
    const { selectedCourse, selectedYear, selectedSection, selectedRooms } = newData;
    setSchedules((prev) => [...prev, newData]);
    setSelectedCourse(selectedCourse);
    setSelectedYear(selectedYear);
    setSelectedSection(selectedSection);
    setRoomHeaders(selectedRooms.map((room) => room.room_name));
    setActiveTab(`${selectedCourse} - ${selectedYear} - ${selectedSection}`); // Set active tab
    setShowModal(false);
  };

  const timeSlots = [
    "7:00 am - 7:30 am",
    "7:30 am - 8:00 am",
    "8:00 am - 8:30 am",
    "8:30 am - 9:00 am",
    "9:00 am - 9:30 am",
    "9:30 am - 10:00 am",
    "10:00 am - 10:30 am",
    "10:30 am - 11:00 am",
    "11:00 am - 11:30 am",
    "11:30 am - 12:00 pm",
    "12:00 pm - 12:30 pm",
    "12:30 pm - 1:00 pm",
    "1:00 pm - 1:30 pm",
    "1:30 pm - 2:00 pm",
    "2:00 pm - 2:30 pm",
    "2:30 pm - 3:00 pm",
    "3:00 pm - 3:30 pm",
    "3:30 pm - 4:00 pm",
    "4:00 pm - 4:30 pm",
    "4:30 pm - 5:00 pm",
    "5:00 pm - 5:30 pm",
    "5:30 pm - 6:00 pm",
    "6:00 pm - 6:30 pm",
    "6:30 pm - 7:00 pm",
    "7:00 pm - 7:30 pm",
    "7:30 pm - 8:00 pm",
    "8:00 pm - 8:30 pm",
    "8:30 pm - 9:00 pm"
  ];

  const handleTabClick = (tab) => {
    setActiveTab(tab); // Switch active tab
  };

  return (
    <div className="room-schedule-container">
      <div className="schedule-header">
        <h2>Room Schedule</h2>
        <div className="right-controls">
          <select><option>Examination</option></select>
          <select><option>1st Semester</option></select>
          <button className="create-btn" onClick={handleOpenModal}>+ Create</button>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="calendar">
          <p>2025</p>
          <p>February</p>
        </div>
        <div className="legend">
          <span><span className="legend-box f2f"></span> F2F</span>
          <span><span className="legend-box online"></span> Online</span>
          <span><span className="legend-box conflict"></span> Conflict</span>
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
              {schedule.selectedCourse} - {schedule.selectedYear} - {schedule.selectedSection}
            </button>
          ))}
        </div>

        {/* Schedule Table for Active Tab */}
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
                        <tr key={rowIndex}>
                          <td className="time-cell">{slot}</td>
                          {schedule.selectedRooms.map((_, colIndex) => (
                            <td key={colIndex}></td>
                          ))}
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

      <div className="pagination-download">
        <button className="nav-btn">{"<"}</button>
        <button className="nav-btn">{">"}</button>
        <button className="publish-btn">Publish and Download</button>
      </div>

      <RoomSelectionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        classrooms={classrooms}
      />
    </div>
  );
};

export default RoomScheduleTemp;
