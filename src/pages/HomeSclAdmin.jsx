import React,{useState,useEffect} from 'react'
import { useLogout } from '../hooks/useLogout'
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";


const HomeSclAdmin = () => {
  const { sitedetail, dispatch } = useSiteDetailsContext();
  const { user } = useAuthContext();
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");
    const { logout } = useLogout()


    const handleClick = () => {
        logout()
      }


      const fetchSiteDetails = async () => {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/site/getone/${user.instituteId}`,
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
            `https://edu-project-backend.onrender.com/api/institute/update/${user.instituteId}`,
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
    
  return (
    <div>
    {packageStatus !== "Yes" ? (
      <div>
        <h1>Processing...!</h1>
      </div>
    ) : (
      <div>
        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <h1>Welcome Admin</h1>
          <button onClick={handleClick} style={{ marginTop: '20px', cursor: 'pointer', color: '#f8f8f8', padding: '8px', backgroundColor: '#0f172a', borderRadius: '5px', border: '1px solid #0f172a' }}>Log out</button>
        </div>

        <div style={{ marginTop: '100px', textAlign: 'center' }}>
          <Link to={"startSchool"} style={{ textDecoration: 'none', color: 'inherit' }}>
            <button style={{ padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '7px' }}>
              <h1 style={{ margin: 0 }}>Start School <FaArrowRight style={{ marginLeft: '5px' }} /></h1>
            </button>
          </Link>
          <Link to={"absentScl"} style={{ textDecoration: 'none', color: 'inherit' }}>
            <button style={{ padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '7px' ,marginLeft:'10px'}}>
              <h1 style={{ margin: 0 }}>Absent Students <FaArrowRight style={{ marginLeft: '5px' }} /></h1>
            </button>
          </Link>
        </div>
      </div>
    )}
  </div>
  )
}

export default HomeSclAdmin
