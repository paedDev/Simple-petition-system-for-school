// src/pages/TeachersDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const TeachersDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  // reviewMap manages teacher review mode & comment:
  // { [petitionId]: { isReviewing, teacherReview, prerequisiteComment } }
  const [reviewMap, setReviewMap] = useState({});
  // For search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Teacher's expertise & username stored in localStorage
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
      const res = await axios.get("http://localhost:5000/api/petitions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter petitions based on teacher's expertise (if provided)
      let filtered = res.data;
      if (teacherExpertise) {
        filtered = res.data.filter((petition) => {
          return (
            petition.subject &&
            petition.subject.toLowerCase() === teacherExpertise.toLowerCase()
          );
        });
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
          `http://localhost:5000/api/petitions/${petitionId}/voters`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVotersMap((prev) => ({ ...prev, [petitionId]: res.data.voters }));
      } catch (err) {
        console.error(err);
        toast.error("Error fetching voters");
      }
    }
  };

  // Toggle review mode for a petition.
  // Prepopulate teacherReview with the petition's teacherReview if available, or use teacherUsername.
  // Also initialize prerequisiteComment if available.
  const handleToggleReview = (petition) => {
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

  // Update teacherReview in reviewMap state.
  const handleReviewChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], teacherReview: value },
    }));
  };

  // Update prerequisiteComment in reviewMap state.
  const handleCommentChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], prerequisiteComment: value },
    }));
  };

  // Submit the teacher review update (both teacherReview and prerequisiteComment).
  const handleReviewSubmit = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { teacherReview, prerequisiteComment } = reviewMap[petitionId];
      await axios.put(
        `http://localhost:5000/api/petitions/${petitionId}`,
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

  // Filter petitions by title based on the search query (case-insensitive)
  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Teacher Dashboard</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Search Input */}
      <div style={{ margin: "20px 0", textAlign: "center", display: "flex", justifyContent: "space-around", width: "50%", margin: "auto", marginBottom: "5px" }}>
        <div>
          <p>Search the subject </p>
        </div>
        <input
          type="text"
          placeholder="Ex. CPENET"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ width: "50%" }}
        />
      </div>

      {filteredPetitions.length === 0 ? (
        <p>No petitions found for your expertise.</p>
      ) : (
        filteredPetitions.map((petition) => (
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
            {/* Display teacher review and comment if available */}
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
                onClick={() => handleToggleReview(petition)}
              >
                {petition.teacherReview ? "Edit Review" : "Review"}
              </button>
            </div>
            {/* If in review mode, display inputs for teacherReview and prerequisiteComment */}
            {reviewMap[petition._id] && reviewMap[petition._id].isReviewing && (
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
                    onClick={() => handleToggleReview(petition)}
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
        ))
      )}
    </div>
  );
};

export default TeachersDashboard;
