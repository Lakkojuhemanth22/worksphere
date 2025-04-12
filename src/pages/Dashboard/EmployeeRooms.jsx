import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./EmployeeRooms.css";
import RoomBookingForm from "../rooms/BookRoom";

const EmployeeRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState("");
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    useEffect(() => {
        fetchAssignedRooms();
    }, []);

    const fetchAssignedRooms = async () => {
        try {
            const employeeId = localStorage.getItem("employeeId");
            const token = localStorage.getItem("token");

            if (!employeeId || !token) {
                setError("Employee ID not found. Please log in.");
                return;
            }

            const response = await axios.get(`http://localhost:8080/employee/rooms/assigned/${employeeId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("API Response:", response.data);

            if (!response.data || response.data.length === 0) {
                setError("No assigned rooms found.");
            } else {
                setRooms(response.data);
            }
        } catch (err) {
            console.error("API Error:", err.response ? err.response.data : err);
            setError("Failed to fetch assigned rooms.");
        }
    };

    return (
        <div className="container">
            <h2>My Assigned Rooms</h2>
            {error ? (
                <p className="error">{error}</p>
            ) : rooms.length > 0 ? (
                <div className="rooms-container">
                    {rooms.map((room) => (
                        <div key={room.id} className="room-card">
                            <p className="room-name">{room.name}</p>
                            <p className="room-details">Capacity: {room.capacity}</p>
                            <p className={`room-status ${room.status === "Available" ? "status-available" : room.status === "Occupied" ? "status-occupied" : "status-pending"}`}>
                                {room.status}
                            </p>
                            <button className="open-btn" onClick={() => navigate(`/employee/room/${room.id}`, { state: { roomId: room.id } })}> Open</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Loading rooms...</p>
            )}
        </div>
    );
};

export default EmployeeRooms;
