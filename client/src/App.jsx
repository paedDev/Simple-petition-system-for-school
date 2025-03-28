// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PetitionList from "./pages/PetitionList";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css"; // Import the custom CSS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PetitionList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
