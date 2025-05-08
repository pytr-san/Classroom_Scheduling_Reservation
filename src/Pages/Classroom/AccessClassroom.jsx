import Spist from "../../assets/accessBG.png"
import { Button, Form, InputGroup } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import "./AccessClassroom.css";
import { useNavigate } from "react-router-dom";
import  axiosInstance  from '../../axios.jsx';
import RoomSelectionModal from "../../components/Modal/RoomSelectionModal.jsx";
import toast from "react-hot-toast";

const AccessClassroom = () => {

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [sortByCapacity, setSortByCapacity] = useState(false);
    const navigate = useNavigate();

    // Check if a floor is saved in localStorage
    const savedFloor = localStorage.getItem("currentFloor");
    const initialFloor = savedFloor ? parseInt(savedFloor, 10) : 1;

    const [classrooms, setClassrooms] = useState([]);
    const [currentFloor, setCurrentFloor] = useState(initialFloor);
    const [searchQuery, setSearchQuery] = useState("");
    
// Fetch classrooms when component mounts
    useEffect(() => {
        const fetchClassrooms = async () => {
            try {
                const response = await axiosInstance.get("/classrooms/list");
                setClassrooms(response.data);                 
            } catch (error) {
                console.error("Error fetching classrooms:", error);
                toast.error('Failed to load classrooms.');
            }finally {
                setLoading(false);
            }
        };
        fetchClassrooms();
    }, []);

    // Save the current floor in localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("currentFloor", currentFloor); // Store the current floor in localStorage
    }, [currentFloor]);

    const handlePrevFloor = () => {
        setCurrentFloor((prev) => (prev > 1 ? prev - 1 : prev));
    };

    const handleNextFloor = () => {
        setCurrentFloor((prev) => (prev < 4 ? prev + 1 : prev));
    };

    const getOrdinalSuffix = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };
    const getFloorLabel = (floor) => `${floor}${getOrdinalSuffix(floor)} Floor`;

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value); // Update search query as user types
      };
   
    
        // 🔽 Apply search first
    const searchedRooms = classrooms.filter((room) =>
        room.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🔽 Then sort if needed
    const sortedRooms = [...searchedRooms].sort((a, b) => {
        if (!sortByCapacity) return 0;
        return a.capacity - b.capacity; 
    });

    // 🔽 Then filter by floor
    const filteredRooms = sortedRooms.filter(
        (room) =>
            room.floor_building === `${currentFloor}${getOrdinalSuffix(currentFloor)} Floor`
    );


    const handleReserve = (e) =>{
        navigate("/classroom/reservation", { state: { 
                classrooms: filteredRooms,
                floor: currentFloor,
            } 
        });
    }

    const handleCreatebtn = (e) => {
        e.preventDefault();
        //setShowModal(true);
        navigate("/create-room-schedule")
    }
    const handleReservationPage = (e) => {
        e.preventDefault();
        setTimeout(() => {
            navigate("/classroom/reservations/table");
        }, 500);
    }
    return ( 
    
        <div className="container mt-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
                <i className="bi bi-building fs-2"></i>
                <h1 className="fw-bold mb-0">Floor Building - Classrooms</h1>
            </div>
            <div className="d-flex justify-content-end ">
                

            </div>
        </div>

        {/* Navigation */}
        <div className="d-flex align-items-center gap-3 mt-3">
            <Form.Select 
                style={{ width: "150px" }} 
                value={currentFloor} 
                onChange={(e) => setCurrentFloor(Number(e.target.value))}
            >
                {[1, 2, 3, 4].map((floor) => (
                    <option key={floor} value={floor}>{getFloorLabel(floor)}</option>
                ))}
            </Form.Select>

            <Button variant="light" className="border px-2" onClick={handlePrevFloor} disabled={currentFloor === 1}>
                <i className="bi bi-chevron-left"></i>
            </Button>
            <Button variant="light" className="border px-2" onClick={handleNextFloor} disabled={currentFloor === 4}>
                <i className="bi bi-chevron-right"></i>
            </Button>
            <span><i className="bi bi-calendar"></i></span>

            {/* Right: Search + Filter */}
            <div className="d-flex align-items-center gap-2 ms-auto">
                <InputGroup style={{ maxWidth: "300px" }}>
                    <InputGroup.Text className="bg-light border-0">
                        <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control 
                    type="text" 
                    placeholder="Search..." 
                    className="border border-secondary rounded" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    />
                </InputGroup>
                <Button 
                    variant="outline-secondary"
                    onClick={() => setSortByCapacity((prev) => !prev)} 
                    style={{ width: "300px" }}
                >
                     <i className="bi bi-filter"></i>{" "}
                    {sortByCapacity ? "Clear Filter" : "Sort by Capacity"}
                </Button>
            </div>
        </div>

        {/* Main Content */}
        <div className="card text-white bg-dark mt-4 p-4">
            <section className="classroom-info1">
                <h2 className="fw-bold">Tia Maria Building, {getFloorLabel(currentFloor)}.</h2>
                <h4 className="mt-3" style={{ color: "white" }}>Classroom list:</h4>
                <ul className="list-unstyled">
                    {loading ? (
                        <li>Loading classrooms...</li>
                    ) : searchQuery.trim() !== "" ? (
                        // Group search results by floor
                        (() => {
                            const searchedRooms = classrooms.filter((room) =>
                                room.room_name?.toLowerCase().includes(searchQuery.toLowerCase())
                            );

                            if (searchedRooms.length === 0) {
                                return <li>No classrooms match your search.</li>;
                            }

                            // Group by floor
                            const groupedByFloor = searchedRooms.reduce((groups, room) => {
                                const floor = room.floor_building;
                                if (!groups[floor]) groups[floor] = [];
                                groups[floor].push(room);
                                return groups;
                            }, {});

                            return Object.entries(groupedByFloor).map(([floor, rooms]) => (
                                
                                <li key={floor}>
                                    <h5 className="text-info mt-3">Located on: {floor}</h5>
                                    <ul className="ps-3">
                                        {rooms.map((room, index) => (
                                            <li key={index}>
                                                <strong>{room.room_name} - ( {room.capacity} )</strong>                                                  
                                            </li>
                                        ))} 
                                    </ul>
                                </li>
                            ));
                        })()
                    ) : (
                        // No search — show rooms on the current floor only
                        filteredRooms.length > 0 ? (
                            filteredRooms.map((room, index) => (
                                <li key={index}>
                                    <strong>{room.room_name} - ( {room.capacity} ) </strong>
                               
                                </li>
                            ))
                        ) : (
                            <li>No classrooms on this floor.</li>
                        )
                    )}
                </ul>

                <div className="d-flex flex-column gap-3 mt-4 ">
                    <Button className="btn btn-dark w-100 d-flex align-items-center justify-content-center" onClick={handleCreatebtn}>
                        <i className="bi bi-plus-lg me-2"></i> Create Schedule
                    </Button>
                    <Button className="btn btn-dark w-100 d-flex align-items-center justify-content-center" onClick={handleReserve}>
                        Room Preview
                    </Button>
                    {/* <Button className="btn btn-dark w-100 d-flex align-items-center justify-content-center" onClick={handleReservationPage}>
                    <i className="fa-solid fa-list me-2"></i> Reservations
                    </Button> */}

                </div>
            </section>

            {/* Right Section - Image */}
            <section className="floor-container">
                <img src={Spist} alt="Spist Building" className="floor-image" />
            </section>
        </div>

        {/* Modal */}
        <RoomSelectionModal 
            show={showModal} 
            handleClose={() => setShowModal(false)} 
            onConfirm={(selectedRooms) => console.log("Selected Rooms:", selectedRooms)} 
            classrooms={classrooms} // 🔽 Pass the classrooms here
            size="lg" 
            centered
        />

    </div>
    )
}

export default AccessClassroom;
