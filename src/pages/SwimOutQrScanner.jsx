


import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useParams } from "react-router-dom";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
// import { useStudentContext } from "../hooks/useStudentContext";
// import { useClassContext } from "../hooks/useClassContext";
import "../styles/qrscanner.css";

const SwimOutQrScanner = () => {
  const { id } = useParams();
  const { dispatch } = useAttendanceContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: institute } = useSiteDetailsContext();

  const instID = user.instituteId;
  const [studentDetails, setStudentDetails] = useState(null);

  const [name, setName] = useState(null);
  const [instNotification, setInstNotification] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrResult, setQrResult] = useState(null);
 const [attentID,setStdAttendID] = useState("")
  const [instituteName, setInstituteName] = useState("");

  const [remainingSMSCount, setRemainingSMSCount] = useState(0);

  useEffect(() => {
    const TopP = sitedetail.topUpPrice;
    const SMSP = sitedetail.smsPrice;

    // console.log(TopP)
    // console.log(SMSP)

    // console.log(sitedetail.topUpPrice / sitedetail.smsPrice)

    const remSmsCount = parseInt(
      sitedetail.topUpPrice / sitedetail.smsPrice - sitedetail.smsCount
    );
    setRemainingSMSCount(remSmsCount);
  }, [sitedetail.smsPrice, sitedetail.topUpPrice, sitedetail.smsCount]);

  //console.log(remainingSMSCount)

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const siteDetailsResponse = await fetch(
          `https://edu-project-backend.onrender.com/api/site/getone/${user.instituteId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const siteDetailsJson = await siteDetailsResponse.json();

        if (siteDetailsResponse.ok) {
          setInstNotification(siteDetailsJson.notification);
          setInstituteName(siteDetailsJson.name);
          institute({ type: "SET_SITE_DETAILS", payload: siteDetailsJson });
        }
      } catch (error) {}
    };

    if (user) {
      fetchSiteDetails();
    }
  }, [user, id, institute]);

  useEffect(() => {
    let qrCodeScanner;

    const startScanner = async () => {
      try {
        qrCodeScanner = new Html5QrcodeScanner("qr-scanner", {
          fps: 40,
          qrbox: 250,
        });

        const result = await new Promise((resolve, reject) => {
          qrCodeScanner.render((qrResult) => resolve(qrResult));
        });

        const parsedDetails = JSON.parse(result);
        setQrResult(parsedDetails.std_ID);
        qrCodeScanner.stop();
        setScanning(false);
      } catch (error) {
        setScanning(false);
      }
    };

    if (scanning) {
      startScanner();
    }

    return () => {
      if (scanning && qrCodeScanner) {
        qrCodeScanner.clear();
      }
    };
  }, [scanning]);

  useEffect(() => {
    if (qrResult !== null) {
      fetchStudentDetails(qrResult, id);

      setScanning(false); // Stop scanning after fetching details
    }
  }, [qrResult, id]);

  // scaner button handle
  const handleButtonClick = () => {
    setScanning(!scanning);
  };

  const fetchStudentDetails = async (std_ID, id) => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/students/getStudentByStd_Id/${std_ID}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await response.json();
     // console.log("fetchstd",data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch student details");
      }

      setStudentDetails(data.student);
      setName(data.student.name);
      //console.log("object",data)
        if(response){
            updateSwimHoursbyStdID(data.student.std_ID,data.student.swimInTime,data.student.swimHours)
           // console.log("fetchAttend",data.student.attendence)
            setStdAttendID(data.student.attendence)
      }
     

      setLoading(false);
      setScanning(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

 
  const updateSwimHoursbyStdID = async (std_ID, inTime, swimHours) => {
    if (!user) {
        setError("You must be logged in");
        return;
    }

   // console.log("insideUpdate", std_ID);

    const getCurrentTime = () => {
        const date = new Date();
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const swimOutTime = getCurrentTime();
    
    // console.log("inTime", inTime);
    // console.log("swimOutTime", swimOutTime);
    // console.log("swimHours", swimHours);

    const parseTime = (timeStr) => {
        console.log("timeStr",timeStr)
        if (!timeStr) {
            throw new Error("Invalid time string");
        }

        const [time, modifier] = timeStr.split(' ');
        if (!time || !modifier) {
            throw new Error("Time or modifier is missing");
        }

        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return new Date().setHours(hours, minutes, 0, 0);
    };

    //console.log("inTime",inTime)
    const inTimeDate = parseTime(inTime);
    const swimOutTimeDate = parseTime(swimOutTime);

    // console.log("inTimeDate", inTimeDate);
    // console.log("swimOutTimeDate", swimOutTimeDate);

    // Calculate gap time in milliseconds
    const gapTimeInMillis = swimOutTimeDate - inTimeDate;
    const gapTimeMinutes = gapTimeInMillis / (1000 * 60); // convert milliseconds to minutes

    // Calculate total swim minutes
    const totalSwimMinutes = swimHours * 60; // convert swimHours to minutes

    // Calculate new swim minutes
    const newSwimMinutes = totalSwimMinutes - gapTimeMinutes;

    // Convert remaining swim minutes back to hours
    const newSwimHours = newSwimMinutes / 60; // convert minutes to hours

    // console.log("gapTimeMinutes", gapTimeMinutes);
    // console.log("newSwimMinutes", newSwimMinutes);
    // console.log("newSwimHours", newSwimHours);

  

    const payload = {
        swimInTime: null,
        swimHours: newSwimHours, 
    };

    const response = await fetch(
        `https://edu-project-backend.onrender.com/api/students/updateSwimHoursbyStdID/${std_ID}`, 
        {
            method: "PUT",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        }
    );

    const json = await response.json();

    if(json){
        updateSwimInTime(std_ID)
    }

   // console.log("Update Swim Hours Response:", json);

    if (!response.ok) {
        setError(json.error);
    } else {
        // Optionally, handle the successful update
      //  console.log("swimInTime and swimHours updated successfully!");
        setError(null);
    }
};

