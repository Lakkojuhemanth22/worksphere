import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import "./ticket.css"

const EmployeeTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: "", description: "" });

  // Get employeeId and token from localStorage
  const employeeId = localStorage.getItem("employeeId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (employeeId && token) {
      fetchTickets();
    } else {
      console.error("🚨 Employee ID or Token is missing!");
    }
  }, []);

  // Fetch Employee's Tickets
  const fetchTickets = async () => {
    if (!token || !employeeId) {
      console.error("🚨 Missing token or employeeId!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/user/tickets/employee/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Tickets Response:", response.data); // Debugging line
      setTickets(response.data);
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
    }
  };

  // Handle Input Change for New Ticket
  const handleInputChange = (e) => {
    setNewTicket({ ...newTicket, [e.target.name]: e.target.value });
  };

  // Submit New Ticket
  const submitTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      alert("Title and Description are required!");
      return;
    }

    if (!employeeId || !token) {
      console.error("🚨 Cannot submit ticket. Missing employee ID or token.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/user/tickets/${employeeId}/create`,
        newTicket,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Ticket Created Successfully!");
      setNewTicket({ title: "", description: "" }); // Clear input fields
      fetchTickets(); // Refresh ticket list
    } catch (error) {
      console.error("❌ Error creating ticket:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Tickets
      </Typography>

      {/* Ticket Creation Form */}
      <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6">Create New Ticket</Typography>
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={newTicket.title}
          onChange={handleInputChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={newTicket.description}
          onChange={handleInputChange}
          multiline
          rows={3}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={submitTicket}>
          Submit Ticket
        </Button>
      </Paper>

      {/* Display Employee's Tickets */}
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <Paper key={ticket.id} sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6">{ticket.title}</Typography>
            <Typography>{ticket.description}</Typography>
            <Typography color="secondary">Status: {ticket.status}</Typography>
          </Paper>
        ))
      ) : (
        <Typography>No tickets found.</Typography>
      )}
    </Box>
  );
};

export default EmployeeTickets;
