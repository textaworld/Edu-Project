import React, { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAdminContext } from "../hooks/useAdminContext";
import "../styles/instituteDetails.css";
import { FaTrash } from "react-icons/fa";

const AdminDetails = ({ instituteId }) => {
  const { user } = useAuthContext();
  const { admins, dispatch } = useAdminContext();
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [adminDetails, setAdminDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/admin/getall/${instituteId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch admins: ${response.status}`);
        }

        const json = await response.json();
        const reversedJson = [...json].reverse();
        dispatch({ type: "SET_ADMINS", payload: reversedJson });
      } catch (error) {
        
        dispatch({ type: "SET_ADMINS", payload: [] });
      }
    };

    if (user) {
      fetchAdmins();
    }
  }, [dispatch, instituteId, user]);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/admin/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.ok) {
        const deletedAdmin = await response.json();
        dispatch({ type: "DELETE_ADMIN", payload: id });
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
      
    }
  };

  const handleAdminDelete = async () => {
    if (adminDetails.email === userEmail) {
      await handleDelete(adminDetails._id);
      setUserEmail("");
      setAdminDetails(null);
      setError(null);

      setShowDeletePopup(false);
    } else {
      setError("Email didn't match");
      setUserEmail("");
    }
  };
  const handlePopUp = (admin) => {
    setAdminDetails(admin);
    setShowDeletePopup(true);
  };

  return (
    <div>
      <div className="instituteTableContainer">
        <div className="tableTopicContaner">
          <h2>Admins</h2>
        </div>

        <table className="instituteTable">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {admins && admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                  <td>
                    <div className="deleteicon">
                      <FaTrash
                        onClick={() => {
                          handlePopUp(admin);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No admins found</td>
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
              <h3>Delete Admin</h3>
            </div>
            <div className="create-popup-box">
              <p>
                To confirm the deletion of the admin, please enter the admin's
                email address below. <br/>This action cannot be undone.
              </p>
              <label>
                <input
                  type="text"
                  placeholder="Enter Admin Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </label>
              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>

              <div className="buttonContainer">
                <button className="addButton" onClick={handleAdminDelete}>
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

export default AdminDetails;
