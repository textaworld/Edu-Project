import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePaymentContext } from "../hooks/usePaymentContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import "../styles/updateStudent.css";

const UpdateStudent = () => {
  const { id } = useParams();
  const { classs, dispatch: clz } = useClassContext();
  const { sitedetail } = useSiteDetailsContext();
  const [selectedClass, setSelectedClass] = useState("");
  const { dispatch } = usePaymentContext();
  const { user } = useAuthContext();
  const instID = user.instituteId;
  const [inst_ID, setInst_ID] = useState();
  const [name, setName] = useState();
  const [std_ID, setStd_ID] = useState();
  const [email, setEmail] = useState();
  const [age, setAge] = useState();
  const [address, setAddress] = useState();
  const [selectedClassName, setSelectedClassName] = useState({});
  const [selectedClassId, setSelectedClassId] = useState([]);
  const [phone, setPhone] = useState();
  const navigate = useNavigate();
  const [stdClass, setStdClass] = useState([]);
  const [classStates, setClassStates] = useState({});

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "https://edcuation-app.onrender.com/api/students/getStudentById/" + id,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {
          setStd_ID(json.std_ID);
          setName(json.name);
          setEmail(json.email);
          setAge(json.age);
          setAddress(json.address);
          setPhone(json.phone);

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

  const handleClassSelect = (event) => {
    setSelectedClass(event.target.value);
  };

  useEffect(() => {
    const fetchClassesBySite = async () => {
      try {
        const response = await fetch(
          `https://edcuation-app.onrender.com/api/class/getAllClassesByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok && Array.isArray(json.data)) {
          const subjectsArray = json.data.map((classObj) => classObj._id);
          setStdClass(subjectsArray);
          clz({ type: "SET_CLASS", payload: json.data });
        } else {
          
        }
      } catch (error) {
        
      }
    };

    if (user && sitedetail && sitedetail._id) {
      fetchClassesBySite();
    }
  }, [clz, user, sitedetail]);

  const updateStudent = async () => {
    try {
      const selectedClasses = Object.keys(classStates).filter(
        (_id) => classStates[_id]?.isChecked
      );

      const response = await fetch(
        `https://edcuation-app.onrender.com/api/students/updateStudent/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            std_ID,
            name,
            email,
            age,
            address,
            phone,
            classs: selectedClasses.map((classId) => ({
              _id: classId,
              subject: classStates[classId]?.subject,
            })),
          }),
        }
      );

      const json = await response.json();

      if (response.ok) {
        navigate("/students"); // Redirect to the students page after successful update
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
        <h2 className="form-title">Update Student</h2>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            std_ID
          </label>
          <input
            value={std_ID}
            type="text"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setStd_ID(e.target.value)}
          />
        </div>{" "}
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Name
          </label>
          <input
            value={name}
            type="text"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Email
          </label>
          <input
            value={email}
            type="text"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Age
          </label>
          <input
            value={age}
            type="text"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Address
          </label>
          <input
            value={address}
            type="text"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label htmlFor="" className="form-label">
            Phone
          </label>
          <input
            value={phone}
            type="number"
            placeholder="Enter Name"
            className="form-control"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="form-input">
          <label className="form-label">Select Classes</label>
          <div>
            {stdClass.map((classId, index) => {
              // Find the class object based on the ID
              const selectedClass = classs.find(
                (classObj) => classObj._id === classId
              );

              if (selectedClass) {
                return (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`class_${index}`}
                      value={classId}
                      checked={classStates[classId]?.isChecked || false}
                      onChange={() =>
                        setClassStates((prevStates) => ({
                          ...prevStates,
                          [classId]: {
                            ...prevStates[classId],
                            isChecked: !prevStates[classId]?.isChecked,
                            subject: selectedClass.subject,
                          },
                        }))
                      }
                    />
                    <label htmlFor={`class_${index}`}>
                      {selectedClass.subject}
                    </label>
                  </div>
                );
              } else {
                // Handle case where class details are not found
                return null;
              }
            })}
          </div>
        </div>
        <button type="submit" className="form-button">
          Submit
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default UpdateStudent;
