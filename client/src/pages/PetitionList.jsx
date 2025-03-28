// src/pages/PetitionList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PetitionList = () => {
  const [petitions, setPetitions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Map petition ID to its voters list; null means hidden
  const [votersMap, setVotersMap] = useState({});
  // Map to handle edit state per petition: { [petitionId]: { isEditing, title, description } }
  const [editMap, setEditMap] = useState({});
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/petitions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort petitions by votes length in descending order.
      const sorted = res.data.sort(
        (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
      );
      setPetitions(sorted);
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
      console.error(err);
      alert(err.response?.data.error || "Error creating petition");
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

  const handleToggleVoters = async (petitionId) => {
    if (votersMap[petitionId]) {
      // Hide voters if they are already shown
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

  // Functions for editing a petition
  const handleToggleEdit = (petition) => {
    setEditMap((prev) => {
      // Toggle editing state; if already editing, cancel edit.
      if (prev[petition._id] && prev[petition._id].isEditing) {
        return {
          ...prev,
          [petition._id]: { ...prev[petition._id], isEditing: false },
        };
      } else {
        return {
          ...prev,
          [petition._id]: {
            isEditing: true,
            title: petition.title,
            description: petition.description,
          },
        };
      }
    });
  };

  const handleEditChange = (petitionId, field, value) => {
    setEditMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], [field]: value },
    }));
  };

  const handleEditSubmit = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { title: newTitle, description: newDescription } =
        editMap[petitionId];
      // Update petition title and description. Ensure your backend allows this.
      await axios.put(
        `http://localhost:5000/api/petitions/${petitionId}`,
        { title: newTitle, description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMap((prev) => ({
        ...prev,
        [petitionId]: { ...prev[petitionId], isEditing: false },
      }));
      fetchPetitions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Error updating petition");
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
          {editMap[petition._id] && editMap[petition._id].isEditing ? (
            // Edit mode: show input fields for title and description
            <>
              <input
                type="text"
                value={editMap[petition._id].title}
                onChange={(e) =>
                  handleEditChange(petition._id, "title", e.target.value)
                }
                className="input"
              />
              <textarea
                value={editMap[petition._id].description}
                onChange={(e) =>
                  handleEditChange(petition._id, "description", e.target.value)
                }
                className="input"
              />
              <div className="petition-actions">
                <button
                  className="button btn-approve"
                  onClick={() => handleEditSubmit(petition._id)}
                >
                  Save
                </button>
                <button
                  className="button"
                  onClick={() => handleToggleEdit(petition)}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            // Normal view mode: display petition details
            <>
              <h2 className="petition-title">{petition.title}</h2>
              <p className="petition-description">{petition.description}</p>
              <p className="petition-meta">Status: {petition.status}</p>
              <p className="petition-meta">
                Votes: {petition.votes?.length || 0}
              </p>
              <p className="petition-meta">
                By: {petition.createdBy?.username || "Unknown"}
              </p>
              <p className="petition-meta">
                Created: {new Date(petition.createdAt).toLocaleString()}
              </p>
              {/* Show teacher review if it exists and if the current role is teacher */}
              {role === "teacher" && petition.teacherReview && (
                <p className="petition-meta">
                  Reviewed by: {petition.teacherReview}
                </p>
              )}
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
                  <button
                    className="button"
                    onClick={() => handleToggleVoters(petition._id)}
                  >
                    {votersMap[petition._id] ? "Hide Voters" : "Show Voters"}
                  </button>
                  <button
                    className="button"
                    onClick={() => handleToggleEdit(petition)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </>
          )}
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

export default PetitionList;
