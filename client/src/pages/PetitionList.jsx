// src/pages/PetitionList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const PetitionList = () => {
  const [petitions, setPetitions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // For search functionality
  const [searchQuery, setSearchQuery] = useState("");
  // Map petition ID to its voters list; null means hidden
  const [votersMap, setVotersMap] = useState({});
  // Map to handle edit state per petition: { [petitionId]: { isEditing, title, description } }
  const [editMap, setEditMap] = useState({});
  // View mode: "list" or "grid"
  const [viewMode, setViewMode] = useState("list");
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
        "http://localhost:5000/api/petitions",
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
        `http://localhost:5000/api/petitions/${id}/vote`,
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

  // Functions for editing a petition (only for students)
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
        `http://localhost:5000/api/petitions/${petitionId}`,
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

  // Toggle between list and grid views
  const handlePrintVoters = (voters) => {
    const printWindow = window.open("", "_blank");
    const printContent = `
    <html>
      <head>
        <title>Voters List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { padding: 5px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <h1>Voters List</h1>
        <ul>
          ${voters.map((voter) => `<li>ID: ${voter.idNumber}</li>`).join("")}
        </ul>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  const filteredPetitions = petitions.filter((petition) =>
    petition.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPetitions = filteredPetitions.filter(
    (petition) => petition.status === "open"
  );
  const processedPetitions = filteredPetitions.filter(
    (petition) => petition.status !== "open"
  );

  const renderPetitionCard = (petition) => (
    <div key={petition._id} className={`petition-card ${viewMode}`}>
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
        <>
          <h2 className="petition-title">{petition.title}</h2>
          <p className="petition-description">{petition.description}</p>
          <p className="petition-meta">
            Status:{" "}
            <span className={`status-badge status-${petition.status}`}>
              {petition.status}
            </span>
          </p>
          <p className="petition-meta">
            Petitioner: {petition.votes?.length || 0}
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
            {/* Keep existing action buttons */}
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
                    Petition
                  </button>
                )}
                <button
                  className="button"
                  onClick={() => handleToggleVoters(petition._id)}
                >
                  {votersMap[petition._id]
                    ? "Hide Petitioners"
                    : "Show Petitioners"}
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
          <div className="voters-header">
            <h3>Voters:</h3>
            <button
              className="button btn-print"
              onClick={() => handlePrintVoters(votersMap[petition._id])}
            >
              Print Voters
            </button>
          </div>
          <ul>
            {votersMap[petition._id].map((voter) => (
              <li key={voter._id}>ID: {voter.idNumber}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="container">
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

      <div className="controls">
        <input
          type="text"
          placeholder="Search petitions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="split-view">
        <div className="column open-petitions">
          <h2>Open Petitions ({openPetitions.length})</h2>
          {openPetitions.length === 0 ? (
            <p className="empty-state">No open petitions found</p>
          ) : (
            openPetitions.map(renderPetitionCard)
          )}
        </div>

        <div className="column processed-petitions">
          <h2>Processed Petitions ({processedPetitions.length})</h2>
          {processedPetitions.length === 0 ? (
            <p className="empty-state">No processed petitions found</p>
          ) : (
            processedPetitions.map(renderPetitionCard)
          )}
        </div>
      </div>
    </div>
  );
};

export default PetitionList;
