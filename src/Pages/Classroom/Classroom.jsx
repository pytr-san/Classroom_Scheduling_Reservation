import doggo from "../../assets/doggoSecurity.jpg"
import { Button, Form, InputGroup } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import "./Classroom.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";

const Classroom = () => {

    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleCreatebtn = (e) => {
        e.preventDefault();
        setShowModal(true);
    }


    const [classrooms, setClassrooms] = useState([]);
    const [floor, setFloor] = useState("");
    const [status, setStatus] = useState("true"); // 'true' for available, 'false' for occupied
  
  // Fetch classrooms when component mounts
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await axios.get("http://localhost:8000/classrooms");
                setClassrooms(response.data);
            } catch (error) {
                console.error("Error fetching classrooms:", error);
            }
        };
        fetchClassrooms();
    }, []);

    const handleReserve = (e) =>{
        navigate("/classroom/reservation", { state: { classrooms: classrooms } });
    }


    return ( 
    
    <div className="container mt-4">
            {/* Header */}
        <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
                <i className="bi bi-building fs-3"></i> {/* Floor Building Icon */}
                <h1 className="fw-bold mb-0">Floor Building - Classrooms</h1>
            </div>

            <div className="d-flex justify-content-end ">
                <Button variant="outline-secondary" className="ms-auto" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left fs-5"></i> 
                </Button>
            </div>
        </div>

            {/* Navigation & Date */}
            <div className="d-flex align-items-center gap-3 mt-3">
                <h2 variant="secondary">{classrooms.length > 0 ? classrooms[0].floor_building : "No Data"}</h2>
                    <Button variant="light" className="border px-2">
                        <i className="bi bi-chevron-left"></i>
                    </Button>
                    <Button variant="light" className="border px-2">
                        <i className="bi bi-chevron-right"></i>
                    </Button>
                <span><i className="bi bi-calendar"></i></span>

                     {/* Right: Search Bar */}
                <div className="d-flex align-items-center gap-2 ms-auto">
                    <InputGroup style={{ maxWidth: "300px" }}>
                        <InputGroup.Text className="bg-light border-0">
                        <i className="bi bi-search"></i>
                        </InputGroup.Text>
                        <Form.Control type="text" placeholder="Search..." className="border border-secondary rounded" />
                    </InputGroup>

                    {/* Filter Button (Right-Aligned) */}
                    <Button variant="outline-secondary">
                    <i className="bi bi-filter"></i> Filter
                    </Button>
                </div>
            </div>


            {/* Main Content */}
            <div className="card text-white bg-dark mt-4 p-4">
            {/* Left Section - Classroom List */}
            <section className="classroom-info">
                <h2 className="fw-bold">Tia Maria Building, {classrooms.length > 0 ? classrooms[0].floor_building : "No Data"}.</h2>
                <h4 className="mt-3" style={{ color: "white" }}>Classroom list:</h4>
                <ul className="list-unstyled">
                    {classrooms.map((room, index) => (
                        <li key={index}><strong>{room.room_name}</strong></li>
                    ))}
                </ul>
                  {/* Buttons */}
                <div className="d-flex flex-column gap-3 mt-4 ">
                    <Button className="btn btn-dark w-100 d-flex align-items-center justify-content-center" 
                        onClick={handleCreatebtn}
                    >
                    <i className="bi bi-plus-lg me-2"></i> Create Schedule
                    </Button>
                    <Button className="btn btn-dark w-100 d-flex align-items-center justify-content-center"
                        onClick={handleReserve}   
                    >
                    <i className="bi bi-plus-lg me-2"></i> Reserve a Room
                    </Button>
                </div>
            </section>

            {/* Right Section - Image */}
            <section className="floor-container">
                <img src={doggo} alt="Floor Image" className="floor-image" />
            </section>


            </div>
         {/* Modal */}
         <RoomSelectionModal 
            show={showModal} 
            handleClose={() => setShowModal(false)} 
            onConfirm={(selectedRooms) => console.log("Selected Rooms:", selectedRooms)} 
            />
      </div>
    )
}

export default Classroom;
