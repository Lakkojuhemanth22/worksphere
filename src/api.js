import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const getUsers = () => axios.get(`${API_URL}/users`);
export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);
export const updateUserRole = (id, role) =>
  axios.put(`${API_URL}/users/${id}/role`, { role });
