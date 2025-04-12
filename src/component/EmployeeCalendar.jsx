import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const EmployeeCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nextMeeting, setNextMeeting] = useState(null);
  const [countdown, setCountdown] = useState("");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const employeeId = localStorage.getItem("employeeId");

      if (!employeeId) {
        throw new Error("Employee ID is missing");
      }

      const response = await fetch(
        `http://localhost:8080/employee/rooms/${employeeId}/bookings`,
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

      // Find the next upcoming meeting
      const now = new Date();
      const upcoming = data
        .filter((booking) => new Date(booking.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

      setNextMeeting(upcoming);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (nextMeeting) {
      const interval = setInterval(() => {
        const now = new Date();
        const meetingTime = new Date(nextMeeting.startTime);
        const diff = meetingTime - now;

        if (diff > 0) {
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setCountdown(`${minutes}m ${seconds}s`);
        } else {
          setCountdown("Meeting started!");
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nextMeeting]);

  const isMeetingActive = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    return now >= startTime && now <= endTime;
  };

  const getMeetingStatus = (booking) => {
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);

    if (now < startTime) return "🟡 Upcoming";
    if (now >= startTime && now <= endTime) return "🟢 Ongoing";
    return "🔴 Ended";
  };

  const exportToGoogleCalendar = (booking) => {
    const startTime = new Date(booking.startTime).toISOString().replace(/-|:|\.\d+/g, "");
    const endTime = new Date(booking.endTime).toISOString().replace(/-|:|\.\d+/g, "");
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=Meeting+in+${booking.roomName}&dates=${startTime}/${endTime}&details=Join+via+Virtual+Office+Hub`;
    
    window.open(googleCalendarUrl, "_blank");
  };

  const filteredBookings = bookings.filter(
    (booking) => new Date(booking.startTime).toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="employee-calendar">
      <h2>📅 My Meeting Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      {nextMeeting && (
        <div className="next-meeting">
          <h3>⏳ Next Meeting in: {countdown}</h3>
          <p>
            <strong>Room:</strong> {nextMeeting.roomName} | 
            <strong> Time:</strong> {new Date(nextMeeting.startTime).toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="bookings-container">
        <h3>Meetings on {selectedDate.toDateString()}</h3>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <strong>Room:</strong> {booking.roomName} <br />
              <strong>Time:</strong> {new Date(booking.startTime).toLocaleTimeString()} -{" "}
              {new Date(booking.endTime).toLocaleTimeString()} <br />
              <strong>Status:</strong> {getMeetingStatus(booking)} <br />
              
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

              <button
                className="export-calendar-btn"
                onClick={() => exportToGoogleCalendar(booking)}
              >
                📅 Add to Google Calendar
              </button>
            </div>
          ))
        ) : (
          <p>No meetings scheduled for this day.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeCalendar;
