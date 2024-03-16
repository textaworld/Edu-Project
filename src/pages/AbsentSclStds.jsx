import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";


const AbsentSclStds = () => {
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
  const [classIds, setClassIds] = useState([]);
  const [teacherClassId, setTeacherClassID] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);


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
          `http://localhost:3018/api/site/getone/${user.instituteId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const siteDetailsJson = await siteDetailsResponse.json();

        if (siteDetailsResponse.ok) {
          setInstNotification(siteDetailsJson.notification);
          institute({ type: "SET_SITE_DETAILS", payload: siteDetailsJson });
          //fetchClasses(id)
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
          `http://localhost:3018/api/students/getAllStudentsByInsId/${user.instituteId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (response.ok) {
          const json = await response.json();
          const studentsArray = json.data || [];
          console.log(studentsArray)


        //   studentsArray.forEach(student => {
        //     const classId = student.classs.length > 0 ? student.classs[0]._id : "No class ID found";
        //     console.log(classId);
        //   });

         // Accumulate class IDs in an array
         const classIdsArray = studentsArray.map(student => {
            return student.classs.length > 0 ? student.classs[0]._id : null;
          });
  
          // Filter out null values (if any)
          const filteredClassIdsArray = classIdsArray.filter(classId => classId !== null);
  
          // Set the class IDs state variable
          setClassIds(filteredClassIdsArray);

          console.log(json.data)
          const studentCount = studentsArray.length
          console.log(studentCount)
          setFullStdCount(studentCount);
          dispatch({ type: "SET_STUDENTS", payload: studentsArray  });
        }
      } catch (error) {
        setError(error.message);
      }
    };

    getAllStudentsByClassName();
    
  }, [dispatch, user]);

// console.log(classIds)
// console.log("tClz",teacherClassId)

//   useEffect(() => {
//     const getAllStudentsByClassName = async () => {
//       try {
//         const response = await fetch(
//           `http://localhost:3018/api/students/getAllStudentsByClassID/${id}`,
//           {
//             headers: { Authorization: `Bearer ${user.token}` },
//           }
//         );

//         if (response.ok) {
//           const json = await response.json();
//           const studentCount = json.length;
//           setFullStdCount(studentCount);
//           dispatch({ type: "SET_STUDENTS", payload: json });
//         }
//       } catch (error) {
//         setError(error.message);
//       }
//     };

