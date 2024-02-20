import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAttendanceContext } from "../hooks/useAttendanceContext";
import { useClassContext } from "../hooks/useClassContext";

const AbsentStudents = () => {
  const { id } = useParams();
  const { students, dispatch } = useStudentContext();
  const { attendances, dispatch: attendanceDispatch } = useAttendanceContext();
  const { user } = useAuthContext();
  const { classs, dispatch: clz } = useClassContext();
  const [className, setClassName] = useState("");
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const [teacherEmail, setTeacherEmail] = useState("");
  const [absntStudents, setAbsntStudents] = useState([]);
  const [absentStudentsNames, setAbsentStudentsName] = useState([]);
  const [absentCount, setAbsetCount] = useState();
  const [fullStdCount, setFullStdCount] = useState();
  const [submissionSuccess, setSubmissionSuccess] = useState(false); 

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
    setAbsetCount(absentStudents.length);

    const studentNames = absentStudents.map(({ name }) => name);
    setAbsentStudentsName(studentNames);
  }, [students, className]);

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

  const sendParentEmails = async () => {
    for (const student of absntStudents) {
      try {
        await submitParentEmail(student.email, student.name, className);
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error);
      }
    }
  };
  const sendEmails = async () => {
    await submitEmail();
    await sendParentEmails();
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
          onClick={submitEmail}
          style={{
            background: "#0f172a",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send to teacher
        </button> */}
        <button
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
          Send to Emails
        </button>
        {error && <div className="error">{error}</div>}
          {submissionSuccess && (
            <div className="success"> Emails Sent successfully!</div>
          )}
      </div>
    </div>
  );
};

export default AbsentStudents;
