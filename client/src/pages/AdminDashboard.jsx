// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const res = await axios.get("http://localhost:5000/api/petitions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort petitions by votes in descending order.
      const sorted = res.data.sort(
        (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
      );
      setPetitions(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVoters = async (petitionId) => {
    if (votersMap[petitionId]) {
      setVotersMap((prev) => ({ ...prev, [petitionId]: null }));
    } else {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/petitions/${petitionId}/voters`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVotersMap((prev) => ({ ...prev, [petitionId]: res.data.voters }));
      } catch (err) {
        console.error(err);
        alert("Error fetching voters");
      }
    }
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Admin Dashboard</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {notification && <div className="notification">{notification}</div>}
      {petitions.map((petition) => (
        <div key={petition._id} className="petition-card">
          <h2 className="petition-title">{petition.title}</h2>
          <p className="petition-description">{petition.description}</p>
          <p className="petition-meta">Status: {petition.status}</p>
          <p className="petition-meta">Votes: {petition.votes?.length || 0}</p>
          <p className="petition-meta">
            By: {petition.createdBy?.username || "Unknown"}
          </p>
          <p className="petition-meta">
            Created: {new Date(petition.createdAt).toLocaleString()}
          </p>
          {/* Display teacher review if available */}
          {petition.teacherReview && (
            <p className="petition-meta">
              Teacher Review: {petition.teacherReview}
            </p>
          )}
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
            <button
              className="button"
              onClick={() => handleToggleVoters(petition._id)}
            >
              {votersMap[petition._id] ? "Hide Voters" : "Show Voters"}
            </button>
          </div>
          {votersMap[petition._id] && (
            <div className="voters-list">
              <h3>Voters:</h3>
              <ul>
                {votersMap[petition._id].map((voter) => (
                  <li key={voter._id}>
                    {voter.username} ({voter.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
