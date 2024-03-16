import React, { useState, useEffect } from "react";
import { NavLink ,useNavigate} from "react-router-dom";
//import { useAuthContext } from '../../hooks/useAuthContext';
import { useSiteDetailsContext } from "../../hooks/useSiteDetailsContext";
import { useLogout } from "../../hooks/useLogout";
import { FaArrowLeft } from 'react-icons/fa';
import { FaSignOutAlt } from 'react-icons/fa';



import "./NavBar.css";

const NavBar = () => {
  const { logout } = useLogout();
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous screen
  };


  const { sitedetail } = useSiteDetailsContext();
  //const { user } = useAuthContext();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = () => {
    logout();
  };

  // useEffect(() => {
  //   const fetchSiteDetails = async () => {
  //     try {
  //       const response = await fetch(`https://edu-project-backend.onrender.com/api/site/getone/${user.instituteId}`, {
  //         headers: { Authorization: `Bearer ${user.token}` },
  //       });

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }

  //       const json = await response.json();
  //       dispatch({ type: 'SET_SITE_DETAILS', payload: json });
  //     } catch (error) {
  //       
  //       // Handle the error, e.g., show an error message to the user
  //     }
  //   };

  //   if (user) {
  //     fetchSiteDetails();
  //   }
  // }, [dispatch, user]);

  return (
    <nav>
      <button className="navbar-backbutton" onClick={handleGoBack}>
      <FaArrowLeft />
    </button>
      {/* <div className="title">{sitedetail.name}</div> */}
      
          <NavLink  to="/" className="title">{sitedetail.name}
          </NavLink>
        
      <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
      </div>
      <ul className={menuOpen ? "open" : ""}>
       
        <li>
          <NavLink to="/students" className="">
            Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/classes">Classes</NavLink>
        </li>
        <li>
          <NavLink to="/payments">Payments</NavLink>
        </li>
        <li>
        
          <NavLink to="/attendences">Attendence</NavLink>
        </li>
        <li>
        
          <NavLink to="/brodcastMsg">Section Messages</NavLink>
        </li>
        
        <li>
        <button className="navbar-logoutbutton" onClick={handleClick}>
      <FaSignOutAlt/>
    </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
