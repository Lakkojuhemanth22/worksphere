import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import "./ticket.css"

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // ✅ Get token & companyId from localStorage
  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("companyId"); // 🔥 Ensure adminCompanyId is stored in localStorage

  useEffect(() => {
    if (companyId) {
      fetchAllTickets();
    } else {
      console.error("🚨 Missing companyId for admin!");
    }
  }, [filterStatus, companyId]);

  // ✅ Fetch all employee tickets for the admin's company
  const fetchAllTickets = async () => {
    if (!token || !companyId) {
      console.error("🚨 Missing admin token or companyId!");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/user/tickets/company/${companyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Tickets Response:", response.data); // Debugging
      setTickets(response.data);
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
    }
  };

  // ✅ Handle Ticket Status Change (Fixed API Call)
  const updateTicketStatus = async (ticketId, newStatus) => {
    if (!token) {
      console.error("🚨 Missing admin token!");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8080/user/tickets/${ticketId}/update-status?status=${newStatus}`, // 🔥 Fixed API call
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Ticket status updated!");
      fetchAllTickets(); // Refresh list
    } catch (error) {
      console.error("❌ Error updating ticket:", error);
    }
  };

  // ✅ Filter Tickets
  const filteredTickets =
    filterStatus === "ALL"
      ? tickets
      : tickets.filter((ticket) => ticket.status === filterStatus);

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Ticket Management
      </Typography>

      {/* Status Filter */}
      <Select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        sx={{ marginBottom: 3 }}
      >
        <MenuItem value="ALL">All</MenuItem>
        <MenuItem value="OPEN">Open</MenuItem>
        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
        <MenuItem value="RESOLVED">Resolved</MenuItem>
      </Select>

      {/* Ticket List */}
      {filteredTickets.length > 0 ? (
        filteredTickets.map((ticket) => (
          <Paper key={ticket.id} sx={{ padding: 2, marginBottom: 2 }}>
            <Typography variant="h6">{ticket.title}</Typography>
            <Typography>{ticket.description}</Typography>
            <Typography color="secondary">Status: {ticket.status}</Typography>

            {/* Update Ticket Status */}
            {ticket.status !== "RESOLVED" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() =>
                  updateTicketStatus(
                    ticket.id,
                    ticket.status === "OPEN" ? "IN_PROGRESS" : "RESOLVED"
                  )
                }
                sx={{ marginTop: 1 }}
              >
                {ticket.status === "OPEN" ? "Mark In Progress" : "Resolve"}
              </Button>
            )}
          </Paper>
        ))
      ) : (
        <Typography>No tickets found.</Typography>
      )}
    </Box>
  );
};

export default AdminTicketsPage;
