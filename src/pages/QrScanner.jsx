import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useParams } from "react-router-dom";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useClassContext } from "../hooks/useClassContext";
import "../styles/qrscanner.css"

const QrScn = () => {
  const { id } = useParams();
  const { dispatch } = useAttendanceContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: institute } = useSiteDetailsContext();
  const { classs, dispatch: clz } = useClassContext();
  const { students, dispatch: stds } = useStudentContext();
  const instID = user.instituteId;
  const [scanResult, setScanResult] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Unknown");
  const [tuteStatus, setTuteStatus] = useState("unknown");
  const [name, setName] = useState(null);
  const [instNotification, setInstNotification] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [clzName, setClassName] = useState("");
  

  const [remainingSMSCount, setRemainingSMSCount] = useState(0); 

  useEffect(() => {

    const TopP = sitedetail.topUpPrice
    const SMSP = sitedetail.smsPrice

    console.log(TopP)
    console.log(SMSP)

    console.log(sitedetail.topUpPrice / sitedetail.smsPrice)

    const remSmsCount =parseInt((sitedetail.topUpPrice / sitedetail.smsPrice) - sitedetail.smsCount)
    setRemainingSMSCount(remSmsCount);
  }, [sitedetail.smsPrice, sitedetail.topUpPrice , sitedetail.smsCount]);

  console.log(remainingSMSCount)

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
          institute({ type: "SET_SITE_DETAILS", payload: siteDetailsJson });
          fetchClasses(id)
        }
      } catch (error) {
        
      }
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
      fetchStudentDetails(qrResult, id, clzName);
      
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

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch student details");
      }

      setStudentDetails(data.student);
      setName(data.student.name);

      getPaymentStatus(data.student, id).then((status) => {
        setPaymentStatus(status);

        if (status === "not") {
          // Ask for user confirmation
          const userConfirmation = window.confirm(
            "Do you want to give a attendance for this student?"
          );

          if (userConfirmation) {
            submitAttendance(data.student, id, clzName);

            alert(`Gave access for student: ${data.student.name}`);
            // navigate('/qrScanner');
          }
        } else {
          submitAttendance(data.student, id, clzName);
        }
      });

      getTuteStatus(data.student, id, (tuteStatus) => {
        setTuteStatus(tuteStatus);

        if (tuteStatus === "not") {
          // Ask for user confirmation
          const userConfirmation = window.confirm(
            "Do you want to give a tute for this student?"
          );

          if (userConfirmation) {
            createTute(data.student, id);
            alert(`Tute gave for student: ${data.student.name}`);
          }
        }
      });

      setLoading(false);
      setScanning(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const submitAttendance = async (studentDetails, id, clzName) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    const std_ID = studentDetails.std_ID;
    const name = studentDetails.name;
    const date = new Date();
    const attendance = "yes";

    const stdAttendance = {
      inst_ID: instID,
      std_ID,
      name,
      date,
      classID: id,
      attendance,
      clzName,
    };

    if(remainingSMSCount >= 10){
      setInstNotification((prevNotification) => {
        if (prevNotification === "Yes") {
          // If instNotification is 'Yes', submit the email
          //submitEmail(studentDetails.email, studentDetails.name, clzName);
          sendSMS(studentDetails.phone, studentDetails.name, clzName);
        }
        return prevNotification; // Return the current state
      });
    }else{
      alert("your SMS Account balance is low. please topup!")
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

    console.log(phone)
    const to = phone;
    const colomboTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
    });

    const message = `Dear parent , \n your child:${stdName} was attend to the ${clzName} class at ${colomboTime} `;

    const emailDetails = { to, message,instID };
    console.log(instID)

    const response = await fetch("https://edu-project-backend.onrender.com/api/sms/send-message", {
      method: "POST",
      body: JSON.stringify(emailDetails),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
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

  const submitEmail = async (stdEmail, stdName, clzName) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    const email = stdEmail;
    const subject = "Inform about your child's class Attendance";
    const colomboTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Colombo",
    });

    const message = `Dear parent , \n your child:${stdName} was attend the ${clzName} class on ${colomboTime} `;

    const emailDetails = { email, subject, message };

    const response = await fetch("https://edu-project-backend.onrender.com/api/emails/sendEmail", {
      method: "POST",
      body: JSON.stringify(emailDetails),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
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

  const getTuteStatus = async (studentDetails, id, onStatusChange) => {
    const { std_ID } = studentDetails;

    try {
      const encodedStdID = encodeURIComponent(std_ID);
      const encodedClassID = encodeURIComponent(id);
      const currentMonth = new Date().toLocaleString("en-US", {
        month: "long",
      });
      const encodedMonth = encodeURIComponent(currentMonth);

      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/tutes/getTuteStatus?std_ID=${encodedStdID}&classID=${encodedClassID}&month=${encodedMonth}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      const data = await response.json();

      if (!response.ok) {
        
        onStatusChange("not");
      } else {
        onStatusChange(data.status); // Set status and trigger the callback
      }

      return data.status;
    } catch (error) {
      
      onStatusChange("not gave");
    }
  };

  const getPaymentStatus = async (studentDetails, id) => {
    const { std_ID } = studentDetails;

    try {
      const encodedStdID = encodeURIComponent(std_ID);
      const encodedClassID = encodeURIComponent(id);

      // Get current month
      const currentMonth = new Date().toLocaleString("en-US", {
        month: "long",
      });
      const encodedMonth = encodeURIComponent(currentMonth);

      // Append current month to the URL
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/payments/getPaymentStatus?std_ID=${encodedStdID}&classID=${encodedClassID}&month=${encodedMonth}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const data = await response.json();
      console.log("data",data)

      if (!response.ok) {
        
        return "not";
      }

      return data.status;
    } catch (error) {
      
      return "not gave";
    }
  };

  const createTute = async (studentDetails, id) => {
    if (!user) {
      setError("You must be logged in");
      return;
    }

    const std_ID = studentDetails.std_ID;
    const name = studentDetails.name;
    //have to specify the class
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString("en-US", { month: "long" });
    const status = "gave";

    const tute = {
      inst_ID: instID,
      std_ID,
      name,
      classID: id,
      month: monthName,
      status,
    };

    const response = await fetch("https://edu-project-backend.onrender.com/api/tutes/createTute", {
      method: "POST",
      body: JSON.stringify(tute),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });
    const json = await response.json();

    if (!response.ok) {
      setError(json.error);
      navigate("/");
    }
    if (response.ok) {
      alert(`${name}'s Tute has been given!`);
      setError(null);
      dispatch({ type: "CREATE_TUTE", payload: json });
    }
  };

  // useEffect(() => { 
    const fetchClasses = async (id) => {
      try {
        console.log("cID",id)
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/class/getClassDetailsByClassID/${id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();
        console.log(json.classs)

        setClassName(json.classs.subject);
        // Log the API response

        if (response.ok) {
          //setClz(json.data);
          console.log(json.classs)
          dispatch({ type: "SET_CLASS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

  //   if (user) {
  //     fetchClasses();
  //   }
  // }, [dispatch, user, id]);

  return (
    <div className="qrcontainer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <div className="left-section" style={{ width: '100%', maxWidth: '600px', marginBottom: '20px', padding: '20px', backgroundColor: '#f0f0f0' }}>
    <button onClick={handleButtonClick} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      {scanning ? "Stop Scanner" : "Start Scanner"}
    </button>
    <div id="qr-scanner" style={{ width: '100%', height: '300px', marginTop: '20px', border: '1px solid #ccc' }}></div>
  </div>

  <div className="right-section" style={{ width: '100%', maxWidth: '600px', padding: '20px', backgroundColor: '#ffffff' }}>
    <h2>QR Code Result:</h2>
    <h2>Class ID : {clzName}</h2>
    {/* {qrResult && <p>Std_id : {qrResult} </p>} */}

    {studentDetails ? (
      <div>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Student ID:</span> {studentDetails.std_ID}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Student Name:</span> {studentDetails.name}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Email:</span> {studentDetails.email}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Age:</span> {studentDetails.age}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Address:</span> {studentDetails.address}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Phone:</span> {studentDetails.phone}</p>
        <p> <span style={{color:'red' , fontWeight:'bold'}}>Classes:</span>
          {" "}
          {studentDetails.classs.map((cls) => cls.subject).join(", ")}
        </p>
        <p ><span style={{color:'red' , fontWeight:'bold'}}>Payment Status:</span> {paymentStatus}</p>
        <p><span style={{color:'red' , fontWeight:'bold'}}>Tute Status:</span>{tuteStatus}</p>
      </div>
    ) : (
      <p>Unable to parse student details from QR code</p>
    )}
  </div>
</div>


  );
};

export default QrScn;




{/* <div>
      <div style={{ width: "50%", float: "left" }}>
        <button onClick={handleButtonClick}>
          {scanning ? "Stop Scanner" : "Start Scanner"}
        </button>

        <div id="qr-scanner"></div>
      </div>

      <div style={{ width: "50%", float: "right" }}>
        <h2>QR Code Result:</h2>
        <h2>Class ID : {id}</h2>
        {qrResult && <p>Std_id : {qrResult} </p>}

        {studentDetails ? (
          <div>
            <p>IID: {studentDetails.inst_ID}</p>
            <p>SID: {studentDetails.std_ID}</p>
            <p>Name: {studentDetails.name}</p>
            <p>Email: {studentDetails.email}</p>
            <p>Age: {studentDetails.age}</p>

            <p>Address: {studentDetails.address}</p>
            <p>Phone: {studentDetails.phone}</p>
            <p>
              Classes:{" "}
              {studentDetails.classs.map((cls) => cls.subject).join(", ")}
            </p>
            <p>Payment Status: {paymentStatus}</p>
            <p>Tute Status:{tuteStatus}</p>
          </div>
        ) : (
          <p>Unable to parse student details from QR code</p>
        )}
      </div>
    </div> */}