import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from "../hooks/useAuthContext";
import happy from "../../public/icons/happy.gif"
import { BsFillArrowRightSquareFill ,BsFillArrowLeftSquareFill  } from "react-icons/bs";

const SwimAdminHome = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');

  const handleClick = () => {
    logout();
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/class/getAllClassesByInsId/${user.instituteId}`, 
          {
            headers: { Authorization: `Bearer ${user.token}` }, 
          }
        );

        if (response.ok) {
          const json = await response.json();
          setClasses(json.data);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    if (user && user.instituteId) {
      fetchClasses();
    }
  }, [user]);

  const handleClassChange = (event) => {
    setSelectedClassId(event.target.value);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'white',
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      position:'fixed'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '40px',
        marginTop:'-200px'
      }}> Hello !</h1>

<div style={{ backgroundColor: 'transparent', }}>
        <img 
        src={happy} 
        alt="Happy GIF" 
        style={{
          width: '100px',  
          height: '100px',   
          marginBottom: '20px',
          backgroundColor: 'transparent'
        }} 
      />
    </div>
      <div style={{
        backgroundColor: 'black',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <label style={{
          display: 'block',
          marginBottom: '10px',
          fontSize: '1.2rem',
          fontWeight: '600',
          color: 'white'
        }}>Select a Class</label>
        <select 
          value={selectedClassId} 
          onChange={handleClassChange} 
          style={{
            marginBottom: '20px',
            width: '150px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '1rem'
          }}
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.subject}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => navigate(`/swimadminhome/swimInQr/${selectedClassId}`)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            height:'60px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          IN<BsFillArrowRightSquareFill style={{width:'25px',height:'25px', marginLeft:'10px'}}/>
        </button>

        <button
          onClick={() => navigate('/swimadminhome/swimOutQr')}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#dc3545',
            color: 'white',
            fontSize: '2rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
             height:'60px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          <BsFillArrowLeftSquareFill style={{width:'25px',height:'25px', marginRight:'10px'}}/>
          OUT
        </button>

        <button 
          onClick={handleClick} 
          style={{
            marginTop: '20px',
            padding: '10px',
            color: '#f8f8f8',
            backgroundColor: '#343a40',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#23272b'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#343a40'}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default SwimAdminHome;
