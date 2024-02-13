import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useInstitutesContext } from "../hooks/useInstitutesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAdminContext } from "../hooks/useAdminContext";
import { FaTrash } from "react-icons/fa";

import "../styles/instituteDetails.css";

const InstituteDetails = () => {
  const { institutes, dispatch } = useInstitutesContext();
  const { user } = useAuthContext();
  const { dispatch: adDispatch } = useAdminContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userName, setUserName] = useState("");
  const [instituteDetails, setInstituteDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstitutes = async () => {
      const response = await fetch(
        "https://edcuation-app.onrender.com/api/institute/getall",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();
      const reversedJson = [...json].reverse();

      if (response.ok) {
        dispatch({ type: "SET_INSTITUES", payload: reversedJson });
        adDispatch({ type: "SET_ADMINS", payload: [] });
      }
    };

    if (user) {
      fetchInstitutes();
    }
  }, [dispatch, adDispatch, user]);

  const filteredInstitutes = institutes.filter((institute) =>
    institute.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://edcuation-app.onrender.com/api/institute/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const deletedInstitute = await response.json();
        dispatch({ type: "DELETE_INSTITUE", payload: id });
      } else {
        const errorData = await response.json();
        
      }
    } catch (error) {
      
    }
  };

  const handleInstituteDelete = async () => {
    if (instituteDetails.name === userName) {
      await handleDelete(instituteDetails._id);
      setUserName("");
      setInstituteDetails(null);
      setError(null);

      setShowDeletePopup(false);
    } else {
      setError("Name didn't match");
      setUserName("");
    }
  };
  const handlePopUp = (institute) => {
    setInstituteDetails(institute);
    setShowDeletePopup(true);
  };

  return (
    <div>
      <div className="instituteTableContainer">
        <input
          type="search"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchInput"
        />

        <table className="instituteTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>

              <th>Student Limit</th>
              <th>Notification</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredInstitutes.length > 0 ? (
              filteredInstitutes.map((institute) => (
                <tr key={institute._id}>
                  <td>{institute.name}</td>
                  <td>{institute.email}</td>
                  <td>{institute.count}</td>
                  <td>{institute.notification}</td>
                  <td>
                    <Link to={`/sadmin/instituteadmins/${institute._id}`}>View</Link>
                  </td>
                  <td>
                    <div className="deleteicon">
                      <FaTrash
                        onClick={() => {
                          handlePopUp(institute);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No institutes found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showDeletePopup && (
        <div>
          <div
            className="overlay"
            onClick={() => setShowDeletePopup(false)}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Delete Institute</h3>
            </div>
            <div className="create-popup-box">
              <p>
                To confirm the deletion, please enter the name of the institute
                below. This action cannot be undone.
              </p>
              <label>
               
                <input
                  type="text"
                  placeholder="Enter Institute Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </label>
              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>

              <div className="buttonContainer">
                <button className="addButton" onClick={handleInstituteDelete}>
                  Confirm Deletion
                </button>
                <button
                  className="cancelButton"
                  onClick={() => setShowDeletePopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteDetails;
