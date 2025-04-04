// src/pages/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
  const [idNumber, setIdNumber] = useState(""); // Using idNumber instead of email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        idNumber, // Send idNumber for login
        password,
      });
      // Check that the user has a student role only
      if (res.data.role !== "student") {
        toast.error(
          "Only students are allowed to login here. Please use the appropriate login page."
        );
        return;
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      // Also store the student's course for further use (if returned by the backend)
      if (res.data.course) {
        localStorage.setItem("course", res.data.course);
      }
      navigate("/petition");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error during login");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Student Login
        </h2>
        <input
          type="text"
          placeholder="Student ID" // Updated placeholder
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
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
            id="togglePasswordLogin"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="togglePasswordLogin" style={{ marginLeft: "5px" }}>
            Show Password
          </label>
        </div>
        <button type="submit" className="form-button">
          Login
        </button>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Signup
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Are you program chair?{" "}
          <Link
            to="/admin/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Program Chair Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
