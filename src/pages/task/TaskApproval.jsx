import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from "@mui/material";
import { toast } from "react-toastify";

const TaskApproval = () => {
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      const response = await axios.get("http://localhost:8080/user/tasks/pending-tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPendingTasks(response.data);
    } catch (error) {
      toast.error("Failed to fetch pending tasks");
    }
  };

  const handleApproval = async (taskId, status) => {
    try {
      await axios.patch(`http://localhost:8080/admin/task-approval/${taskId}`, 
        { approved: status }, 
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success(`Task ${status ? "approved" : "rejected"} successfully!`);
      fetchPendingTasks(); // Refresh data
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Employee</strong></TableCell>
            <TableCell><strong>Task</strong></TableCell>
            <TableCell><strong>Submission Date</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No pending approvals.
              </TableCell>
            </TableRow>
          ) : (
            pendingTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.submittedAt}</TableCell>
                <TableCell>
                  <Button onClick={() => handleApproval(task.id, true)} color="success">
                    ✅ Approve
                  </Button>
                  <Button onClick={() => handleApproval(task.id, false)} color="error">
                    ❌ Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaskApproval;
