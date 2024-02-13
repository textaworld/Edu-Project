import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClassContext } from "../hooks/useClassContext";
import { useAuthContext } from "../hooks/useAuthContext";
import "../styles/instituteCreate.css"; // Import the CSS file

const CreateClass = ({ onClose, onSuccess }) => {
  const { dispatch } = useClassContext();
  const { user } = useAuthContext();

  const instID = user.instituteId;

  const [inst_ID, setInst_ID] = useState('');
  const [class_ID, setClass_ID] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [classFees, setClassFees] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const classs = {
      inst_ID: instID,
      class_ID,
      grade,
      subject,
      teacherName,
      teacherPhone,
      teacherEmail,
      classFees,
    };

    const response = await fetch(
      "https://edu-project-backend.onrender.com/api/class/createClass",
      {
        method: "POST",
        body: JSON.stringify(classs),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      navigate("/");
    }
    if (response.ok) {
      setInst_ID('');
      setClass_ID('');
      setGrade('');
      setSubject('');
      setTeacherName('');
      setTeacherPhone('');
      setTeacherEmail('');
      setError(null);
      dispatch({ type: "CREATE_CLASS", payload: json });
      onSuccess();
    }
  };

  return (
    <div>
      <div className="overlay" onClick={onClose}></div>
      <div className="create-popup">
        <div className="popup_topic">
          <h3>Add a New Class</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            class ID:
            <input
              type="text"
              onChange={(e) => setClass_ID(e.target.value)}
              value={class_ID}
              placeholder="Enter Name"
              required
            />
          </label>
          <label>
            Grade:
            <input
              type="number"
              onChange={(e) => setGrade(e.target.value)}
              value={grade}
              placeholder="Enter Grade"
              required
            />
          </label>
          <label>
          Subject:
            <input
              value={subject}
              type="text"
              placeholder="Enter Subject"
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
          <label>
          Teacher's name:
            <input
               value={teacherName}
               type="text"
               placeholder="Enter teacher's name"
               onChange={(e) => setTeacherName(e.target.value)}
              required
            />
          </label>
          <label>
          Teacher's Phone:
            <input
               value={teacherPhone}
               type="number"
               placeholder="Enter Phone number"
              
               onChange={(e) => setTeacherPhone(e.target.value)}
              required
            />
          </label>
          <label>
          Teacher's Email:
            <input
               value={teacherEmail}
               type="email"
               placeholder="Enter Email"
             
               onChange={(e) => setTeacherEmail(e.target.value)}
              required
            />
          </label>
          <label>
          Class Fees:
            <input
               value={classFees}
               type="number"
               placeholder="Enter Class fee"
              
               onChange={(e) => setClassFees(e.target.value)}
              required
            />
          </label>
         
          <div className="errorContainer">
            {error && <div className="error">{error}</div>}
          </div>
          <div className="buttonContainer">
            <button type="submit" className="addButton">Add Class</button>
            <button className="cancelButton" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClass;
