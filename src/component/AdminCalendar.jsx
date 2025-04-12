import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./AdminCalendar.css";


const AdminCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const companyId = localStorage.getItem("companyId");

      if (!companyId) {
        console.error("Company ID is missing!");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/admin/rooms/company/${companyId}/bookings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    return new Date(booking.startTime).toDateString() === selectedDate.toDateString();
  });

  const isMeetingActive = (booking) => {
    const now = new Date();
    return now >= new Date(booking.startTime) && now <= new Date(booking.endTime);
  };

  return (
    <div className="admin-calendar">
      <h2>📅 Meeting Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      <div className="bookings-container">
        <h3 className="heading">Bookings for {selectedDate.toDateString()}</h3>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <strong>Room:</strong> {booking.roomName} <br />
              <strong>Time:</strong>{" "}
              {new Date(booking.startTime).toLocaleTimeString()} -{" "}
              {new Date(booking.endTime).toLocaleTimeString()}
              <br />
              {isMeetingActive(booking) ? (
                <button
                  className="join-meeting-btn"
                  onClick={() => window.location.href = "/videocall.html"}
                >
                  Join Meeting
                </button>
              ) : (
                <span>⏳ Meeting not started</span>
              )}
            </div>
          ))
        ) : (
          <p>No meetings scheduled for this day.</p>
        )}
      </div>
    </div>
  );
};

export default AdminCalendar;