const updateSwimInTime = async (std_ID) => {
    if (!user) {
        setError("You must be logged in");
        return;
    }

    const payload = {
        swimInTime: "",
        attendence:""
    };

    const response = await fetch(
        `https://edu-project-backend.onrender.com/api/students/updateSwimInTime/${std_ID}`, 
        {
            method: "PUT",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        }
    );

    const json = await response.json();

 //  console.log("Update Swim In Response:", json);

    if (!response.ok) {
        setError(json.error);
    } else {
        // Optionally, handle the successful update
      //  console.log("swimInTime updated successfully!");
        setError(null);
        // You might want to navigate or update the state here if needed
    }
};
  
const updateSwimOutTimeByID = async (attentID) => {
    if (!user) {
        setError("You must be logged in");
        return;
    }

    const getCurrentTime = () => {
        const date = new Date();
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const swimOutTime = getCurrentTime();

    const payload = {
        outTime:swimOutTime
    };

    const response = await fetch(
        `https://edu-project-backend.onrender.com/api/attendance/updateSwimOutTimeByID/${attentID}`, 
        {
            method: "PUT",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        }
    );

    const json = await response.json();

  // console.log("Update Swim In Response:", json);

    if (!response.ok) {
        setError(json.error);
    } else {
        // Optionally, handle the successful update
      //  console.log("swimInTime updated successfully!");
        setError(null);
        // You might want to navigate or update the state here if needed
    }
};

useEffect(() => {
    if (attentID) {
       // console.log("attentID",attentID)
        updateSwimInTime(studentDetails.std_ID)
        updateSwimOutTimeByID(attentID);
    }
  }, [ studentDetails,attentID]);

 

  return (
    <div
      className="qrcontainer"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
        <button
        onClick={() => navigate(-1)} // Go back to the previous page
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "black",
          color: "#ffffff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px", // Space below the button
          marginLeft: "-270px", 
          display:'flex',
          justifyContent:'start'
        }}
      >
        Back
      </button>
      <div
        className="left-section"
        style={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <button
          onClick={handleButtonClick}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#ffffff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {scanning ? "Stop Scanner" : "Start Scanner"}
        </button>
        <div
          id="qr-scanner"
          style={{
            width: "100%",
            height: "300px",
            marginTop: "20px",
            border: "1px solid #ccc",
          }}
        ></div>
      </div>

      <div
        className="right-section"
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "20px",
          backgroundColor: "#ffffff",
        }}
      >
        <h2 style={{display:'flex',justifyContent:'center'}}>QR Code Result:</h2>
      
        {/* {qrResult && <p>Std_id : {qrResult} </p>} */}

        {studentDetails ? (
          <div style={{marginLeft:'10px'}}>
            <p>
              <span style={{ color: "red", fontWeight: "bold" }}>
                Student ID:
              </span>{" "}
              {studentDetails.std_ID}
            </p>
            <p>
              <span style={{ color: "red", fontWeight: "bold" }}>
                Student Name:
              </span>{" "}
              {studentDetails.name}
            </p>
           

            <p>
              <span style={{ color: "red", fontWeight: "bold" }}>Remaining Swimming Hours:</span>{" "}
              {studentDetails.swimHours}
            </p>
           
          </div>
        ) : (
          <p>Unable to parse student details from QR code</p>
        )}
      </div>
    </div>
  );
};

export default SwimOutQrScanner;
