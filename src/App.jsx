import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Admin/Dashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoomManagement from "./pages/Dashboard/RoomManagement";
import EmployeeRooms from "./pages/Dashboard/EmployeeRooms";
import BookRoom from "./pages/rooms/BookRoom";
import MyBookings from "./pages/rooms/MyBookings";
import TicketsPage from "./pages/rooms/TicketPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/room-management" element={<RoomManagement />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            <Route path="/employeeRooms" element={<EmployeeRooms />} />
            <Route path="/employee/rooms" element={<EmployeeRooms />} />
            <Route path="/employee/book-room/:roomId" element={<BookRoom />} />
            <Route path="/employee/my-bookings" element={<MyBookings />} />
            <Route path="/tickets" element={<TicketsPage />} /> {/* Add tickets page */}
          </Route>

          {/* Unauthorized Page */}
          <Route path="/unauthorized" element={<h1>Access Denied</h1>} />

          {/* Default Redirect */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
