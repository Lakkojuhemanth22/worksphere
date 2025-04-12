import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSignOutAlt, FaChartPie, FaMoon, FaSun, FaCog, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { IoTicketSharp } from "react-icons/io5";
import "./Dashboard.css";
import EmployeeRooms from "./EmployeeRooms";
import MyBookings from "../rooms/MyBookings";
import EmployeeTickets from "../rooms/EmployeeTicketsPage";
import EmployeeCalendar from "../../component/EmployeeCalendar";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const userId = localStorage.getItem("employeeId");
  console.log("📌 Retrieved userId from localStorage:", userId);

  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [stats, setStats] = useState({ users: 0, sessions: 0, requests: 0 });
  const [tasks, setTasks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    fetchDashboardStats();
    if (userId) {
      fetchAssignedTasks();
    }
  }, [userId]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized: Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:8080/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  const handleFileUpload = (e, taskId) => {
    const file = e.target.files[0];
    setFileUploads({ ...fileUploads, [taskId]: file });
  };
  
  const submitTask = async (taskId) => {
    if (!fileUploads[taskId]) {
      alert("Please select a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", fileUploads[taskId]);
  
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/user/tasks/submit/${taskId}`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
  
      alert("Task submitted successfully!");
      fetchAssignedTasks();  // Refresh UI
    } catch (error) {
      alert("Error submitting task.");
    }
  };  

  const fetchAssignedTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !userId) return;
  
      const response = await axios.get(`http://localhost:8080/user/tasks/employee/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log("✅ API Response:", response.data); // Debugging API response
      setTasks(response.data); // ✅ Update state
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
    }
  };
  

  // ✅ Fix: Define the handleLogout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="logo">Employee Panel</h2>
        <ul>
          <li onClick={() => setActivePage("dashboard")} className="nav-item">
            <FaChartPie /> <span>Dashboard</span>
          </li>
          <li onClick={() => setActivePage("rooms")} className="nav-item">
            <FaUsers /> <span>Rooms</span>
          </li>
          <li onClick={() => setActivePage("bookings")} className="nav-item">
            <FaUsers /> <span>My Bookings</span>
          </li>
          <li onClick={() => setActivePage("calendar")} className="nav-item">
            <FaCalendarAlt /> <span>Calendar</span>
            </li>
          <li onClick={() => setActivePage("ticket")} className="nav-item">
            <IoTicketSharp/> <span>Ticket</span>
          </li>
        </ul>
        <div className="btns">
          <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>
      <main className="dashboard-content">
        {activePage === "dashboard" && (
          <>
            <h2>Welcome, {email}</h2>
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <div className="dashboard-cards">
                <div className="dashboard-card tasks-container">
                {tasks.length > 0 ? (
                <ul className="task-list">
                  {tasks.map((task, index) => (
                    <li key={index} className={`task-card ${task.status === "COMPLETED" ? "completed" : "in-progress"}`}>
                      <div className="task-header">
                        <h4 className="task-title">📌 {task.title}</h4>
                        <span className={`status ${task.status === "COMPLETED" ? "completed-text" : "in-progress-text"}`}>
                          {task.status === "COMPLETED" ? "Completed" : "In Progress"}
                        </span>
                      </div>
                      <p className="task-description">{task.description}</p>

                      {task.status === "IN_PROGRESS" && (
                        <div className="file-upload">
                          <input type="file" id={`file-${index}`} onChange={(e) => handleFileUpload(e, task.id)} />
                          <button className="upload-btn" onClick={() => submitTask(task.id)}>📤 Submit</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-tasks">🎉 No tasks assigned.</p>
              )}
              </div>
              </div>
            )}
          </>
        )}
        {activePage === "users" && <ManageUsers />}
        {activePage === "rooms" && <EmployeeRooms />}
        {activePage === "ticket" && <EmployeeTickets />}
        {activePage === "calendar" && <EmployeeCalendar />}
        {activePage === "bookings" && <MyBookings />}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
