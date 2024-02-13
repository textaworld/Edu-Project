import React,{useState,useEffect} from 'react'
import { useLogout } from '../hooks/useLogout'
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";


const HomeSubAdmin = () => {
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
    
  return (
  <div>

{packageStatus !== "Yes" ? (
        <div>
          <h1>You need to pay</h1>
        </div>
      ) : (

      <div>
<div style={{ display: 'flex', alignItems: 'center' ,marginTop:'100px' }}>
  <h1 style={{ marginLeft: '520px'}}>Welcome sub admin</h1>
  <button onClick={handleClick} style={{marginLeft:'300px', cursor: 'pointer' , color: '#f8f8f8', 
    padding: '8px',backgroundColor: '#0f172a',borderRadius:'5px',
    border: '1px solid #0f172a'}}>Log out</button>
</div>


<button style={{ marginLeft:'780px', marginTop:'100px',display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backgroundColor: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' , borderRadius:"7px" }}>
  <Link to={"startClass"} style={{ textDecoration: 'none', color: 'inherit' }}>
    <h1 style={{ margin: 0 }}>Start Class <FaArrowRight style={{ marginLeft: '5px' }} /></h1>
  </Link>
</button>

      
    </div>
    )} 
  </div>
  )
}

export default HomeSubAdmin
