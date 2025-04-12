import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaUserPlus } from "react-icons/fa";
import "./RoomManagement.css";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: "", capacity: "" });
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState({});

  useEffect(() => {
    fetchRooms();
    fetchEmployees();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/admin/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.capacity) return alert("Fill all fields");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8080/admin/rooms", newRoom, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewRoom({ name: "", capacity: "" });
      fetchRooms();
    } catch (error) {
      console.error("Error adding room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setNewRoom({ name: room.name, capacity: room.capacity });
  };

  const handleUpdateRoom = async () => {
    if (!newRoom.name || !newRoom.capacity) return alert("Fill all fields");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/admin/rooms/${editingRoom.id}`, newRoom, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingRoom(null);
      setNewRoom({ name: "", capacity: "" });
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/admin/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (roomId, userId) => {
    setSelectedEmployees((prev) => ({ ...prev, [roomId]: userId }));
  };

  const assignEmployee = async (roomId) => {
    const userId = selectedEmployees[roomId];
    if (!userId) return alert("Select an employee first");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/admin/rooms/${roomId}/assign/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRooms();
    } catch (error) {
      console.error("Error assigning employee:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-management-container">
      <h2 className="title">Room Management</h2>

      <div className="room-form">
        <input
          type="text"
          placeholder="Room Name"
          value={newRoom.name}
          onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newRoom.capacity}
          onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
        />
        {editingRoom ? (
          <button onClick={handleUpdateRoom} disabled={loading} className="btn update-btn">
            {loading ? "Updating..." : "Update"}
          </button>
        ) : (
          <button onClick={handleAddRoom} disabled={loading} className="btn add-btn">
            {loading ? "Adding..." : "Add"} <FaPlus />
          </button>
        )}
      </div>

      <div className="room-cards">
        {rooms.map((room) => (
          <div className="room-card" key={room.id}>
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity}</p>
            <p>Employees: {room.employees ? room.employees.length : 0}</p>

            <div className="actions">
              <select
                className="dropdown"
                value={selectedEmployees[room.id] || ""}
                onChange={(e) => handleEmployeeChange(room.id, e.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>

              <button className="btn assign-btn" onClick={() => assignEmployee(room.id)} disabled={loading}>
                <FaUserPlus /> Assign
              </button>

              <button className="btn edit-btn" onClick={() => handleEditRoom(room)}>
                <FaEdit /> Edit
              </button>

              <button className="btn delete-btn" onClick={() => handleDeleteRoom(room.id)}>
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;
