// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await axios.get("http://localhost:5000/api/petitions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPetitions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/petitions/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPetitions(
        petitions.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
      );
      setNotification(`Petition ${id} updated to ${newStatus}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/petitions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPetitions(petitions.filter((p) => p._id !== id));
      setNotification(`Petition ${id} deleted successfully`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Example: petitions with votes.length >= 40 and notified flag true
  const notifiedPetitions = petitions.filter(
    (p) => p.votes?.length >= 40 && p.notified
  );

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Admin Dashboard</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {notification && <div className="notification">{notification}</div>}
      {notifiedPetitions.length > 0 && (
        <div className="alert">
          {notifiedPetitions.length} petition(s) have reached 40 votes!
        </div>
      )}
      {petitions.map((petition) => (
        <div key={petition._id} className="petition-card">
          <h2 className="petition-title">{petition.title}</h2>
          <p className="petition-description">{petition.description}</p>
          <p className="petition-meta">Status: {petition.status}</p>
          <p className="petition-meta">Votes: {petition.votes?.length || 0}</p>
          <p className="petition-meta">
            By: {petition.createdBy?.username || "Unknown"}
          </p>
          <div className="petition-actions">
            <button
              className="button btn-approve"
              onClick={() => handleStatusChange(petition._id, "approved")}
            >
              Approve
            </button>
            <button
              className="button btn-deny"
              onClick={() => handleStatusChange(petition._id, "denied")}
            >
              Deny
            </button>
            {petition.status !== "closed" ? (
              <button
                className="button btn-close"
                onClick={() => handleStatusChange(petition._id, "closed")}
              >
                Close Petition
              </button>
            ) : (
              <button
                className="button btn-open"
                onClick={() => handleStatusChange(petition._id, "open")}
              >
                Reopen Petition
              </button>
            )}
            <button
              className="button btn-delete"
              onClick={() => handleDelete(petition._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
