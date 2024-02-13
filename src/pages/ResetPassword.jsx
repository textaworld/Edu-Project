import React, { useState, useEffect } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { adminId, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Add logic to check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    const rePassword = { password: newPassword, adminId };

    try {
      const response = await fetch(
        "https://edcuation-app.onrender.com/api/site/resetpassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(rePassword),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setErrorMessage("");
        // Password reset successful

        window.alert("Password changed successfully!");
        navigate("/adminlogin");
      } else {
        // Password reset failed, display an error message
        setErrorMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      // Handle network errors or other issues
      
    }
  };

  return (
    <div>
      <div className="create-popup">
        <form onSubmit={handleResetPassword}>
          <h2>Reset Password</h2>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$"
              title="Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
            />
          </label>

          <label>
            Confirm New Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          <div className="errorContainer">
            {errorMessage && <div className="error">{errorMessage}</div>}
          </div>

          <button className="loginButton" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
