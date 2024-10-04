


import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useParams } from "react-router-dom";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
// import { useStudentContext } from "../hooks/useStudentContext";
// import { useClassContext } from "../hooks/useClassContext";
import "../styles/qrscanner.css";

const SwminInQrScanner = () => { 
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
  const [clzName, setClassName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [remainingSMSCount, setRemainingSMSCount] = useState(0);
  const [inTime,setInTime]=useState("")
  const [attendenceID,setAttendenceID]= useState("")
  //console.log("id",id )

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
          fetchClasses(id);
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
          fps: 20,
          qrbox: 300,
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
    //   console.log("fetchstd",data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch student details");
      }

     
      setName(data.student.name);
      if(data.student.swimHours===0 || data.student.swimHours <0){
        
        alert(`Your Swim Hours Is Over Please Contact Your Admin`)
      }else{
        
        if(response){
            setStudentDetails(data.student); 
            submitAttendance(data.student,id,clzName,inTime)
            // if(attendenceID){
            //   updateSwimInTime(data.student,attendenceID)
            // }

         }
      }
     

      setLoading(false);
      setScanning(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const submitAttendance = async (studentDetails, id, clzName,inTime) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    const std_ID = studentDetails.std_ID;
    const name = studentDetails.name;
    const date = new Date();
    const attendance = "yes";

    const getCurrentTime = () => {
        const date = new Date();
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const swimInTime = getCurrentTime(); 

    const stdAttendance = {
      inst_ID: instID,
      std_ID,
      name,
      date,
      classID: id,
      attendance,
      clzName,
      inTime:swimInTime,
    outTime:"",
    };

    if (remainingSMSCount >= 10) {
      setInstNotification((prevNotification) => {
        if (prevNotification === "Yes") {
          // If instNotification is 'Yes', submit the email
          //submitEmail(studentDetails.email, studentDetails.name, clzName);
          sendSMS(studentDetails.phone, studentDetails.name, clzName);
        }
        return prevNotification; // Return the current state
      });
    } else {
      alert("your SMS Account balance is low. please topup!");
    }

    const response = await fetch(
      "https://edu-project-backend.onrender.com/api/attendance/createAttendance",
      {
        method: "POST",
        body: JSON.stringify(stdAttendance),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const json = await response.json();
    if (response.ok) {
      setAttendenceID(json._id); // Set the ID after successful attendance creation
      alert(`${name}'s Attendance has been recorded!`);
      dispatch({ type: "CREATE_ATTENDANCE", payload: json });
    } else {
      setError(json.error);
    }

    if (!response.ok) {
      setError(json.error);
      navigate("/");
    }
    if (response.ok) {
      alert(`${name}'s Attendance has been recorded!`);
      setError(null);
      dispatch({ type: "CREATE_ATTENDANCE", payload: json });
    }
  };
  
  const sendSMS = async (phone, stdName, clzName) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    // console.log(phone)
    const to = phone;
    const colomboTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
    });

    const message = `${instituteName}\n\n Dear parent , \n your child:${stdName} attended the ${clzName} class on ${colomboTime} `;

    const emailDetails = { to, message, instID };
    // console.log(instID)

    const response = await fetch(
      "https://edu-project-backend.onrender.com/api/sms/send-message",
      {
        method: "POST",
        body: JSON.stringify(emailDetails),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      navigate("/");
    }
    if (response.ok) {
      setError(null);
      dispatch({ type: "CREATE_EMAIL", payload: json });
    }
  };

  const fetchClasses = async (id) => {
    try {
      //console.log("cID",id)
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/class/getClassDetailsByClassID/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();
      //console.log(json.classs);

      setClassName(json.classs.subject);
      // Log the API response

      if (response.ok) {
        //setClz(json.data);
        //console.log(json.classs)
        dispatch({ type: "SET_CLASS", payload: json.data });
      }
    } catch (error) {}
  };
 

const updateSwimInTime = async (studentDetails,attendenceID) => {
    if (!user) {
        setError("You must be logged in");
        return;
    }

    const std_ID = studentDetails.std_ID;
    const date = new Date();

    const getCurrentTime = () => {
        const date = new Date();
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const swimInTime = getCurrentTime(); 

   // console.log("attendenceID",attendenceID)
    setInTime(swimInTime)
    const payload = {
        swimInTime: swimInTime,
        attendence:attendenceID
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


useEffect(() => {
  if (attendenceID) {
    updateSwimInTime(studentDetails, attendenceID);
  }
}, [attendenceID, studentDetails]);

 

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
              <span style={{ color: "red", fontWeight: "bold" }}>Age:</span>{" "}
              {studentDetails.age}
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

export default SwminInQrScanner;
