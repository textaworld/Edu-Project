import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePaymentContext } from "../hooks/usePaymentContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import "../styles/updateStudent.css";

const UpdateClass = () => {
  const { id } = useParams();
  const { classs, dispatch: clz } = useClassContext();
  const { sitedetail } = useSiteDetailsContext();
  const [selectedClass, setSelectedClass] = useState("");
  const { dispatch } = usePaymentContext();
  const { user } = useAuthContext();
  const instID = user.instituteId;
  const [inst_ID, setInst_ID] = useState();
  const [subject, setSubject] = useState();
  const [class_ID, setClz_ID] = useState();
  const [grade, setGrade] = useState();
  const [teacherName, setTName] = useState();
  const [teacherEmail, setTEmail] = useState();

  const [teacherPhone, setPhone] = useState();
  const [classFees ,setFees] = useState();
  const navigate = useNavigate();


  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "https://edu-project-backend.onrender.com/api/class/getClassById/" + id,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();
        console.log(json)

        if (response.ok) {
          setClz_ID(json.class_ID);
          setSubject(json.subject);
          setGrade(json.grade);
          setTName(json.teacherName);
          setTEmail(json.teacherEmail);
          setPhone(json.teacherPhone);
          setFees(json.classFees);


          dispatch({ type: "SET_STUDENTS", payload: json });
        }
      } catch (error) {
        
        // Handle the error as needed
      }
    };

    if (user) {
      fetchStudents();
    }
  }, [dispatch, user, id]);

  

//   useEffect(() => {
//     const fetchClassesBySite = async () => {
//       try {
//         const response = await fetch(
//           `https://edu-project-backend.onrender.com/api/class/getAllClassesByInsId/${sitedetail._id}`,
//           {
//             headers: { Authorization: `Bearer ${user.token}` },
//           }
//         );
//         const json = await response.json();

//         if (response.ok && Array.isArray(json.data)) {
//           const subjectsArray = json.data.map((classObj) => classObj._id);
//           setStdClass(subjectsArray);
//           clz({ type: "SET_CLASS", payload: json.data });
//         } else {
          
//         }
//       } catch (error) {
        
//       }
//     };

//     if (user && sitedetail && sitedetail._id) {
//       fetchClassesBySite();
//     }
//   }, [clz, user, sitedetail]);

console.log(class_ID)

  const updateStudent = async () => {
    try {
     

      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/class/updateClass/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            class_ID,
            grade,
            subject,
            teacherName,
            teacherEmail,
            teacherPhone,
            classFees
           
          }),
        }
      );

      const json = await response.json();
      console.log(json)

      if (response.ok) {
        navigate("/classes"); // Redirect to the students page after successful update
      } else {
        
        setError(json.error); // Set the error state
      }
    } catch (error) {
      
    }
  };

  return (
    <div className="form-container">
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent the default form submission behavior
          updateStudent();
        }}
      >
        <h2 className="form-title">Update Class</h2>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Class ID
          </label>
          <input
            value={class_ID}
            type="text"
            placeholder="Enter Class ID"
            className="form-control"
            onChange={(e) => setClz_ID(e.target.value)}
          />
        </div>{" "}
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Grade
          </label>
          <input
            value={grade}
            type="text"
            placeholder="Enter grade"
            className="form-control"
            onChange={(e) => setGrade(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Subject
          </label>
          <input
            value={subject}
            type="text"
            placeholder="Enter Subject"
            className="form-control"
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Teachers Name
          </label>
          <input
            value={teacherName}
            type="text"
            placeholder="Enter Teachers Name"
            className="form-control"
            onChange={(e) => setTName(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Teachers Email
          </label>
          <input
            value={teacherEmail}
            type="text"
            placeholder="Enter Age"
            className="form-control"
            onChange={(e) => setTEmail(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Class Fees
          </label>
          <input
            value={classFees}
            type="text"
            placeholder="Enter Fees"
            className="form-control"
            onChange={(e) => setFees(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Teachers Phone
          </label>
          <input
            value={teacherPhone}
            type="number"
            placeholder="Enter Phone number"
            className="form-control"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        
          
        
        <button type="submit" className="form-button">
          Submit
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default UpdateClass;
