import React, { useState, useEffect } from "react";
import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For making HTTP requests
import "./ReservationPage.css";
import toast
 from "react-hot-toast";
const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  // Fetch reservations from the server when the component mounts
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/reservations", {
            withCredentials: true,
        });
        const formattedReservations = response.data.map(reservation => {
            const date = new Date(reservation.reservation_date); // Convert DATETIME string to Date object
            const formattedDate = date.toLocaleDateString("en-US", {
              weekday: "long", // "Monday"
              year: "numeric", // "2025"
              month: "long", // "April"
              day: "numeric", // "7"
            });
  
            return {
              ...reservation,
              reservation_date: formattedDate,
            };
          });
  
          setReservations(formattedReservations);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
    fetchReservations();
  }, []);

  const convertTo12Hour = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(+hours, +minutes);
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/reservations/${id}`, {
        withCredentials: true,
    });
        toast.success("Succesfully deleted!");
      setReservations(reservations.filter((reservation) => reservation.id !== id));
    } catch (error) {
        toast.error("Failed to delete reservation", error);
      console.error("Error deleting reservation:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/reservations/${id}`);
      //setEditData(response.data);
      navigate(`/classroom/edit-reservation/${id}`);
    } catch (error) {
      console.error("Error editing reservation:", error);
    }
  };
  

  const handleAdd = () => {
    navigate("/classroom"); 
  };

  return (
    <div className="reservation-container">
    <div className="reservation-header">
                <div className="d-flex justify-content-end ">
                    
                    <Button variant="outline-secondary" className="" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left fs-5"></i>
                    </Button>
                </div>
      <h2>Classroom Reservations</h2>
      <Button variant="primary" onClick={handleAdd}>Add New</Button>
    </div>
  
    {reservations.length === 0 ? (
      <p className="no-reservations">No reservations found.</p>
    ) : (
      <table className="reservation-table">
        <thead className="reservation-table-header">
          <tr>
            <th>Room</th>
            <th>Reserved By</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res.id}>
              <td>{res.room_name}</td>
              <td>{res.reserved_by}</td>
              <td>{res.reservation_date}</td>
              <td>{convertTo12Hour(res.reservation_start_time)}</td>
              <td>{convertTo12Hour(res.reservation_end_time)}</td>
              <td className="actions">
                <button className="btn-edit1" onClick={() => handleEdit(res.id)}>Edit</button>
                <button className="btn-delete1" onClick={() => handleDelete(res.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  
  );
};

export default ReservationPage;