//     getAllStudentsByClassName();
//     fetchClasses(id);
//   }, [className, dispatch, user]);

  const fetchClasses = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3018/api/class/getClassDetailsByClassID/${id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (response.ok) {
        const json = await response.json();
          const classArray = json.classs._id || [];
          console.log(classArray)
        console.log("clz",json)
       // console.log(json.data._id)
        setClasses(json);
        setClassName(json.classs.subject);
        setTeacherEmail(json.classs.teacherEmail);
        setTeacherPhone(json.classs.teacherPhone);
        setTeacherClassID(classArray)
        clz({ type: "SET_CLASS", payload: json });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    classIds.forEach(id => {
      fetchClasses(id);
    });
  }, [classIds]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const response = await fetch(
        "http://localhost:3018/api/attendance/getAllAttendance",
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


// useEffect(() => {
//   const isAbsent = (studentID) => {
//     const currentDate = new Date();
//     const fiveHoursAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);

//     const studentAttendance = attendances.find(
//       (attendance) =>
//         attendance.std_ID === studentID &&
        
//         new Date(attendance.date) >= fiveHoursAgo &&
//         new Date(attendance.date) <= currentDate
//     );

//     return !studentAttendance || studentAttendance.status === "absent";
//   };


// const updateAbsentStudents = () => {
//     // Filter absent students based on the updated students state
//     const absentStudents = students.filter((student) =>
//       isAbsent(student.std_ID)
//     );
//     setAbsntStudents(absentStudents);
//     setAbsentCount(absentStudents.length);

//     const studentNames = absentStudents.map(({ name }) => name);
//     setAbsentStudentsName(studentNames);
//   };

//   updateAbsentStudents(); // Call the function to update absent students
// }, [students]);

useEffect(() => {
  // Function to filter absent students
  const updateAbsentStudents = () => {
    const currentDate = new Date();
    const fiveHoursAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);

    const isAbsent = (studentID) => {
      const studentAttendance = attendances.find(
        (attendance) =>
          attendance.std_ID === studentID &&
          new Date(attendance.date) >= fiveHoursAgo &&
          new Date(attendance.date) <= currentDate
      );

      return !studentAttendance || studentAttendance.status === "absent";
    };

    // Filter absent students based on attendance
    const absentStudents = students.filter((student) => isAbsent(student.std_ID));
    setAbsentStudents(absentStudents);
  };

  

 
    updateAbsentStudents(); // Call the function to update absent students
  
}, [students, attendances, classs]);

// Logic to send absent students to their respective teachers
useEffect(() => {
  const updateAbsentStudents = () => {
    if (students && attendances && classs) {
      const currentDate = new Date();
      const fiveHoursAgo = new Date(currentDate.getTime() - 5 * 60 * 60 * 1000);

      const isAbsent = (studentID) => {
        const studentAttendance = attendances.find(
          (attendance) =>
            attendance.std_ID === studentID &&
            new Date(attendance.date) >= fiveHoursAgo &&
            new Date(attendance.date) <= currentDate
        );
        return !studentAttendance || studentAttendance.status === "absent";
      };

      const absentStudents = students.filter((student) => isAbsent(student.std_ID));
      setAbsentStudents(absentStudents);
    }
  };

  updateAbsentStudents();
}, [students, attendances, classs]);

const handleButtonClick = () => {
  

  if(remainingSMSCount >= 10) {
    setInstNotification((prevNotification) => {
      if (prevNotification === "Yes") {
        setButtonClicked(true);
      }
      return prevNotification; // Return the current state
    });
  }else {
    alert("Your SMS account balance is low. Please topUp")
  }
  
};

//correct one
useEffect(() => {
  // Initialize a set to keep track of processed phone numbers
  const processedPhoneNumbers = new Set();

  const sendSMSToParents = async () => {
    try {
      // Iterate over absent students and send SMS to each parent
      for (const student of absentStudents) {
        // Check if this phone number has already been processed
        if (!processedPhoneNumbers.has(student.phone)) {
          // Construct SMS message
          const message = `Dear parent, your child ${student.name} was absent from today's School.`;

          // Prepare data for sending SMS
          const smsData = {
            to: student.phone,
            message: message,
            instID: user.instituteId,
          };

          // Send SMS via API
          const response = await fetch("http://localhost:3018/api/sms/send-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify(smsData),
          });

          // Check if SMS sending was successful
          if (!response.ok) {
            throw new Error("Error sending SMS to parent.");
          }

          // Add phone number to the processed set
          processedPhoneNumbers.add(student.phone);

          // Log success message
          console.log(`SMS sent successfully to parent of ${student.name}`);
        }
      }
    } catch (error) {
      console.error("Error sending SMS to parent:", error);
      // Handle error, such as setting an error state or displaying a message to the user
    }
  };

  // Check if button is clicked and there are absent students
  if (buttonClicked && absentStudents.length > 0) {
    sendSMSToParents();
  }
}, [buttonClicked, absentStudents, user]);



  // const sendParentSmss = async () => {
  //   if (buttonClicked ) {
  //   for (const student of absntStudents) {
  //     try {
  //       await sendSMSToParents(student.phone, student.name, className);
  //     } catch (error) {
  //       console.error(`Error sending SMS to ${student.phone}:`, error);
  //     }
  //   }
  // }
  // };

  

  // const sendSMSs = async () => {
  //   try {
      
  //     if(remainingSMSCount >= 10) {
  //       setInstNotification((prevNotification) => {
  //         if (prevNotification === "Yes") {
  //           // If instNotification is 'Yes', submit the email
  //           //submitEmail(studentDetails.email, studentDetails.name, clzName);
  //           // sendSMS(studentDetails.phone, studentDetails.name, clzName);
          

  //            //sendSMSToTeacher(message);
  //        sendParentSmss();
  //         }
  //         return prevNotification; // Return the current state
  //       });
  //     }else {
  //       alert("Your SMS account balance is low. Please topUp")
  //     }
      
  //     // await sendSMSToTeacher();
  //     // await sendParentSmss();
  //     await submitEmail();
  //   await sendParentEmails();
  //     setSubmissionSuccess(true);
  //     setButtonClicked(true); // Set button clicked to true
  //   } catch (error) {
  //     console.error("Error sending emails:", error);
  //     setError("Error sending emails.");
  //   }
  // };

  // const sendSMSToParents = async (student) => {
  //   const to = student.phone
  //   const message = `Dear parent, your child ${student.name} was absent from today's ${className} class.`;
  //   //const message = `ඔබේ දරුවා:${stdName} අද දින ${className} පන්තියට පැමිණ නැත`
  //   const emailDetails = { to, message, instID };

  //   const response = await fetch("http://localhost:3018/api/sms/send-message", {
  //     method: "POST",
  //     body: JSON.stringify(emailDetails),
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${user.token}`,
  //     },
  //   });

  //   if (!response.ok) {
  //     throw new Error("Error sending SMS.");
  //   }
  // };

  useEffect(() => {

  const sendSMSToTeacher = async (teacherPhone,message) => {
    try {
      if (!teacherPhone) {
        throw new Error("Teacher phone number is empty.");
      }

      //console.log("smscontent",message)
  
      const to = teacherPhone;
     // const message = `Hello sir,\nFull Student Count: ${fullStdCount}\nAbsent Students: ${absentCount}\nAbsent Students' Names: ${absentStudentsNames.join("\n")}`;
      const emailDetails = { to, message, instID };
  
      const response = await fetch("http://localhost:3018/api/sms/send-message", {
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
    } catch (error) {
      console.error("Error sending SMS to teacher:", error);
      // Handle error, e.g., set an error state or display a message to the user
    }
  };
  
  const sendSMSToTeachers = async () => {
    // Initialize a set to keep track of processed teachers
    const processedTeachers = new Set();
    
    if (buttonClicked && classIds.length > 0) {
      for (const classId of classIds) {
        try {
          // Fetch class details including teacher information
          const response = await fetch(
            `http://localhost:3018/api/class/getClassDetailsByClassID/${classId}`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          const classJson = await response.json();
          if (response.ok) {
            const teacherPhone = classJson.classs.teacherPhone;
            const className = classJson.classs.subject;
  
            // Check if this teacher has already been processed
            if (!processedTeachers.has(teacherPhone)) {
              // Compose SMS message with absent students' names
              const absentStudentsForClass = absentStudents
                .filter(student => student.classs[0]._id === classId)
                .map(student => student.name)
                .join(", ");
              //console.log(absentStudentsForClass);
              
              const message = `Dear teacher, the following students were absent today in ${className} class: ${absentStudentsForClass}`;
              
              // Send SMS to teacher
              await sendSMSToTeacher(teacherPhone, message);
              
              // Add teacher phone number to the processed set
              processedTeachers.add(teacherPhone);
            }
          }
        } catch (error) {
          console.error("Error sending SMS to teacher:", error);
        }
      }
    }
  };
  
  if (buttonClicked) {
    sendSMSToTeachers();
  }
  
}, [buttonClicked, classIds, absentStudents, user.token]);




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

  // const submitEmail = async () => {
  //     if (!user) {
  //       setError("You must be logged in");
  //       return;
  //     }
  
  //     const email = teacherEmail;
  //     const subject = "Absent Students of today class";
  //     const message = `Hello sir, \n Full Student Count : ${fullStdCount} \n 
  //     Absent Students:${absentCount} \n these students are absent today:\n${absentStudentsNames.join(
  //       "\n"
  //     )}`;
  
  //     const emailDetails = { email, subject, message };
  
  //     const response = await fetch("http://localhost:3018/api/emails/sendEmail", {
  //       method: "POST",
  //       body: JSON.stringify(emailDetails),
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${user.token}`,
  //       },
  //     });
  
  //     const json = await response.json();
  
  //     if (!response.ok) {
  //       setError(json.error);
  //     }
  
  //     if (response.ok) {
  //       setError(null);
  //       setSubmissionSuccess(true);
  //       dispatch({ type: "CREATE_EMAIL", payload: json });
  //     }
  //   };
  
 

  return (
    <div className="instituteTableContainer" style={{ padding: "20px" }}>
      <table className="instituteTable" style={{ width: "100%" }}>
        <thead>
          <tr className="test">
            <th>SID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {absentStudents.map((student, index) => (
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
  onClick={handleButtonClick}
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

export default AbsentSclStds;
