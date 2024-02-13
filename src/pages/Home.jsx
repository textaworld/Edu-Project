import React, { useEffect, useState } from "react";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import { Link } from "react-router-dom";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";

const Home = () => {
  const { logout } = useLogout();
  const { sitedetail, dispatch } = useSiteDetailsContext();
  const { user } = useAuthContext();
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");

  const [studentCount, setStudentCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0); // Initialize remaining count state

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `https://edcuation-app.onrender.com/api/students/getAllStudentsByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {
          setStudentCount(json.data.length);
          dispatch({ type: "SET_STUDENTS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchSiteDetails();
      fetchStudents();
    }
  }, [dispatch, user]);

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
          //console.log(expireTime)
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

  useEffect(() => {
    setRemainingCount(sitedetail.count - studentCount);
  }, [studentCount, sitedetail.count]);

  return (
    <div>
      {packageStatus !== "Yes" ? (
        <div>
          <h1>You need to pay</h1>
        </div>
      ) : (
        <div>
          <div style={{marginLeft:'650px' ,marginTop:'50px'}}>
    {/* Your other JSX here */}
    <div style={{border: '1px solid black', width:'500px', padding: '5px', marginBottom: '5px' }}>
        <h2>Institute Name:<span style={{color:'red'}}>{sitedetail.name}</span> </h2>
    </div>
    <div style={{border: '1px solid black',width:'500px', padding: '5px', marginBottom: '5px'}}>
        <h2>Institute Email:<span style={{color:'red'}}>{sitedetail.email}</span> </h2>
    </div>
    <div style={{border: '1px solid black', width:'500px',padding: '5px', marginBottom: '5px'}}>
        <h2>Institute's Student Count: <span style={{color:'red'}}>{sitedetail.count}</span></h2>
    </div>
    <div style={{border: '1px solid black',width:'500px', padding: '5px', marginBottom: '5px'}}>
        <h2>Existing Count:<span style={{color:'red'}}> {studentCount}</span></h2>
    </div>
    <div style={{border: '1px solid black', width:'500px',padding: '5px', marginBottom: '5px'}}>
        <h2>Remaining Count: <span style={{color:'red'}} >{remainingCount}</span></h2>
    </div>
    <div style={{border: '1px solid black',width:'500px', padding: '5px', marginBottom: '5px'}}>
        <h2>Notification Service:<span style={{color:'red'}}> {sitedetail.notification}</span></h2>
    </div>
    <div style={{border: '1px solid black',width:'500px', padding: '5px', marginBottom: '5px'}}>
        <h2>Package Duration: <span style={{color:'red'}}>{sitedetail.instPackage}</span></h2>
    </div>
</div>

        </div>
       )} 
    </div>
  );
};

export default Home;
