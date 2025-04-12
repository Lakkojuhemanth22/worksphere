import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaBuilding } from "react-icons/fa"; // Import Icons
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    companyName: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post("http://localhost:8080/auth/register", formData);
      setMessage(response.data.message);

      if (response.data.message === "User registered successfully") {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>Register</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="icon" />
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FaLock className="icon" />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <FaBuilding className="icon" />
            <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn">Register</button>
        </form>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
};

export default Register;
