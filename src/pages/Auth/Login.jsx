import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa"; // Import Icons
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const formData = { email, password };

    try {
      const response = await axios.post("http://localhost:8080/auth/login", formData);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("userName", response.data.userName);
        localStorage.setItem("employeeId", response.data.id);
        localStorage.setItem("companyId", response.data.companyId);
        localStorage.setItem("email", response.data.email);

        response.data.role === "ADMIN" ? navigate("/Dashboard") : navigate("/EmployeeDashboard");
      } else {
        setError(response.data.message || "Login failed!");
      }
    } catch (err) {
      setError("Invalid credentials!");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn">Login</button>
        </form>
        <p>Don't have an account? <a href="/register">Register</a></p>
      </div>
    </div>
  );
};

export default Login;
