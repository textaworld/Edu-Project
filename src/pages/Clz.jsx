import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { FaTrash , FaEdit , FaMoneyBill} from "react-icons/fa";
import CreateClass from "../components/CreateClass";

const Clz = () => {
  const { id } = useParams();
  const { classs, dispatch } = useClassContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: sitedispatch } = useSiteDetailsContext();
  const [clzs, setClz] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
 
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");
  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmissionSuccessful, setSubmissionSuccessful] = useState(false);

  const filteredClasses = classs.filter(
    (clz) =>
      clz.class_ID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clz.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmissionSuccess = () => {
    setSubmissionSuccessful(true);
    closeModal();
  };

  /// new changes

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

      sitedispatch({ type: "SET_SITE_DETAILS", payload: json });

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

      sitedispatch({
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

  ////

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

        // Log the API response

        if (response.ok) {
          //setClz(json.data);
          dispatch({ type: "SET_CLASS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchClasses();
    }
  }, [dispatch, user, sitedetail._id]);

  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3018/api/class/deleteClass/${classId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const json = await response.json();

      if (response.ok) {
        // Remove the deleted class from the state
        dispatch({ type: "DELETE_CLASS", payload: classId });
      } else {
        
      }
    } catch (error) {
      
    }
  };
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return(
    <div>
      {isModalOpen && (
        <CreateClass onClose={closeModal} onSuccess={handleSubmissionSuccess} />
      )}
      <div className="superAdminDashboardContainer">
        {packageStatus !== "Yes" ? (
          <div>
            <h1>Processing ...!</h1>
          </div>
        ) : (
          <div className="instituteTableContainer">
            <div className="instituteAddButtonContainer">
              <button onClick={openModal}>Add New Class</button>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by Class ID or Name"
            />

            <table className="instituteTable">
              <thead>
                <tr className="test">
                  <th>Class ID</th>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>Teacher</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Fees</th>
                  <th>Income</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((clz, index) => (
                    <tr key={index}>
                      <td>{clz.class_ID}</td>
                      <td>{clz.subject}</td>
                      <td>{clz.grade}</td>
                      <td>{clz.teacherName}</td>
                      <td>{clz.teacherEmail}</td>
                      <td>{clz.teacherPhone}</td>
                      <td>{clz.classFees}</td>
                      <td><Link
                        to={`/teacherIncome/${clz._id}`}
                        className="btn btn-success"
                      >
                        <FaMoneyBill />
                      </Link></td>
                      <td>
                      <Link
                        to={`/updateClz/${clz._id}`}
                        className="btn btn-success"
                      >
                        <FaEdit />
                      </Link>
                    </td>
                      <td>
                        <Link
                          to="#"
                          className="btn btn-danger"
                          onClick={() => handleDeleteClass(clz._id)}
                        >
                          <FaTrash />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No classes found</td>
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

export default Clz;
