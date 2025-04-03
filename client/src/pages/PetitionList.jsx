// src/pages/PetitionList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config/config";

const PetitionList = () => {
  const [viewMode, setViewMode] = useState("list");
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  // actionMap manages inline admin action mode for a petition:
  // { [petitionId]: { isActioning: true, newStatus, adminComment } }
  const [actionMap, setActionMap] = useState({});
  // reviewMap manages the teacher review mode for a petition:
  // { [petitionId]: { isReviewing: true, teacherReview, prerequisiteComment } }
  const [reviewMap, setReviewMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  // Optional: Toggle between list and grid view styles
  const [isGridView, setIsGridView] = useState(false);
  const navigate = useNavigate();

  // Optionally prepopulate review field with logged-in user's username
  const userName = localStorage.getItem("username");

  useEffect(() => {
    fetchPetitions();
  }, []);

  // Fetch petitions from the server and sort them by vote count
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
      const sorted = res.data.sort(
        (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
      );
      setPetitions(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching petitions");
    }
  };

  // --- Teacher Review Functionality ---

  // Toggle review mode for a petition (allows editing teacher review and comment)
  const toggleReviewMode = (petition) => {
    setReviewMap((prev) => {
      if (prev[petition._id] && prev[petition._id].isReviewing) {
        const newState = { ...prev };
        delete newState[petition._id];
        return newState;
      } else {
        return {
          ...prev,
          [petition._id]: {
            isReviewing: true,
            teacherReview: petition.teacherReview || userName || "",
            prerequisiteComment: petition.prerequisiteComment || "",
          },
        };
      }
    });
  };

  // Update teacher review input value
  const handleReviewChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], teacherReview: value },
    }));
  };

  // Update teacher comment input value
  const handleCommentChange = (petitionId, value) => {
    setReviewMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], prerequisiteComment: value },
    }));
  };

  // Submit teacher review update
  const handleReviewSubmit = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { teacherReview, prerequisiteComment } = reviewMap[petitionId];
      await axios.put(
        `${BASE_URL}/api/petitions/${petitionId}`,
        { teacherReview, prerequisiteComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewMap((prev) => {
        const newState = { ...prev };
        delete newState[petitionId];
        return newState;
      });
      toast.success("Petition reviewed successfully");
      fetchPetitions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data.error || "Error updating review");
    }
  };

  // --- Admin Inline Actions ---

  // Toggle inline admin action mode for a petition (approve, deny, close, reopen)
  const toggleActionMode = (petitionId, targetStatus) => {
    setActionMap((prev) => {
      if (prev[petitionId] && prev[petitionId].isActioning) {
        const newState = { ...prev };
        delete newState[petitionId];
        return newState;
      } else {
        return {
          ...prev,
          [petitionId]: {
            isActioning: true,
            newStatus: targetStatus,
            adminComment:
              targetStatus === "approved" ? "You can enroll it now" : "",
          },
        };
      }
    });
  };

  // Confirm and submit the admin action update
  const handleConfirmAction = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { newStatus, adminComment } = actionMap[petitionId];
      await axios.put(
        `${BASE_URL}/api/petitions/${petitionId}`,
        { status: newStatus, adminComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPetitions((prev) =>
        prev.map((p) =>
          p._id === petitionId ? { ...p, status: newStatus, adminComment } : p
        )
      );
      toast.success(`Petition ${petitionId} updated to ${newStatus}`);
      setActionMap((prev) => {
        const newState = { ...prev };
        delete newState[petitionId];
        return newState;
      });
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  // Toggle the voters list for a petition
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

  // Delete a petition
  const handleDeletePetition = (petitionId) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`${BASE_URL}/api/petitions/${petitionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success(`Petition ${petitionId} deleted successfully`);
        fetchPetitions();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error deleting petition");
      });
  };

  // Logout and clear local storage
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Toggle view mode between list and grid
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "list" ? "grid" : "list"));
  };

  // Filter petitions based on search query (case-insensitive)
  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`container ${viewMode === "grid" ? "grid-view" : "list-view"}`}
    >
      <div className="header">
        <h1 className="title">Petition Dashboard</h1>
        <button className="button btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div
        style={{
          margin: "20px 5px 0 0",
          textAlign: "center",
          display: "flex",
          justifyContent: "space-around",
          width: "80%",
          margin: "auto",
        }}
      >
        <p>Search the subject</p>
        <input
          type="text"
          placeholder="Ex. CPENET"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input"
          style={{ width: "60%", marginRight: "10px" }}
        />
        <button className="button-grid" onClick={toggleViewMode}>
          {viewMode === "list" ? "Grid View" : "List View"}
        </button>
      </div>

      {filteredPetitions.length === 0 ? (
        <p>No petitions found.</p>
      ) : (
        <div className={isGridView ? "grid-container" : "list-container"}>
          {filteredPetitions.map((petition) => (
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

              {/* Display teacher review details if available */}
              {petition.teacherReview && (
                <p className="petition-meta">
                  Teacher Review: {petition.teacherReview}
                </p>
              )}
              {petition.prerequisiteComment && (
                <p>Teacher Comment: {petition.prerequisiteComment}</p>
              )}
              {petition.adminComment && (
                <p className="petition-meta">Reason: {petition.adminComment}</p>
              )}

              <div className="petition-actions">
                <button
                  className="button"
                  onClick={() => toggleReviewMode(petition)}
                >
                  {petition.teacherReview ? "Edit Review" : "Review"}
                </button>
                <button
                  className="button btn-approve"
                  onClick={() => toggleActionMode(petition._id, "approved")}
                >
                  Approve
                </button>
                <button
                  className="button btn-deny"
                  onClick={() => toggleActionMode(petition._id, "denied")}
                >
                  Deny
                </button>
                {petition.votes?.length >= 40 ? (
                  <button className="button btn-close" disabled>
                    Already reached 40 votes
                  </button>
                ) : petition.status !== "closed" ? (
                  <button
                    className="button btn-close"
                    onClick={() => toggleActionMode(petition._id, "closed")}
                  >
                    Close Petition
                  </button>
                ) : (
                  <button
                    className="button btn-open"
                    onClick={() => toggleActionMode(petition._id, "open")}
                  >
                    Reopen Petition
                  </button>
                )}
                <button
                  className="button btn-delete"
                  onClick={() => handleDeletePetition(petition._id)}
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

              {/* Inline teacher review section */}
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

              {/* Inline admin action section */}
              {actionMap[petition._id] &&
                actionMap[petition._id].isActioning && (
                  <div
                    className="action-container"
                    style={{ marginTop: "10px" }}
                  >
                    <input
                      type="text"
                      value={actionMap[petition._id].adminComment}
                      onChange={(e) =>
                        setActionMap((prev) => ({
                          ...prev,
                          [petition._id]: {
                            ...prev[petition._id],
                            adminComment: e.target.value,
                          },
                        }))
                      }
                      className="input"
                      placeholder="Enter reason (e.g., Student lacks prerequisite)"
                      style={{ width: "60%", marginRight: "10px" }}
                    />
                    <button
                      className="button btn-approve"
                      onClick={() => handleConfirmAction(petition._id)}
                    >
                      Confirm
                    </button>
                    <button
                      className="button"
                      onClick={() =>
                        setActionMap((prev) => {
                          const newState = { ...prev };
                          delete newState[petition._id];
                          return newState;
                        })
                      }
                    >
                      Cancel
                    </button>
                  </div>
                )}

              {/* Voters list section */}
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

export default PetitionList;
