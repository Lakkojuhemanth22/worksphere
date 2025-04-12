import React, { useState, useEffect } from "react";
import { FaUsers, FaCog, FaSignOutAlt, FaChartPie, FaMoon, FaSun, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import { IoTicketSharp } from "react-icons/io5";
import ManageUsers from "./ManageUsers";
import TaskApproval from "../task/TaskApproval";
import RoomManagement from "./RoomManagement";
import "./Dashboard.css";
import AdminCalendar from "../../component/AdminCalendar";
import BookRoom from "../rooms/BookRoom";
import AdminTicketsPage from "../rooms/AdminTicketPage";

const Dashboard = () => {
  const email = localStorage.getItem("email");

  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({ users: 0, sessions: 0, requests: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePage, setActivePage] = useState("dashboard"); // Manage active content

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found! Redirecting to login.");
        setError("Unauthorized: Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:8080/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.response?.data || error.message);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login"; // Redirect manually
  };

  return (
    <div className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin Panel</h2>
        <ul>
          <li onClick={() => setActivePage("dashboard")} className="nav-item">
            <FaChartPie /> <span>Dashboard</span>
          </li>
          <li onClick={() => setActivePage("users")} className="nav-item">
            <FaUsers /> <span>Manage Users</span>
          </li>
          <li onClick={() => setActivePage("bookRoom")} className="nav-item">
            <FaCog /> <span>Book Room</span>
          </li>
          <li onClick={() => setActivePage("rooms")} className="nav-item">
            <FaUsers /> <span>Room Management</span>
          </li>
          <li onClick={() => setActivePage("approvals")} className="nav-item">
            <FaCheckCircle /> <span>Approvals & Reviews</span>
          </li>
          <li onClick={() => setActivePage("calendar")} className="nav-item">
            <FaCalendarAlt /> <span>Calendar</span>
          </li>
          <li onClick={() => setActivePage("ticket")} className="nav-item">
            <IoTicketSharp /> <span>Ticket</span>
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

      {/* Main Content - Dynamically Rendered */}
      <main className="dashboard-content">
        {activePage === "dashboard" && (
          <>
            <h2>Welcome, Admin</h2>
            <p>Logged in as <strong>{email}</strong></p>
            {loading ? (
              <p>Loading data...</p>
            ) : error ? (
              <p className="error-message">{error}</p>
            ) : (
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <h3>Total Users</h3>
                  <p>{stats.users}</p>
                </div>
                <div className="dashboard-card">
                  <h3>Active Sessions</h3>
                  <p>{stats.sessions}</p>
                </div>
                <div className="dashboard-card">
                  <h3>Pending Requests</h3>
                  <p>{stats.requests}</p>
                </div>
              </div>
            )}
          </>
        )}
        {activePage === "users" && <ManageUsers />}
        {activePage === "rooms" && <RoomManagement />}
        {activePage === "bookRoom" && <BookRoom />}
        {activePage === "approvals" && <TaskApproval />}
        {activePage === "calendar" && <AdminCalendar />}
        {activePage === "ticket" && <AdminTicketsPage />}
      </main>
    </div>
  );
};

export default Dashboard;
