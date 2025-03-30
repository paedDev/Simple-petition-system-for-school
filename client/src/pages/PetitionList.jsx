// src/pages/PetitionList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config/config";

const PetitionList = () => {
  const [petitions, setPetitions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [votersMap, setVotersMap] = useState({});
  const [editMap, setEditMap] = useState({});
  const [viewMode, setViewMode] = useState("list");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const fetchPetitions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/petitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = res.data.sort(
        (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
      );
      setPetitions(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching petitions");
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
        `${BASE_URL}/api/petitions`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      toast.success("Petition created successfully");
      fetchPetitions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error creating petition");
    }
  };

  const handleVote = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/api/petitions/${id}/vote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.reached40) {
        toast("Petition reached 40 votes!");
      } else {
        toast.success("Vote recorded!");
      }
      fetchPetitions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error while voting");
    }
  };

  const handleToggleVoters = async (petitionId) => {
    if (votersMap[petitionId]) {
      setVotersMap((prev) => ({ ...prev, [petitionId]: null }));
    } else {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/api/petitions/${petitionId}/voters`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVotersMap((prev) => ({ ...prev, [petitionId]: res.data.voters }));
      } catch (err) {
        console.error(err);
        toast.error("Error fetching voters");
      }
    }
  };

  const handleToggleEdit = (petition) => {
    setEditMap((prev) => {
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
      await axios.put(
        `${BASE_URL}/api/petitions/${petitionId}`,
        { title: newTitle, description: newDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMap((prev) => ({
        ...prev,
        [petitionId]: { ...prev[petitionId], isEditing: false },
      }));
      toast.success("Petition updated successfully");
      fetchPetitions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error updating petition");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "list" ? "grid" : "list"));
  };

  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`container ${viewMode === "grid" ? "grid-view" : "list-view"}`}
    >
      <div className="header">
        <h1 className="title">Petitions</h1>
        <div>
          <button className="button btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {role === "student" && (
        <form
          onSubmit={handleSubmit}
          className="form-container"
          style={{ width: "100%", maxWidth: "755px" }}
        >
          <input
            type="text"
            placeholder="Subject"
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

      <div
        style={{
          margin: "20px 0",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-around",
          width: "80%",
          margin: "auto",
          marginBottom: "5px",
        }}
      >
        <div>
          <p>Search the subject </p>
        </div>
        <input
          type="text"
          placeholder="Ex. CPENET"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ width: "60%", marginRight: "10px" }}
        />
        <div>
          <button className="button-grid" onClick={toggleViewMode}>
            {viewMode === "list" ? "Grid View" : "List View"}
          </button>
        </div>
      </div>

      {filteredPetitions.length === 0 ? (
        <p>No petitions found matching your search.</p>
      ) : (
        filteredPetitions.map((petition) => (
          <div key={petition._id} className="petition-card">
            {editMap[petition._id] && editMap[petition._id].isEditing ? (
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
                    handleEditChange(
                      petition._id,
                      "description",
                      e.target.value
                    )
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
                {role === "student" &&
                  petition.status !== "open" &&
                  petition.teacherReview && (
                    <p className="petition-meta">
                      Reviewed by: {petition.teacherReview}
                    </p>
                  )}
                {role === "student" &&
                  petition.status !== "open" &&
                  petition.adminComment && (
                    <p className="petition-meta">
                      Admin Decision: {petition.adminComment}
                    </p>
                  )}
                {role === "teacher" && petition.teacherReview && (
                  <p className="petition-meta">
                    Reviewed by: {petition.teacherReview}
                  </p>
                )}
                <div className="petition-actions">
                  {role === "student" && (
                    <div>
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
                        {votersMap[petition._id]
                          ? "Hide Voters"
                          : "Show Voters"}
                      </button>
                      <button
                        className="button"
                        onClick={() => handleToggleEdit(petition)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  {role === "teacher" && (
                    <button
                      className="button"
                      onClick={() => handleToggleVoters(petition._id)}
                    >
                      {votersMap[petition._id] ? "Hide Voters" : "Show Voters"}
                    </button>
                  )}
                </div>
              </>
            )}
            {votersMap[petition._id] && (
              <div className="voters-list">
                <h3>Voters:</h3>
                <ul>
                  {votersMap[petition._id].map((voter) => (
                    <li key={voter._id}>
                      ID: {voter.idNumber} - Email: {voter.email}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PetitionList;
