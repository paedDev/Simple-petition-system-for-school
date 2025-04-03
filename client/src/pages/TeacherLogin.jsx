// // src/pages/TeacherLogin.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-hot-toast";
// import { BASE_URL } from "../config/config";

// const TeacherLogin = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post(`${BASE_URL}/api/auth/login`, {
//         email,
//         password,
//       });
//       if (res.data.role === "teacherAdmin") {
//         localStorage.setItem("token", res.data.token);
//         localStorage.setItem("role", res.data.role);
//         localStorage.setItem("userId", res.data.userId);
//         navigate("/teacher");
//       } else {
//         toast.error("Not authorized as teacher");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data.error || "Error during teacher login");
//     }
//   };

//   return (
//     <div className="auth-page">
//       <form onSubmit={handleSubmit} className="form-container">
//         <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
//           Teacher Login
//         </h2>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="input"
//           required
//         />
//         <input
//           type={showPassword ? "text" : "password"}
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="input"
//           required
//         />
//         <div className="checkbox-container">
//           <input
//             type="checkbox"
//             id="togglePasswordTeacher"
//             checked={showPassword}
//             onChange={() => setShowPassword(!showPassword)}
//           />
//           <label htmlFor="togglePasswordTeacher" style={{ marginLeft: "5px" }}>
//             Show Password
//           </label>
//         </div>
//         <button type="submit" className="form-button">
//           Login as Teacher
//         </button>
//         <p style={{ textAlign: "center", marginTop: "15px" }}>
//           Not a teacher?{" "}
//           <Link
//             to="/login"
//             style={{ color: "#0275d8", textDecoration: "underline" }}
//           >
//             Student Login
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default TeacherLogin;
