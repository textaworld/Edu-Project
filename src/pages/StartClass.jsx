import React, { useState, useEffect } from "react";
import { useClassContext } from "../hooks/useClassContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link, useNavigate } from 'react-router-dom';

const StartClass = () => {
  const { user } = useAuthContext();
  const { classs, dispatch } = useClassContext();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const navigate = useNavigate();

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
          dispatch({ type: "SET_CLASS", payload: json });
        }
      } catch (error) {
        
      }
    };

    if (user && user.instituteId) {
      fetchClasses();
    }
  }, [dispatch, user]);

  const handleClassSelect = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleStartClass = () => {
    // Add logic to handle starting the selected class
    navigate(`qrScanner/${selectedClass}`)
  };

  const handleAbsentStudents = () => {
    // Add logic to handle starting the selected class
    navigate(`absent/${selectedClass}`)
  };

  return (
    <div style={{ textAlign: 'center' }}>
    <h2 style={{ fontSize: '30px' }}>Start class</h2>

    <select style={{ margin: '10px auto', height: '30px' }} value={selectedClass} onChange={handleClassSelect}>
      <option value="">Select a class</option>
      {classes.map((classObj) => (
        <option key={classObj._id} value={classObj._id}>
          {classObj.subject}
        </option>
      ))}
    </select>

    <div style={{ marginTop: '50px' }}>
      <button onClick={handleStartClass} style={{ margin: '0 auto', borderRadius: '10px', padding: '15px 30px', fontSize: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', display: 'block', marginBottom: '10px' }}>
        Start Class
      </button>
      <button onClick={handleAbsentStudents} style={{ margin: '0 auto', borderRadius: '10px', padding: '15px 30px', fontSize: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', display: 'block' }}>
        Absent Students
      </button>
    </div>
  </div>
  );
};

export default StartClass;
