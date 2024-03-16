import React, { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useParams } from "react-router-dom";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useClassContext } from "../hooks/useClassContext";
import "../styles/qrscanner.css"
import sound from "../assets/beep-06.mp3";
import sound2 from "../assets/next-one.mp3";

const StartSchool = () => {
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
  const [submittingAttendance, setSubmittingAttendance] = useState(false); 
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);

  useEffect(() => {

    const TopP = sitedetail.topUpPrice
    const SMSP = sitedetail.smsPrice

    // console.log(TopP)
    // console.log(SMSP)

    //console.log(sitedetail.topUpPrice / sitedetail.smsPrice)

    const remSmsCount =parseInt((sitedetail.topUpPrice / sitedetail.smsPrice) - sitedetail.smsCount)
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

            const remSmsCount =parseInt((sitedetail.topUpPrice / sitedetail.smsPrice) - sitedetail.smsCount)
    setRemainingSMSCount(remSmsCount);

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



//   useEffect(() => {
//     let qrCodeScanner;

//     const startScanner = async () => {
//       try {
//         qrCodeScanner = new Html5QrcodeScanner("qr-scanner", {
//           fps: 20,
//           qrbox: 300,
//         });

//         const result = await new Promise((resolve, reject) => {
//           qrCodeScanner.render((qrResult) => resolve(qrResult));
//         });

//         const parsedDetails = JSON.parse(result);
//         setQrResult(parsedDetails.std_ID);
//         playBeepSound(); // Play beep sound after scanning
//         qrCodeScanner.clear();
//       } catch (error) {
//         console.error("Error while scanning QR code:", error);
//       }
//     };

//     startScanner();

//     return () => {
//       if (qrCodeScanner) {
//         qrCodeScanner.clear();
//       }
//     };
//   }, [id]);

//   const playBeepSound = () => {
//     // Code to play beep sound
//     const beep = new Audio("beep.mp3");
//     beep.play();
//   };

useEffect(() => {
    let qrCodeScanner;
    let scanningActive = true;

    const startScanner = async () => {
      try {
        qrCodeScanner = new Html5QrcodeScanner("qr-scanner", {
          fps: 20,
          qrbox: 300,
        });

        qrCodeScanner.render(async (qrResult) => {
          if (scanningActive) {
            playBeepSound(); // Play beep sound after scanning
            playNextOneSound();
            const parsedDetails = JSON.parse(qrResult);
            setQrResult(parsedDetails.std_ID);

            // Call submitAttendance here

            // console.log("rem0",remainingSMSCount)
            
            // if (!attendanceSubmitted) {
            //     fetchStudentDetails(parsedDetails.std_ID, id, clzName);
            //     setAttendanceSubmitted(true);
            //   }
              

            // Disable scanning temporarily
            scanningActive = false;

            // Reset qrResult after a delay
            setTimeout(() => {
              setQrResult(null);
            }, 1000);

            // Restart scanning after 30 seconds
            setTimeout(() => {
              scanningActive = true;
            }, 10000);
          }
        });
      } catch (error) {
        console.error("Error while scanning QR code:", error);
      }
    };

    startScanner();

    return () => {
        if (qrCodeScanner) {
            qrCodeScanner.clear();
            // If qrCodeScanner has a stop method, call it here
            if (typeof qrCodeScanner.stop === 'function') {
                qrCodeScanner.stop();
            }
        }
    };
  }, []);



  
  const playBeepSound = () => {
    // Code to play beep sound
    const beep = new Audio(sound);
    
    beep.play();
  };
  const playNextOneSound = () => {
    // Code to play beep sound
    const beep = new Audio(sound2);
    
    beep.play();
  };



  useEffect(() => {
    if (qrResult !== null ) {
      // Call fetchStudentDetails only if attendance is not already being submitted
      fetchStudentDetails(qrResult, id, clzName);
    }
  }, [qrResult, id]);



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

       // console.log("rem1",remainingSMSCount)
            submitAttendance(data.student, id, clzName);
        
          
        

      setLoading(false);
      setScanning(true);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const submitAttendance = async (studentDetails, id, clzName) => {
    //setSubmittingAttendance(true);
    //console.log("gg")
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

    //console.log("rem",remainingSMSCount)
    if(remainingSMSCount >= 10){
       
      setInstNotification((prevNotification) => {
        if (prevNotification === "Yes") {
          // If instNotification is 'Yes', submit the email
          submitEmail(studentDetails.email, studentDetails.name, clzName);
          //console.log(studentDetails.phone)
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
      //alert(`${name}'s Attendance has been recorded!`);
      setError(null);
      dispatch({ type: "CREATE_ATTENDANCE", payload: json });
    }

   // setSubmittingAttendance(false);
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
    //console.log(instID)

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

    const message = `Dear parent , \n your child:${stdName} was attend to the ${clzName} class at ${colomboTime} `;

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
        //console.log(json.classs)

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
    
    <div id="qr-scanner" style={{ width: '100%', height: '300px', marginTop: '20px', border: '1px solid #ccc' }}></div>
  </div>

  <div className="right-section" style={{ width: '100%', maxWidth: '600px', padding: '20px', backgroundColor: '#ffffff' }}>
    <h2 style={{marginLeft:'140px'}}>Scan your ID card here </h2>
    {/* <h2>Class ID : {clzName}</h2> */}
    {/* {qrResult && <p>Std_id : {qrResult} </p>} */}

    {/* {studentDetails ? (
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
    )} */}
  </div>
</div>


  );
};

export default StartSchool;




