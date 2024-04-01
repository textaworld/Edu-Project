import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";


const AbsentStudents = () => {
  const { id } = useParams();
  const { students, dispatch } = useStudentContext();
  const { sitedetail, dispatch: institute } = useSiteDetailsContext();

  const { attendances, dispatch: attendanceDispatch } = useAttendanceContext();
  const { user } = useAuthContext();
  const { classs, dispatch: clz } = useClassContext();
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPhone, setTeacherPhone] = useState("");
  const [absntStudents, setAbsntStudents] = useState([]);
  const [absentStudentsNames, setAbsentStudentsName] = useState([]);
  const [absentCount, setAbsentCount] = useState();
  const [fullStdCount, setFullStdCount] = useState();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false); // State to track button click
  const [hideButton, setHideButton] = useState(false);
  const [instNotification, setInstNotification] = useState("");
  const instID = user.instituteId;


  const [remainingSMSCount, setRemainingSMSCount] = useState(0); 

  useEffect(() => {

    const TopP = sitedetail.topUpPrice
    const SMSP = sitedetail.smsPrice

    // console.log(TopP)
    // console.log(SMSP)

    console.log(sitedetail.topUpPrice / sitedetail.smsPrice)

    const remSmsCount =parseInt((sitedetail.topUpPrice / sitedetail.smsPrice) - sitedetail.smsCount)
    setRemainingSMSCount(remSmsCount);
  }, [sitedetail.smsPrice, sitedetail.topUpPrice , sitedetail.smsCount]);

  console.log(remainingSMSCount)

  useEffect(() => {
    // Function to hide button for 2 hours
    const hideButtonForTwoHours = () => {
      setHideButton(true);
      setTimeout(() => {
        setHideButton(false);
      }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
    };
  
    if (buttonClicked) {
      hideButtonForTwoHours(); // Call the function to hide button after click
    }
  }, [buttonClicked]);
  
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

  console.log(instNotification)

  useEffect(() => {
    const getAllStudentsByClassName = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/students/getAllStudentsByClassID/${id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.ok) {
          const json = await response.json();
          const studentCount = json.length;
          setFullStdCount(studentCount);
          dispatch({ type: "SET_STUDENTS", payload: json });
        }
      } catch (error) {
        setError(error.message);
      }
    };

    getAllStudentsByClassName();
    fetchClasses(id);
  }, [className, dispatch, user]);

  const fetchClasses = async (id) => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/class/getClassDetailsByClassID/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.ok) {
        const json = await response.json();
        setClasses(json);
        setClassName(json.classs.subject);
        setTeacherEmail(json.classs.teacherEmail);
        setTeacherPhone(json.classs.teacherPhone);
        clz({ type: "SET_CLASS", payload: json });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      const response = await fetch(
        "https://edu-project-backend.onrender.com/api/attendance/getAllAttendance",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();

      if (response.ok) {
        attendanceDispatch({ type: "SET_ATTENDANCE", payload: json });
      }
    };

    if (user) {
      fetchAttendance();
    }
  }, [attendanceDispatch, user]);

  const isAbsent = (studentID, id) => {
    const currentDate = new Date();
    const fiveHoursAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);

    const studentAttendance = attendances.find(
      (attendance) =>
        attendance.std_ID === studentID &&
        attendance.classID === id &&
        new Date(attendance.date) >= fiveHoursAgo &&
        new Date(attendance.date) <= currentDate
    );

    return !studentAttendance || studentAttendance.status === "absent";
  };

  useEffect(() => {
    const absentStudents = students.filter((student) =>
      isAbsent(student.std_ID, id)
    );
    setAbsntStudents(absentStudents);
    setAbsentCount(absentStudents.length);

    const studentNames = absentStudents.map(({ name }) => name);
    setAbsentStudentsName(studentNames);
  }, [students, className]);

  const sendParentSmss = async () => {
    for (const student of absntStudents) {
      try {
        await sendSMSToParents(student.phone, student.name, className);
      } catch (error) {
        console.error(`Error sending SMS to ${student.phone}:`, error);
      }
    }
  };

  const sendSMSs = async () => {
    try {
      
      if(remainingSMSCount >= 10) {
        setInstNotification((prevNotification) => {
          if (prevNotification === "Yes") {
            // If instNotification is 'Yes', submit the email
            //submitEmail(studentDetails.email, studentDetails.name, clzName);
            // sendSMS(studentDetails.phone, studentDetails.name, clzName);
  
             sendSMSToTeacher();
         sendParentSmss();
          }
          return prevNotification; // Return the current state
        });
      }else {
        alert("Your SMS account balance is low. Please topUp")
      }
      
      // await sendSMSToTeacher();
      // await sendParentSmss();
      await submitEmail();
    await sendParentEmails();
      setSubmissionSuccess(true);
      setButtonClicked(true); // Set button clicked to true
    } catch (error) {
      console.error("Error sending emails:", error);
      setError("Error sending emails.");
    }
  };

  const sendSMSToParents = async (stdPhone, stdName, className) => {
    const to = stdPhone;
    const message = `Dear parent, your child ${stdName} was absent from today's ${className} class.`;
    //const message = `ඔබේ දරුවා:${stdName} අද දින ${className} පන්තියට පැමිණ නැත`
    const emailDetails = { to, message, instID };

    const response = await fetch("https://edu-project-backend.onrender.com/api/sms/send-message", {
      method: "POST",
      body: JSON.stringify(emailDetails),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error sending SMS.");
    }
  };

  const sendSMSToTeacher = async () => {
    console.log(instID)
    console.log(teacherPhone)

    const to = teacherPhone;
    const message = `Hello sir,\nFull Student Count: ${fullStdCount}\nAbsent Students: ${absentCount}\nAbsent Students' Names: ${absentStudentsNames.join("\n")}`;
    const emailDetails = { to, message, instID };

    const response = await fetch("https://edu-project-backend.onrender.com/api/sms/send-message", {
      method: "POST",
      body: JSON.stringify(emailDetails),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error sending SMS to teacher.");
    }
  };
  const sendParentEmails = async () => {
    for (const student of absntStudents) {
      try {
        await submitParentEmail(student.email, student.name, className);
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error);
      }
    }
  };
  // const sendEmails = async () => {
  //   await submitEmail();
  //   await sendParentEmails();
  //   setButtonClicked(true);
  // };

  const submitEmail = async () => {
      if (!user) {
        setError("You must be logged in");
        return;
      }
  
      const email = teacherEmail;
      const subject = "Absent Students of today class";
      const message = `Hello sir, \n Full Student Count : ${fullStdCount} \n 
      Absent Students:${absentCount} \n these students are absent today:\n${absentStudentsNames.join(
        "\n"
      )}`;
  
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
      }
  
      if (response.ok) {
        setError(null);
        setSubmissionSuccess(true);
        dispatch({ type: "CREATE_EMAIL", payload: json });
      }
    };
  
    const submitParentEmail = async (stdEmail, stdName, className) => {
      if (!user) {
        setError("You must be logged in");
        return;
      }
  
      const email = stdEmail;
      const subject = "Inform about your child's class Attendance";
      
  
      const message = `Dear parent , \n your child:${stdName} was not attend to the today ${className} class  `;
  
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
      }
      if (response.ok) {
        setError(null);
        dispatch({ type: "CREATE_EMAIL", payload: json });
      }
    };

  return (
    <div className="instituteTableContainer" style={{ padding: "20px" }}>
      <table className="instituteTable" style={{ width: "100%" }}>
        <thead>
          <tr className="test">
            <th>SID</th>
            <th>Name</th>
            <th>EMail</th>
          </tr>
        </thead>
        <tbody>
          {absntStudents.map((student, index) => (
            <tr key={index}>
              <td>{student.std_ID}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {/* <button
          onClick={sendEmails}
          style={{
            background: "#0f172a",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          Send Emails
        </button> */}
        <button
  onClick={sendSMSs}
  style={{
    background: "#0f172a",
    color: "white",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    marginLeft: "10px",
    display: hideButton ? "none" : "block" // Conditionally render based on hideButton state
  }}
>
  Send SMS
</button>
        {error && <div className="error">{error}</div>}
        {submissionSuccess && (
          <div className="success">SMS sent successfully!</div>
        )}
      </div>
    </div>
  );
};

export default AbsentStudents;
