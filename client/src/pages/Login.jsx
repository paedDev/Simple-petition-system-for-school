import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      // Navigate based on role:
      if (res.data.role === "admin") {
        navigate("/admin");
      } else if (res.data.role === "teacherAdmin") {
        navigate("/teacher");
      } else {
        // default to student dashboard or homepage
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Error during login");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Student Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          Are you an admin?{" "}
          <Link
            to="/admin/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Admin Login
          </Link>
        </p>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Are you a teacher?{" "}
          <Link
            to="/teacher/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Teacher Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
