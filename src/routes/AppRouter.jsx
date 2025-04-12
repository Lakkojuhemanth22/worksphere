import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import EmployeeDashboard from "../pages/Dashboard/EmployeeDashboard";
import ManageUsers from "../pages/Dashboard/ManageUsers";
import TaskApproval from "../pages/task/TaskApproval";
import RoomManagement from "../pages/Dashboard/RoomManagement";
import EmployeeRooms from "../pages/Dashboard/EmployeeRooms";
import BookRoom from "../pages/rooms/BookRoom";
import MyBookings from "../pages/rooms/MyBookings";
import Room from "../pages/rooms/Room";
import AdminCalendar from "../component/AdminCalendar";
import RoomBook from "../pages/rooms/BookRoom";
import VideoCall from "../component/VideoCall";
import EmployeeTickets from "../pages/rooms/EmployeeTicketsPage";
import AdminTicketsPage from "../pages/rooms/AdminTicketPage";
import EmployeeCalendar from "../component/EmployeeCalendar";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employeeDashboard" element={<EmployeeDashboard />} />
        <Route path="/employeeRooms" element={<EmployeeRooms/>} />
        <Route path="/manageUsers" element={<ManageUsers />} />
        <Route path="/taskApproval" element={<TaskApproval />} />
        <Route path="/room-management" element={<RoomManagement />} />
        <Route path="/employee/book-room/:roomId" element={<BookRoom />} />
        <Route path="/admin/rooms/:roomId/book" element={<RoomBook />} />
        <Route path="/component/AdminCalendar" element={<AdminCalendar />} />
        <Route path="/component/EmployeeCalendar" element={<EmployeeCalendar />} />
        <Route path="/employee/my-bookings" element={<MyBookings />} />
        <Route path="/employee/room/:roomId" element={<Room />} />
        <Route path="/video-call" element={<VideoCall />} /> 
        <Route path="/ticket" element={<EmployeeTickets />} /> 
        <Route path="/adminTicket" element={<AdminTicketsPage />} /> 
      </Routes>
    </Router>
  );
};

export default AppRouter;  // ✅ Ensure this line is present
