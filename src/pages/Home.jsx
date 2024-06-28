import React, { useEffect, useState } from "react";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import Students from '../../public/icons/Students.png'
import ExStudents from '../../public/icons/ExStudents.png'
import Bell from '../../public/icons/Bell.png'
import Duration from '../../public/icons/Duration.png'
import Email from '../../public/icons/Email.png'
import RMSMS from '../../public/icons/RMSMS.png'
import RmStds from '../../public/icons/RmStds.png'
import School from '../../public/icons/School.png'
import SMS from '../../public/icons/SMS.png'
import SmSCount from '../../public/icons/SmSCount.png'
import Topup from '../../public/icons/Topup.png'



const Home = () => {
  const { logout } = useLogout();
  const { sitedetail, dispatch } = useSiteDetailsContext();
  const { user } = useAuthContext();
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");

  const [studentCount, setStudentCount] = useState(0);
  const [remainingCount, setRemainingCount] = useState(0); 
  const [remainingSMSCount, setRemainingSMSCount] = useState(0); 
  const [smsCount, setSmsCount] = useState(0);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/students/getAllStudentsByInsId/${sitedetail._id}`,
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
        // Handle error
      }
    };

    if (user) {
      fetchSiteDetails();
      fetchStudents();
    }
  }, [dispatch, user]);

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

      const expirationCheckPerformed = localStorage.getItem("expirationCheckPerformed");

      if (!expirationCheckPerformed) {
        const interval = setInterval(() => {
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
      } else {
        setPackageStatus("No");
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
    } catch (error) {
      // Handle error
    }
  };

  const handleRestartProcess = async () => {
    if (newPackageStatus === "Active") {
      localStorage.removeItem("expirationCheckPerformed");
    }
    await fetchSiteDetails();
  };

  useEffect(() => {
    if (user) {
      fetchSiteDetails();
    }
    if (packageStatus === "No") {
      handleRestartProcess();
    }
  }, [dispatch, user, packageStatus]);

  useEffect(() => {
    if (packageStatus === "No") {
      handleRestartProcess();
    }
  }, [packageStatus]);

  useEffect(() => {
    setRemainingCount(sitedetail.count - studentCount);
  }, [studentCount, sitedetail.count]);

  useEffect(() => {
    const remSmsCount = parseInt((sitedetail.topUpPrice / sitedetail.smsPrice) - sitedetail.smsCount);
    setRemainingSMSCount(remSmsCount);
  }, [sitedetail.smsPrice, sitedetail.topUpPrice, sitedetail.smsCount]);

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    
    marginLeft: '110px',
    marginTop: '50px',
    marginBottom:'50px'
  };

  const gridItemStyle = {
    border: '2px solid black',
    borderRadius:'5px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width:'270px',
    height:'150px',
    marginTop:'30px',
   
  };

  const iconStyle = {
    marginBottom: '5px',
    color: '#007bff',
    width:'80px',
     height:'70px',
    fontSize: '18px'
  };

  const textStyle = {
    color: 'red',
    fontSize: '18px'
  };

  return (
    <div>
      {packageStatus !== "Yes" ? (
        <div>
          <h1>Processing...</h1>
        </div>
      ) : (
        <div style={gridContainerStyle}>
          {/* <div style={gridItemStyle}>
          <img src={School} style={iconStyle} />
          <h2>Institute Name: <span style={textStyle}>{sitedetail.name}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={Email} style={iconStyle} />
          <h2>Institute Email: <span style={textStyle}>{sitedetail.email}</span></h2>
          </div> */}
          <div style={gridItemStyle}>
            <img src={Students} style={iconStyle} />
            <h2 style={{fontSize:'18px'}}> Student Count: <span style={textStyle}>{sitedetail.count}</span></h2>
          </div>
          <div style={gridItemStyle}>
            <img src={ExStudents}  style={iconStyle} />
            <h2 style={{fontSize:'18px'}}>Existing Count: <span style={textStyle}>{studentCount}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={RmStds} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>Remaining Count: <span style={textStyle}>{remainingCount}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={Bell} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>Notification Service: <span style={textStyle}>{sitedetail.notification}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={Duration} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>Package Duration: <span style={textStyle}>{sitedetail.instPackage}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={Topup} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>TopUp Price: <span style={textStyle}>{sitedetail.topUpPrice}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={SMS} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>One SMS Price: <span style={textStyle}>{sitedetail.smsPrice}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={SmSCount} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>Sent SMS Count: <span style={textStyle}>{sitedetail.smsCount}</span></h2>
          </div>
          <div style={gridItemStyle}>
          <img src={RMSMS} style={iconStyle} />
          <h2 style={{fontSize:'18px'}}>Remaining SMS: <span style={textStyle}>{remainingSMSCount}</span></h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
