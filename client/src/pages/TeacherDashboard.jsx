// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("list");
  const [petitions, setPetitions] = useState([]);
  const [votersMap, setVotersMap] = useState({});
  const [actionMap, setActionMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(false);
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
      const reviewed = res.data.filter(
        (petition) => petition.teacherReview || petition.prerequisiteComment
      );
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

  const handleActionCommentChange = (petitionId, value) => {
    setActionMap((prev) => ({
      ...prev,
      [petitionId]: { ...prev[petitionId], adminComment: value },
    }));
  };

  const handleConfirmAction = async (petitionId) => {
    try {
      const token = localStorage.getItem("token");
      const { newStatus, adminComment } = actionMap[petitionId];
      await axios.put(
        `http://localhost:5000/api/petitions/${petitionId}`,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const toggleGridView = () => {
    setIsGridView((prev) => !prev);
  };
  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "list" ? "grid" : "list"));
  };

  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`container ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
      <div className="header">
        <h1 className="title">Admin Dashboard</h1>
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
        <p>No reviewed petitions found.</p>
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
                        toast.success(
                          `Petition ${petition._id} deleted successfully`
                        );
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
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
