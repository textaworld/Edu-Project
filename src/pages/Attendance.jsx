import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { FaTrash } from "react-icons/fa";

const Attendence = () => {
  const { id } = useParams();
  const { attendances, dispatch } = useAttendanceContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: sitedispatch } = useSiteDetailsContext();

  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");

  ////

  const fetchSiteDetails = async () => {
    const response = await fetch(
      `https://edcuation-app.onrender.com/api/site/getone/${user.instituteId}`,
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
        `https://edcuation-app.onrender.com/api/institute/update/${user.instituteId}`,
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

  ////

  useEffect(() => {
    const fetchAttendences = async () => {
      try {
        const response = await fetch(
          `https://edcuation-app.onrender.com/api/attendance/getAllAttendancesByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        // Log the API response

        if (response.ok) {
          setAttendance(json.data);
          //setClz(json.data);
          dispatch({ type: "SET_ATTENDENCE", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchAttendences();
    }
  }, [dispatch, user, sitedetail._id]);

  const filteredAttendance = attendance.filter((attendanc) =>
    attendanc.std_ID.includes(searchTerm)
  );

  return (
    <div>
      <div className="superAdminDashboardContainer">
        {packageStatus !== "Yes" ? (
          <div>
            <h1>You need to pay</h1>
          </div>
        ) : (
          <div className="instituteTableContainer">
            <input
              type="text"
              placeholder="Search by std_ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="instituteTable">
              <thead>
                <tr className="test">
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((attendanc, index) => {
                    // Convert UTC to Colombo time
                    const colomboTime = new Date(attendanc.date).toLocaleString(
                      "en-US",
                      { timeZone: "Asia/Colombo" }
                    );

                    return (
                      <tr key={index}>
                        <td>{attendanc.std_ID}</td>
                        <td>{attendanc.name}</td>
                        <td>{colomboTime}</td> {/* Display Colombo time */}
                        <td>{attendanc.clzName}</td>
                        <td>{attendanc.attendance}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8">No Attendences found</td>
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

export default Attendence;
