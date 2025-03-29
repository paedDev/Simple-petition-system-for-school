// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  // actionMap manages inline admin action mode for a petition:
  // { [petitionId]: { isActioning: true, newStatus, adminComment } }
  const [actionMap, setActionMap] = useState({});
  // For search functionality (by title)
  const [searchQuery, setSearchQuery] = useState("");
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
      // Filter petitions to show only those that have been reviewed by a teacher (either teacherReview or prerequisiteComment exists)
      const reviewed = res.data.filter(
        (petition) => petition.teacherReview || petition.prerequisiteComment
      );
      // Sort reviewed petitions by votes in descending order.
      const sorted = reviewed.sort(
        (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
      );
      setPetitions(sorted);
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

  // Toggle action mode for a petition with the given target status.
  // For "approved", prepopulate the reason with a default message.
  const toggleActionMode = (petitionId, targetStatus) => {
    setActionMap((prev) => {
      if (prev[petitionId] && prev[petitionId].isActioning) {
        // Cancel action mode for this petition.
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

  // Handle changes in the admin comment input.
  const handleActionCommentChange = (petitionId, value) => {
    setActionMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], adminComment: value },
    }));
  };

  // Confirm and submit the admin action.
  const handleConfirmAction = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { newStatus, adminComment } = actionMap[petitionId];
      // Update petition with new status and adminComment.
      await axios.put(
        `http://localhost:5000/api/petitions/${petitionId}`,
        { status: newStatus, adminComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state.
      setPetitions((prev) =>
        prev.map((p) =>
          p._id === petitionId ? { ...p, status: newStatus, adminComment } : p
        )
      );
      toast.success(`Petition ${petitionId} updated to ${newStatus}`);
      // Remove action mode for this petition.
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
        <h1 className="title">Admin Dashboard</h1>
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
        <p>No reviewed petitions found.</p>
      ) : (
        filteredPetitions.map((petition) => (
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
            {/* Render teacher review and comment if available */}
            {petition.teacherReview && (
              <p className="petition-meta">
                Teacher Review: {petition.teacherReview}
              </p>
            )}
            {petition.adminComment && (
              <p className="petition-meta">
                Reason: {petition.adminComment}
              </p>
            )}
            <div className="petition-actions">
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
                onClick={() => {
                  axios
                    .delete(`http://localhost:5000/api/petitions/${petition._id}`, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    })
                    .then(() => {
                      toast.success(`Petition ${petition._id} deleted successfully`);
                      fetchPetitions();
                    })
                    .catch((err) => {
                      console.error(err);
                      toast.error("Error deleting petition");
                    });
                }}
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

            {/* Inline admin action mode: input for admin comment */}
            {actionMap[petition._id] && actionMap[petition._id].isActioning && (
              <div className="action-container" style={{ marginTop: "10px" }}>
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

export default AdminDashboard;
