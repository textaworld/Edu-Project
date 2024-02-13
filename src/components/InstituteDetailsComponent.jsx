import React, { useState, useEffect } from "react";
import { useInstitutesContext } from "../hooks/useInstitutesContext";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/instituteDetailsComponent.css";
import "../styles/instituteCreate.css"; // Import the CSS file

const InstituteDetailsComponent = ({ instituteId, onOpen }) => {
 // State variables related to context and authentication
 const { institutes, dispatch } = useInstitutesContext();
 const { user } = useAuthContext();

 // State variables for managing popup visibility
 const [showCountPopup, setShowCountPopup] = useState(false);
 const [showEditInstituteDetailsPopup, setShowEditInstituteDetailsPopup] = useState(false);
 const [showNotificationPopup, setShowNotificationPopup] = useState(false);
 const [showPackagePopup, setShowPackagePopup] = useState(false);
 const [showPackageTimePopup, setShowPackageTimePopup] = useState(false);

 // State variables for managing institute details
 const [newName, setNewName] = useState("");
 const [newEmail, setNewEmail] = useState("");
 const [newImage, setNewImage] = useState(null);
 const [newCount, setNewCount] = useState("");
 const [newNotification, setNewNotification] = useState("");
 const [instituteDetails, setInstituteDetails] = useState(null);
 const [error, setError] = useState(null);

 // State variables for managing package details
 const [newPackage, setNewPackage] = useState("");
 const [newPackageTime, setNewPackageTime] = useState("");
 
  const getInstituteDetails = (id) =>
    institutes.find((inst) => inst._id === id) || null;

  useEffect(() => {
    const insdetails = getInstituteDetails(instituteId);
    setInstituteDetails(insdetails);
    setNewCount(insdetails.count);
    setNewName(insdetails.name);
    setNewEmail(insdetails.email);
    setNewNotification(insdetails.notification);
    setNewImage(insdetails.image);
  }, [institutes, instituteId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDetails = async (data) => {
    try {
      const response = await fetch(
        `https://edcuation-app.onrender.com/api/institute/update/${instituteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
        throw new Error(`Failed to update details: ${response.status}`);
      }
      if (response.ok) {
        setError(null);
        dispatch({
          type: "UPDATE_INSTITUTE",
          payload: { _id: instituteId, data },
        });

        setInstituteDetails(getInstituteDetails(instituteId));
      }
    } catch (error) {
      
      // Handle error (e.g., display an error message)
    }
  };

  const handleCountUpdate = () => {
    if (newCount == "") {
      setError("please fill student limit");
    } else {
      updateDetails({ count: newCount });
      setShowCountPopup(false);
      // Reset error if it was previously set
      setError(null);
    }
  };

  const handleNotificationUpdate = () => {
    if (newNotification == "") {
      setError("please select a value");
    } else {
      updateDetails({ notification: newNotification });
      setShowNotificationPopup(false);
      // Reset error if it was previously set
      setError(null);
    }
  };

  const handlePackageUpdate = () => {
    if (newPackage == "") {
      setError("please select a value");
    } else {
      updateDetails({ packageStatus: newPackage });
      setShowPackagePopup(false);
      // Reset error if it was previously set
      setError(null);
    }
  };

  const handlePackageTimeUpdate = () => {

    if (newPackageTime == "") {
      setError("please select a value");
    } else {
      // const expirationTime = new Date(
      //   newPackageTime * 60000 + new Date().getTime()
      // );
      const currentDate = new Date();


      const expirationTime = new Date(currentDate.getTime() + newPackageTime * 30 * 24 * 60 * 60 * 1000);


      const colomboTimeZone = "Asia/Colombo";
      const expireTimeColombo = expirationTime.toLocaleString("en-US", {
        timeZone: colomboTimeZone,
      });


      updateDetails({
        instPackage: newPackageTime,
        expireTime: expireTimeColombo,
      });
      setShowPackageTimePopup(false);
      // Reset error if it was previously set
      setError(null);
    }
  };

  const handleInstituteDetailsUpdate = () => {
    if (newName == "" || newEmail == "" || newImage == "") {
      setError("please fill all feilds");
    } else {
      updateDetails({ name: newName, email: newEmail, image: newImage });
      setShowEditInstituteDetailsPopup(false);
      // Reset error if it was previously set
      setError(null);
    }
  };

  return (
    <div>
      <div className="instituteDetailsContainer">
        <div className="instituteDetailsContainer-topic">
          {instituteDetails && (
            <>
              <div>
                <h1 className="instituteName">{instituteDetails.name}</h1>
                <p className="instituteEmail">{instituteDetails.email}</p>
              </div>
              <div className="instituteDetailsContainer-image">
                <img src={instituteDetails.image} alt="Institute logo" />
              </div>
            </>
          )}
        </div>
        {instituteDetails && (
          <div className="detailsSection">
            <div className="detailsSectionPart">
              <h2>Student Limit </h2>
              <p>{instituteDetails.count}</p>
              <div className="instituteAddButtonContainer">
                <button onClick={() => setShowCountPopup(true)}>
                  Update Limit
                </button>
              </div>
            </div>

            <div className="detailsSectionPart">
              <h2>Notification Service </h2>
              <p> {instituteDetails.notification}</p>
              <div className="instituteAddButtonContainer">
                <button onClick={() => setShowNotificationPopup(true)}>
                  Update Notification
                </button>
              </div>
            </div>

            <div className="detailsSectionPart">
              <h2>Package </h2>
              <p> {instituteDetails.instPackage}</p>
              <div className="instituteAddButtonContainer">
                <button onClick={() => setShowPackageTimePopup(true)}>
                  Update Package
                </button>
              </div>
            </div>

            <div className="detailsSectionPart">
              <h2>Package Status </h2>
              <p> {instituteDetails.packageStatus}</p>
              <div className="instituteAddButtonContainer">
                <button onClick={() => setShowPackagePopup(true)}>
                  Action
                </button>
              </div>
            </div>

            <div className="detailsSectionPart">
              <h2>Edit Institute Details</h2>
              <p>
                Click the "Edit" button below to modify the institute's name,
                email, and logo.
              </p>
              <div className="instituteAddButtonContainer">
                <button onClick={() => setShowEditInstituteDetailsPopup(true)}>
                  Edit
                </button>
              </div>
            </div>

            <div className="detailsSectionPart">
              <h2>Add New Admin</h2>
              <p>
                Click the "Add Admin" button below to add a new administrator
                for the institute.
              </p>
              <div className="instituteAddButtonContainer">
                <button onClick={onOpen}>Add Admin</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCountPopup && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowCountPopup(false), setError(null);
            }}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Update Student Limit</h3>
            </div>
            <div className="create-popup-box">
              <p>
                Adjust the student limit for your institution by entering the
                new count below.
              </p>
              <label>
                <input
                  type="text"
                  placeholder="Enter new count"
                  value={newCount}
                  onChange={(e) => setNewCount(e.target.value)}
                  min="0"
                  title="Enter a valid number"
                />
              </label>
              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>

              <div className="buttonContainer">
                <button className="addButton" onClick={handleCountUpdate}>
                  Apply Changes
                </button>
                <button
                  className="cancelButton"
                  onClick={() => {
                    setShowCountPopup(false), setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotificationPopup && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowNotificationPopup(false), setError(null);
            }}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Change Notification Settings</h3>
            </div>
            <div className="create-popup-box">
              <p>
                Customize institute notification preferences by selecting an
                option below.
              </p>
              <label>
                <select
                  value={newNotification}
                  onChange={(e) => setNewNotification(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select an option
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </label>
              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>
              <div className="buttonContainer">
                <button
                  className="addButton"
                  onClick={handleNotificationUpdate}
                >
                  Save Changes
                </button>
                <button
                  className="cancelButton"
                  onClick={() => {
                    setShowNotificationPopup(false), setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPackagePopup && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowPackagePopup(false), setError(null);
            }}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Update Package Status</h3>
            </div>
            <div className="create-popup-box">
              <p>Please select the new package status:</p>
              <label>
                <select
                  value={newPackage}
                  onChange={(e) => setNewPackage(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select an option
                  </option>
                  <option value="Active">Activate</option>
                  <option value="Deactivate">Deactivate</option>
                </select>
              </label>

              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>
              <div className="buttonContainer">
                <button className="addButton" onClick={handlePackageUpdate}>
                  Save Changes
                </button>
                <button
                  className="cancelButton"
                  onClick={() => {
                    setShowPackagePopup(false), setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPackageTimePopup && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowPackageTimePopup(false), setError(null);
            }}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Update Package</h3>
            </div>
            <div className="create-popup-box">
              <p>Please select the new package:</p>
              <label>
                <select
                  value={newPackageTime}
                  onChange={(e) => setNewPackageTime(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Select an option
                  </option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </label>

              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>
              <div className="buttonContainer">
                <button className="addButton" onClick={handlePackageTimeUpdate}>
                  Save Changes
                </button>
                <button
                  className="cancelButton"
                  onClick={() => {
                    setShowPackageTimePopup(false), setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditInstituteDetailsPopup && (
        <div>
          <div
            className="overlay"
            onClick={() => {
              setShowEditInstituteDetailsPopup(false), setError(null);
            }}
          ></div>
          <div className="create-popup">
            <div className="popup_topic">
              <h3>Edit Institute Details</h3>
            </div>
            <div className="create-popup-box">
              <p>Update the institute details</p>

              <label>
                Name:
                <input
                  type="text"
                  onChange={(e) => setNewName(e.target.value)}
                  value={newName}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  onChange={(e) => setNewEmail(e.target.value)}
                  value={newEmail}
                  required
                  pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                  title="Enter a valid email address"
                />
              </label>
              <label>
                Logo:
                <input
                  type="file"
                  accept=".jpg, .png, .jpeg"
                  onChange={(e) => handleImageChange(e)}
                  required
                />
              </label>

              <div className="errorContainer">
                {error && <div className="error">{error}</div>}
              </div>

              <div className="buttonContainer">
                <button
                  className="addButton"
                  onClick={handleInstituteDetailsUpdate}
                >
                  Apply Changes
                </button>
                <button
                  className="cancelButton"
                  onClick={() => {
                    setShowEditInstituteDetailsPopup(false), setError(null);
                  }}
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

export default InstituteDetailsComponent;
