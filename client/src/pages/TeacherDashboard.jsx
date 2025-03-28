// src/pages/TeachersDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeachersDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  const [reviewMap, setReviewMap] = useState({}); // { [petitionId]: { isReviewing, teacherReview } }
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Teacher's expertise stored in localStorage (e.g., "Math", "Science")
  const teacherExpertise = localStorage.getItem("expertise");
  // Optionally, teacher's username stored on login:
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
      // Filter petitions based on teacher's expertise (assuming petition.subject exists)
      const filtered = res.data.filter(
        (petition) => petition.subject === teacherExpertise
      );
      setPetitions(filtered);
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

  // Toggle review mode for a petition
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
            // Pre-populate with teacher's name if available; otherwise empty string
            teacherReview: teacherUsername || "",
          },
        };
      }
    });
  };

  // Handle changes in the review input
  const handleReviewChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], teacherReview: value },
    }));
  };

  // Submit the teacher review update
  const handleReviewSubmit = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { teacherReview } = reviewMap[petitionId];
      // PUT request to update petition with teacherReview field.
      // Make sure your backend allows teacher review updates.
      await axios.put(
        `http://localhost:5000/api/petitions/${petitionId}`,
        { teacherReview },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewMap((prev) => ({
        ...prev,
        [petitionId]: { ...prev[petitionId], isReviewing: false },
      }));
      setNotification("Petition reviewed successfully");
      setTimeout(() => setNotification(null), 3000);
      fetchPetitions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data.error || "Error updating review");
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
        <h1 className="title">Teacher Dashboard</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {notification && <div className="notification">{notification}</div>}
      {petitions.length === 0 ? (
        <p>No petitions found for your expertise.</p>
      ) : (
        petitions.map((petition) => (
          <div key={petition._id} className="petition-card">
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
            <div className="petition-actions">
              <button
                className="button"
                onClick={() => handleToggleVoters(petition._id)}
              >
                {votersMap[petition._id] ? "Hide Voters" : "Show Voters"}
              </button>
              {/* If teacher has not yet reviewed this petition, show the Review button */}
              {!petition.teacherReview && (
                <button
                  className="button"
                  onClick={() => handleToggleReview(petition)}
                >
                  Review
                </button>
              )}
              {/* If in review mode, show input and Save/Cancel buttons */}
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
                      placeholder="Enter your review (e.g., your name)"
                    />
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
                )}
              {/* If petition already has a review, display it */}
              {petition.teacherReview && (
                <p className="petition-meta">
                  Reviewed by: {petition.teacherReview}
                </p>
              )}
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
        ))
      )}
    </div>
  );
};

export default TeachersDashboard;
