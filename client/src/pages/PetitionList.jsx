// src/pages/PetitionList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PetitionList = () => {
  const [petitions, setPetitions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/petitions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPetitions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPetitions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/petitions",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      fetchPetitions();
    } catch (err) {
      console.error(
        "Error creating petition:",
        err.response?.data || err.message
      );
    }
  };

  const handleVote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/petitions/${id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.reached40) {
        alert("Petition reached 40 votes!");
      }
      fetchPetitions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Error while voting");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Petitions</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {role === "student" && (
        <form
          onSubmit={handleSubmit}
          className="form-container"
          style={{ width: "100%", maxWidth: "500px" }}
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="form-button">
            Create Petition
          </button>
        </form>
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
          {role === "student" && (
            <div className="petition-actions">
              {petition.status === "closed" ? (
                <button
                  disabled
                  className="button"
                  style={{ backgroundColor: "#ccc", color: "#fff" }}
                >
                  Closed
                </button>
              ) : (
                <button
                  className="button btn-approve"
                  onClick={() => handleVote(petition._id)}
                >
                  Vote
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PetitionList;
