import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminLogin = () => {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        idNumber,
        password,
      });
      if (res.data.role === "admin") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("course", res.data.course); // Save admin's course

        // Redirect based on the admin's course
        const course = res.data.course;
        if (course === "CITCS") {
          navigate("/admin/citcs");
        } else if (course === "BSN") {
          navigate("/admin/bsn");
        } else if (course === "COA") {
          navigate("/admin/coa");
        } else if (course === "BSCpE & BSMexE") {
          navigate("/admin/bscpe");
        } else {
          // Fallback in case course doesn't match any route
          navigate("/admin");
        }
      } else {
        toast.error("Not authorized as admin");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error during admin login");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="form-container">
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Program Chair Login
        </h2>
        <input
          type="text"
          placeholder="ID Number"
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
            id="togglePasswordAdmin"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <label htmlFor="togglePasswordAdmin" style={{ marginLeft: "5px" }}>
            Show Password
          </label>
        </div>
        <button type="submit" className="form-button">
          Login as Program Chair
        </button>
        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Not Program Chair ?{" "}
          <Link
            to="/login"
            style={{ color: "#0275d8", textDecoration: "underline" }}
          >
            Student Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
