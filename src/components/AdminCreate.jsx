import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAdminContext } from "../hooks/useAdminContext";
import "../styles/instituteCreate.css"; // Import the CSS file
import Spinner from "./Spinner";

const AdminCreate = ({ instituteId, onClose, onSuccess }) => {
  const { user } = useAuthContext();
  const { dispatch } = useAdminContext();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const admin = { email, password, role, instituteId };

    const response = await fetch("https://edu-project-backend.onrender.com/api/admin/register", {
      method: "POST",
      body: JSON.stringify(admin),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setIsLoading(false);
      setError(json.error);
      if (json.emptyFields) {
        setEmptyFields(json.emptyFields);
      }
    } else {
      dispatch({ type: "CREATE_ADMIN", payload: json.admin });
      setEmail("");
      setPassword("");
      setRole("");
      setError(null);

      setIsLoading(false);
      onSuccess();
    }
  };

  return (
    <div>
      <div className="overlay" onClick={onClose}></div>

      <div className="create-popup">
        {isLoading && <Spinner />}
        <div className="popup_topic">
          <h3>Add a New admin</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter a Email"
              //className={emptyFields.includes("email") ? "error" : ""}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Enter a valid email address"
            />
          </label>
          <label>
            Password:
            <input
              type="text"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Enter a password"
              className={emptyFields.includes("password") ? "error" : ""}
            />
          </label>
          <label>
            Role:
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={emptyFields.includes("role") ? "error" : ""}
            >
              <option value="" disabled hidden>
                Choose a role
              </option>
              <option value="ADMIN">Admin</option>
              <option value="SUB_ADMIN">SubAdmin</option>
              <option value="SCL_ADMIN">School Admin</option>
              <option value="SWIM_ADMIN">Swim Admin</option>  
            </select>  
          </label>

          <div className="errorContainer">
            {error && <div className="error">{error}</div>}
          </div>
          <div className="buttonContainer">
            <button className="addButton" type="submit"> 
              Add Admin
            </button>
            <button className="cancelButton" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
 
export default AdminCreate;
