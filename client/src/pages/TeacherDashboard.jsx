// src/pages/TeachersDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config/config"; // Import the BASE_URL

const TeachersDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  const [reviewMap, setReviewMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const navigate = useNavigate();

  const teacherExpertise = localStorage.getItem("expertise");
  const teacherUsername = localStorage.getItem("username");

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
      const res = await axios.get(`${BASE_URL}/api/petitions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let filtered = res.data;
      if (teacherExpertise) {
        filtered = res.data.filter(
          (petition) =>
            petition.subject &&
            petition.subject.toLowerCase() === teacherExpertise.toLowerCase()
        );
      }
      setPetitions(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching petitions");
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

  const toggleReviewMode = (petition) => {
    setReviewMap((prev) => {
      if (prev[petition._id] && prev[petition._id].isReviewing) {
        return {
          ...prev,
          [petition._id]: { ...prev[petition._id], isReviewing: false },
        };
      } else {
        return {
          ...prev,
          [petition._id]: {
            isReviewing: true,
            teacherReview: petition.teacherReview || teacherUsername || "",
            prerequisiteComment: petition.prerequisiteComment || "",
          },
        };
      }
    });
  };

  const handleReviewChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], teacherReview: value },
    }));
  };

  const handleCommentChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], prerequisiteComment: value },
    }));
  };

  const handleReviewSubmit = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { teacherReview, prerequisiteComment } = reviewMap[petitionId];
      await axios.put(
        `${BASE_URL}/api/petitions/${petitionId}`,
        { teacherReview, prerequisiteComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewMap((prev) => ({
        ...prev,
        [petitionId]: { ...prev[petitionId], isReviewing: false },
      }));
      toast.success("Petition reviewed successfully");
      fetchPetitions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error updating review");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "list" ? "grid" : "list"));
  };

  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`container ${viewMode === "grid" ? "grid-view" : "list-view"}`}
    >
      <div
        className="header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="title">Teacher Dashboard</h1>
        <div>
          <button className="button btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

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
        <p>No petitions found for your expertise.</p>
      ) : (
        <div
          className={viewMode === "grid" ? "grid-container" : "list-container"}
        >
          {filteredPetitions.map((petition) => (
            <div key={petition._id} className="petition-card">
              <h2 className="petition-title">{petition.title}</h2>
              <p className="petition-description">{petition.description}</p>
              {petition.timeRange && (
                <p className="petition-meta">Time: {petition.timeRange}</p>
              )}
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
              {petition.teacherReview && (
                <p className="petition-meta">
                  Reviewed by: {petition.teacherReview}
                </p>
              )}
              {petition.prerequisiteComment && (
                <p className="petition-meta">
                  Comment: {petition.prerequisiteComment}
                </p>
              )}
              <div className="petition-actions">
                <button
                  className="button"
                  onClick={() => handleToggleVoters(petition._id)}
                >
                  {votersMap[petition._id] ? "Hide Voters" : "Show Voters"}
                </button>
                <button
                  className="button"
                  onClick={() => toggleReviewMode(petition)}
                >
                  {petition.teacherReview ? "Edit Review" : "Review"}
                </button>
              </div>
              {reviewMap[petition._id] &&
                reviewMap[petition._id].isReviewing && (
                  <div className="review-container">
                    <input
                      type="text"
                      value={reviewMap[petition._id].teacherReview}
                      onChange={(e) =>
                        handleReviewChange(petition._id, e.target.value)
                      }
                      className="input"
                      placeholder="Enter your review (e.g., Sir Warren)"
                    />
                    <input
                      type="text"
                      value={reviewMap[petition._id].prerequisiteComment}
                      onChange={(e) =>
                        handleCommentChange(petition._id, e.target.value)
                      }
                      className="input"
                      placeholder="Enter comment (e.g., student lacks prerequisite)"
                      style={{ marginTop: "8px" }}
                    />
                    <div className="petition-actions">
                      <button
                        className="button btn-approve"
                        onClick={() => handleReviewSubmit(petition._id)}
                      >
                        Save Review
                      </button>
                      <button
                        className="button"
                        onClick={() => toggleReviewMode(petition)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default TeachersDashboard;
