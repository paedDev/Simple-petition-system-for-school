// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [course, setCourse] = useState(""); // Course selection state
  const [role, setRole] = useState("student"); // Default role set to 'student'
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        email,
        username,
        password,
        idNumber,
        course,
        role,
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Error during signup");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Signup</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
          required
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="togglePasswordSignup"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="togglePasswordSignup">Show Password</label>
        </div>
        <input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="input"
          required
        />
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
          className="input"
        >
          <option value="">Select Course</option>
          <option value="BSCpE & BSMexE">BSCpE & BSMexE</option>
          <option value="COA">COA</option>
          <option value="CITCS">CITCS</option>
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="input"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="form-button">
          Signup
        </button>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Student Login
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Admin Login:{" "}
          <Link
            to="/admin/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Admin Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
