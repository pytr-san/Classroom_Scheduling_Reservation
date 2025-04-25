import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button, Form } from "react-bootstrap"; // Assuming you're using Bootstrap for form
import "./EditReservationPage.css";

const EditReservationPage = () => {
  const [reservationData, setReservationData] = useState({
    reservedBy: "",
    reservationDate: "",
    reservationStartTime: "",
    reservationEndTime: "",
    roomName: ""
  });
  const { id } = useParams(); // Get the reservation ID from the URL params
  const navigate = useNavigate(); // For navigation after submitting form

  // Fetch reservation details when the page loads
  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/reservations/${id}`, {
          withCredentials: true,
        });
        setReservationData(response.data); // Pre-populate the form with the fetched data
      } catch (error) {
        console.error("Error fetching reservation data:", error);
      }
    };
    fetchReservationData(); // Call to fetch reservation
  }, [id]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReservationData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission (update reservation)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8000/api/reservations/${id}`,
        reservationData,
        { withCredentials: true }
      );
      console.log("Reservation updated successfully:", response.data);
      navigate("/"); // Redirect to the ReservationPage after successful update
    } catch (error) {
      console.error("Error updating reservation:", error);
    }
  };

  return (
    <div className="edit-reservation-container">
      <h2>Edit Reservation</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="reservedBy">
          <Form.Label>Reserved By</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter name"
            name="reservedBy"
            value={reservationData.reservedBy}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="reservationDate">
          <Form.Label>Reservation Date</Form.Label>
          <Form.Control
            type="date"
            name="reservationDate"
            value={reservationData.reservationDate}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="reservationStartTime">
          <Form.Label>Start Time</Form.Label>
          <Form.Control
            type="time"
            name="reservationStartTime"
            value={reservationData.reservationStartTime}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="reservationEndTime">
          <Form.Label>End Time</Form.Label>
          <Form.Control
            type="time"
            name="reservationEndTime"
            value={reservationData.reservationEndTime}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="roomName">
          <Form.Label>Room Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter room name"
            name="roomName"
            value={reservationData.roomName}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Update Reservation
        </Button>
      </Form>
    </div>
  );
};

export default EditReservationPage;
