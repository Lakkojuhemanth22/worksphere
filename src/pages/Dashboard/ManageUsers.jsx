import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, MenuItem, Select, CircularProgress, Button, Dialog, 
  DialogActions, DialogContent, DialogTitle, TextField, Typography,
  Tooltip
} from "@mui/material";
import { FaTrash, FaTasks } from "react-icons/fa";
import { MdPersonAdd } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import "./ManageUsers.css";

const API_URL = "http://localhost:8080/admin/users";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Fetched Users:", response.data);
      setUsers(response.data);
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedUserId) {
      toast.error("No employee selected for task assignment.");
      return;
    }
  
    const formattedDeadline = new Date(newTask.deadline).toISOString().split('T')[0];  // Fix deadline format
  
    try {
      console.log("Assigning task to employee ID:", selectedUserId);  // Debugging
      console.log("Auth Token:", localStorage.getItem("token"));  // Debugging
  
      await axios.post(`http://localhost:8080/user/tasks/assign`, {
        employeeId: selectedUserId,  // ✅ Corrected key
        title: newTask.title,
        description: newTask.description,
        deadline: formattedDeadline,  // ✅ Fixed format
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      toast.success("Task assigned successfully!");
      setTaskDialogOpen(false);
      setNewTask({ title: "", description: "", deadline: "" });
    } catch (error) {
      console.error("Assign Task Error:", error.response ? error.response.data : error.message);
      toast.error("Failed to assign task");
    }
  };
  


  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`${API_URL}/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteConfirmation = (userId) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) {
      toast.error("No user selected for deletion.");
      return;
    }
  
    console.log("Deleting user ID:", selectedUserId);  // Debugging log
  
    try {
      const response = await axios.delete(`${API_URL}/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      console.log("Deletion successful:", response.data);
      toast.success("User deleted successfully!");
  
      setDeleteDialogOpen(false);
  
      await fetchUsers(); // ✅ Wait for UI to update before closing
    } catch (error) {
      console.error("Delete user error:", error.response ? error.response.data : error.message);
      toast.error("Failed to delete user");
    }
  };
  

  const handleRegisterUser = async () => {
    try {
      console.log("Registering user:", newUser);  // Debugging log
  
      const response = await axios.post(`${API_URL}/register`, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
  
      console.log("Registration successful:", response.data);
      toast.success("Employee registered successfully!");
  
      setNewUser({ name: "", email: "", password: "" }); // Reset form  
      setRegisterDialogOpen(false);
  
      await fetchUsers(); // ✅ Wait for users to be updated before closing
    } catch (error) {
      console.error("Register user error:", error.response ? error.response.data : error.message);
      toast.error("Failed to register employee");
    }
  };
  

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Manage Employees
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setRegisterDialogOpen(true)}
        startIcon={<MdPersonAdd />}
        style={{ marginBottom: "20px" }}
      >
        Register Employee
      </Button>

      {/* Show Loading Spinner */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No employees found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      >
                        <MenuItem value="EMPLOYEE">Employee</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete User">
                      <IconButton onClick={() => handleDeleteConfirmation(user.id)} color="error">
                        <FaTrash />
                      </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Task">
                      <IconButton onClick={() => { setSelectedUserId(user.id); setTaskDialogOpen(true); }} color="primary">
                        <FaTasks />
                      </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Task Assignment Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)}>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task Title"
            fullWidth
            margin="dense"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <TextField
            label="Deadline"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={newTask.deadline}
            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTask} color="primary">Assign Task</Button> {/* ✅ Corrected */}
        </DialogActions>
      </Dialog>


      {/* Register Employee Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)}>
        <DialogTitle>Register Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="dense"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRegisterUser} color="primary">Register</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageUsers;
