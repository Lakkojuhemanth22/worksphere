import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MyBookings.css"

const MyBookings = () => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/employee/rooms/my-bookings?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load bookings.");
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await axios.delete(
        `http://localhost:8080/employee/rooms/bookings/${bookingId}?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Booking canceled!");
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  return (
    <div className="my-bookings-container">
      <h2>My Bookings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <h3>Room: {booking.room.name}</h3>
              <p>
                <strong>Start:</strong> {booking.startTime}
              </p>
              <p>
                <strong>End:</strong> {booking.endTime}
              </p>
              <button onClick={() => cancelBooking(booking.id)}>Cancel</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
