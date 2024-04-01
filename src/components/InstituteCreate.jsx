import React, { useState } from "react";
import { useInstitutesContext } from "../hooks/useInstitutesContext";
import { useAuthContext } from "../hooks/useAuthContext";

const InstituteCreate = ({ onClose, onSuccess }) => {
  const { dispatch } = useInstitutesContext();
  const { user } = useAuthContext();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [count, setCount] = useState("");
  const [image, setImage] = useState(null);
  const [notification, setNotification] = useState("");
  const [stdCardcardStatus, setCardSatus] = useState("");

  const [instPackage, setInstPackage] = useState("");
  const [smsPrice, setSmsPrice] = useState("");
  const [topUpPrice , setTopUpPrice] = useState("");

  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const currentDate = new Date();

    const expirationDate = new Date(currentDate.getTime() + instPackage * 30 * 24 * 60 * 60 * 1000);

    const colomboTimeZone = "Asia/Colombo";
    const expireTimeColombo = expirationDate.toLocaleString("en-US", {
      timeZone: colomboTimeZone,
    });

    const packageStatus = "Active";

    const institute = {
      name,
      email,
      count,
      notification,
      image,
      instPackage,
      packageStatus,
      currentTime: currentDate,
      expireTime: expireTimeColombo,
      topUpPrice,
      smsPrice,
      stdCardcardStatus
    };

    const response = await fetch("https://edu-project-backend.onrender.com/api/institute/create", {
      method: "POST",
      body: JSON.stringify(institute),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      if (json.emptyFields) {
        setEmptyFields(json.emptyFields);
      }
    }
    if (response.ok) {
      setName("");
      setEmail("");
      setCount("");
      setNotification("");
      setCardSatus("")
      setError(null);
      setImage(null); // Reset image state
      setInstPackage("");
      setTopUpPrice("");
      setSmsPrice("");
      setEmptyFields([]);
      dispatch({ type: "CREATE_INSTITUE", payload: json });
      onSuccess();
    }
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '17px' }}>
      <div className="overlay" onClick={onClose}></div>
      <div className="create-popup">
        <div className="popup_topic">
          <h3>Add a New Institute</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your Name"
              className={emptyFields.includes("Name") ? "error" : ""}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Enter your Email"
              className={emptyFields.includes("Email") ? "error" : ""}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
              title="Enter a valid email address"
            />
          </label>
          <label>
            Student limit:
            <input
              type="number"
              onChange={(e) => setCount(e.target.value)}
              value={count}
              placeholder="Enter your student limit"
              className={emptyFields.includes("Count") ? "error" : ""}
            />
          </label>
          <label>
            Notifications:
            <select
              onChange={(e) => setNotification(e.target.value)}
              value={notification}
              className={emptyFields.includes("Notification") ? "error" : ""}
            >
              <option value="" disabled hidden>
                Select an option
              </option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </label>
          <label>
            Image:
            <input
              type="file"
              accept=".jpg, .png, .jpeg"
              onChange={(e) => handleImageChange(e)}
              className={emptyFields.includes("Image") ? "error" : ""}
            />
          </label>

          <label>
            Package:
            <select
              value={instPackage}
              className={emptyFields.includes("InstPackage") ? "error" : ""}
              onChange={(e) => setInstPackage(e.target.value)}
            >
              <option value="" disabled hidden>
                Select a package
              </option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          </label>
          <label>
            SMS Top Price:
            <input
              type="number"
              onChange={(e) => setTopUpPrice(e.target.value)}
              value={topUpPrice}
              placeholder="Enter your TopUp Price"
              className={emptyFields.includes("TopUp Price") ? "error" : ""}
            />
          </label>

          <label>
            One SMS Price:
            <input
              type="number"
              onChange={(e) => setSmsPrice(e.target.value)}
              value={smsPrice}
              placeholder="Enter your One SMS Price"
              className={emptyFields.includes(" One SMS Price") ? "error" : ""}
            />
          </label>

          <label>
            Card Creation:
            <select
              onChange={(e) => setCardSatus(e.target.value)}
              value={stdCardcardStatus}
              className={emptyFields.includes("Card Creation") ? "error" : ""}
            >
              <option value="" disabled hidden>
                Select an option
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <div className="errorContainer">
            {error && <div className="error">{error}</div>}
          </div>
          <div className="buttonContainer">
            <button className="addButton" type="submit">
              Add Institute
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

export default InstituteCreate;
//