import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PetitionList from "./pages/PetitionList";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CoaAdminDashboard from "./pages/CoaAdminDashboard";
import BSNAdminDashboard from "./pages/BSNAdminDashboard";
// import AdminDashboardByCourse from "./pages/AdminDashboardByCourse";
// if you have one
import "./index.css";
import CitcsAdminDashboard from "./pages/CitcsAdminDashboard";
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/" element={<PetitionList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/bscpe" element={<AdminDashboard />} />
          <Route path="/admin/coa" element={<CoaAdminDashboard />} />
          <Route path="/admin/bsn" element={<BSNAdminDashboard />} />
          <Route path="/admin/citcs" element={<CitcsAdminDashboard />} />
          {/* <Route
            path="/admin/course-dashboard"
            element={<AdminDashboardByCourse />}
          /> */}
          {/* <Route path="/teacher/login" element={<TeacherLogin />} /> */}

          {/* <Route path="/teacher" element={<TeacherDashboard />} /> */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
