import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookRoom.css";

const RoomBook = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({ startTime: "", endTime: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminRooms();
  }, []);

  const fetchAdminRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/admin/rooms/my-rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleBookRoom = async () => {
    if (!selectedRoom) {
      alert("Please select a room");
      return;
    }
    if (!bookingData.startTime || !bookingData.endTime) {
      alert("Please select start and end time");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:8080/admin/rooms/${selectedRoom.id}/book`,
        bookingData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Room booked successfully!");
      // Redirect to Room Management page
    } catch (error) {
      console.error("Error booking room:", error);
      alert("Failed to book room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-booking-container">
      <h2>Book a Room</h2>

      {/* Room Selection */}
      <label>Select Room:</label>
      <select
        onChange={(e) => setSelectedRoom(rooms.find(room => room.id === Number(e.target.value)))}
      >
        <option value="">-- Select Room --</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name} (Capacity: {room.capacity})
          </option>
        ))}
      </select>

      {/* Start Time */}
      <label>Start Time:</label>
      <input
        type="datetime-local"
        onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
      />

      {/* End Time */}
      <label>End Time:</label>
      <input
        type="datetime-local"
        onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
      />

      {/* Booking Button */}
      <button onClick={handleBookRoom} disabled={loading}>
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
};

export default RoomBook;
