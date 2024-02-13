import React from 'react';
import './superAdminNavBar.css';
import { useLogout } from "../../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from 'react-icons/fa';
import { useAuthContext } from "../../hooks/useAuthContext";
import { FaSignOutAlt } from 'react-icons/fa';





const SuperAdminNavBar = () => {
  const { logout } = useLogout();
  const { user } = useAuthContext();

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous screen
  };

  const handleClick = () => {
    logout();
  };

  return (
    <div className="superAdminNavBar">
    <button className="navbar-backbutton" onClick={handleGoBack}>
      <FaArrowLeft />
    </button>
    <div className="navbar-title">
      <h1>Institute Control Hub</h1>
    </div>
    <div className="navbar-user">
      <h4>{user && user.email}</h4>
    </div>
    <button className="navbar-logoutbutton" onClick={handleClick}>
      <FaSignOutAlt/>
    </button>
  </div>
  
  );
};

export default SuperAdminNavBar;
