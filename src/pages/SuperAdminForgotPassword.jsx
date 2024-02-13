import React, { useState } from "react";
import Spinner from "../components/Spinner";
import { useNavigate } from "react-router-dom";
import "../styles/forgotPassword.css";

const SuperAdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://edcuation-app.onrender.com/api/superAdmin/forgotpassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Email sent successfully");
        setIsLoading(false);
        setShowPopup(true);
      } else {
        setError(`${data.error}`);
      }
    } catch (error) {
      setMessage("Error sending forgot password request");
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="create-popup">
        {isLoading && <Spinner />}

        <form onSubmit={handleSubmit}>
          <h2>Forgot Password</h2>
          <p>
            Please enter your email address below. We will send you a link to
            reset your password.
          </p>
          <label>
           
            <input
              type="email"
              value={email}
              placeholder="Enter your email here"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div className="errorContainer">
            {error && <div className="error">{error}</div>}
          </div>

          <div className="buttonContainer">
            <button className="loginButton" type="submit">
              Submit
            </button>
            <button
              className="okButton"
              onClick={() => {
                navigate("/adminlogin");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showPopup && (
        <div>
          <div
            className="forgetpassword-overlay"
            onClick={() => setShowPopup(false)}
          ></div>
          <div className="forgetpassword-popup">
            <p>{message}</p>

            <button
              className="okButton"
              onClick={() => {
                navigate("/adminlogin");
              }}
            >
              ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminForgotPassword;
