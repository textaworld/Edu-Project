import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { useClassContext } from "../hooks/useClassContext";
import "../styles/instituteDetails.css";
import "../styles/superAdminDashboard.css";
import { FaUser, FaMoneyBill, FaEdit, FaTrash } from "react-icons/fa";

const Students = () => {
  const { id } = useParams();
  const { classs, dispatch: clz } = useClassContext();
  const { students, dispatch } = useStudentContext();
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const { sitedetail } = useSiteDetailsContext();
  const [ageFilter, setAgeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [clzs, setClasses] = useState([]);
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");
  const navigate = useNavigate();

  //// new changes

  const fetchSiteDetails = async () => {
    const response = await fetch(
      `http://localhost:3018/api/site/getone/${user.instituteId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    const json = await response.json();

    if (response.ok) {
     

      setNewPackageStatus(json.packageStatus);

      dispatch({ type: "SET_SITE_DETAILS", payload: json });

      // Check if expiration check has already been performed
      const expirationCheckPerformed = localStorage.getItem(
        "expirationCheckPerformed"
      );

      if (!expirationCheckPerformed) {
        const interval = setInterval(() => {
          // Convert string representations to Date objects
          const currentTime = new Date();
          const expireTime = new Date(json.expireTime);

        

          if (currentTime > expireTime) {
            const status = "Deactivate";
            updateDetails({ packageStatus: status });
            setPackageStatus("No");
            clearInterval(interval);
            localStorage.setItem("expirationCheckPerformed", "true");
          } else {
            setPackageStatus("Yes");
          }
        }, 1000);
        // Check every second (adjust as needed)
      } else {
        setPackageStatus("No"); // Set 'No' if expiration check already performed
      }
    }
  };

  const updateDetails = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3018/api/institute/update/${user.instituteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update details: ${response.status}`);
      }

      dispatch({
        type: "UPDATE_INSTITUTE",
        payload: { _id: sitedetail._id, data },
      });

      //setInstituteDetails(getInstituteDetails(instituteId));
    } catch (error) {
      
      // Handle error (e.g., display an error message)
    }
  };

  const handleRestartProcess = async () => {

    if (newPackageStatus === "Active") {
      // Clear the expiration check flag in localStorage
      localStorage.removeItem("expirationCheckPerformed");

      // Update newPackageStatus to 'Deactive' call the API and update
    }

    // Call fetchSiteDetails to restart the process
    await fetchSiteDetails();
  };

  useEffect(() => {
    let expirationCheckPerformed;

    if (user) {
      fetchSiteDetails();
    }

    if (expirationCheckPerformed && packageStatus === "No") {
      // Restart the process if expiration check performed and package status is 'No'
      handleRestartProcess();
    }

    return () => {
      // Cleanup logic if needed
    };
  }, [dispatch, user, packageStatus]);

  useEffect(() => {
    // Check if expiration check has already been performed
    const expirationCheckPerformed = localStorage.getItem(
      "expirationCheckPerformed"
    );

    if (expirationCheckPerformed && packageStatus === "No") {
      // Restart the process if expiration check performed and package status is 'No'
      handleRestartProcess();
    }
  }, [packageStatus]);

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3018/api/students/deleteStudent/${studentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const json = await response.json();

      if (response.ok) {
        // Remove the deleted student from the state
        dispatch({ type: "DELETE_STUDENT", payload: studentId });
      } else {
        
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3018/api/students/getAllStudentsByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: "SET_STUDENTS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchStudents();
    }
  }, [dispatch, user]);


  const filteredStudents = Array.isArray(students) ? students.filter(
    (student) =>
      student.std_ID.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (ageFilter === "" || student.age.toString() === ageFilter) &&
      (classFilter === "" ||
        (student.classs &&
          student.classs.some((cls) => cls._id === classFilter)))
  ) : [];

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          `http://localhost:3018/api/class/getAllClassesByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {
          setClasses(json.data);

          clz({ type: "SET_CLASS", payload: json.data });
        } else {
          
        }
      } catch (error) {
        
      }
    };

    if (user && Array.isArray(classs)) {
      fetchClasses();
    }
  }, [clz, user, sitedetail._id]);

  return (
    <div>
      <div className="superAdminDashboardContainer">
        {packageStatus !== "Yes" ? (
        <div>
          <h1>Processing ...!</h1>
        </div>
      ) : (
        <div className="instituteTableContainer">
          <div className="instituteAddButtonContainer">
            <button
              onClick={() => {
                navigate("/createSTD");
              }}
            >
              Add New Student
            </button>
          </div>
          <div className="filter-container">
            <input
              type="search"
              placeholder="Search by Student ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
            />

            <div className="filter-group">
              <label>Filter by Age:</label>
              <select
                className="filter-select"
                onChange={(e) => setAgeFilter(e.target.value)}
              >
                 <option value="">All</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
                <option value="13">13</option>
                <option value="14">14</option>
                <option value="15">15</option>
                <option value="16">16</option>
                <option value="17">17</option>
                <option value="18">18</option>
                <option value="19">19</option>
                <option value="20">20</option>
                {/* Add more age options as needed */}
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Class Name:</label>
              <select
                className="filter-select"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All</option>
                {clzs.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table className="instituteTable">
            <thead>
              <tr>
                <th>SID</th>
                <th>Name</th>
                <th>EMail</th>
                <th>Age</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Classes</th>
                <th>Profile</th>
                <th>Payment</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
            
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={index}>
                    <td>{student.std_ID}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.age}</td>
                    <td>{student.address}</td>
                    <td>{student.phone}</td>
                    <td>
                      {student.classs
                        ? student.classs.map((cls) => cls.subject).join(", ")
                        : ""}
                    </td>

                    <td>
                      <Link
                        to={`/studentprofile/${student._id}`}
                        className="btn btn-success"
                      >
                        <FaUser />
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/payment/${student._id}`}
                        className="btn btn-success"
                      >
                        <FaMoneyBill />
                      </Link>
                    </td>
                    <td>
                      <Link
                        to={`/updateStd/${student._id}`}
                        className="btn btn-success"
                      >
                        <FaEdit />
                      </Link>
                    </td>
                    <td>
                      <Link
                        to="#"
                        className="btn btn-danger"
                        onClick={() => handleDelete(student._id)}
                      >
                        <FaTrash />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11">No Students found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
         )}  
       </div> 
    </div>
  );
};

export default Students;