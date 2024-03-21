import { useParams, } from "react-router-dom";
import React, { useContext ,useEffect,useState} from "react";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAuthContext } from "../hooks/useAuthContext";


const StudentProfile = () => {
  const { students } = useStudentContext();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { user } = useAuthContext();

  

  // Access the student ID from the URL
  const { studentId } = useParams();
  const { std_ID } = useParams();
  const studentdata = students.find((student) => student._id === studentId);

   useEffect(() => {
    if (studentdata) {
      // Fetch payment status for the student
      const fetchPaymentStatus = async () => {
        try {
          const response = await fetch(`https://edu-project-backend.onrender.com/api/payments/getAllPaymentStatusBystdId/${studentdata.std_ID}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log(data);
            setPaymentStatus(data.lastMonthStatus);
          } else {
            throw new Error('Failed to fetch payment status');
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchPaymentStatus();
    }
  }, [studentdata]);
  
  if (!studentdata) {
    return <div>Student not found</div>;
  }

  

  return (
    <div style={{ padding: "20px",  }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" ,}}>
        Student Profile 
      </h1>
      <div style={{marginLeft: "500px" }}>
      <div style={{ marginBottom: "10px" }}>
        <strong>Student ID:</strong> {studentdata._id}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Institute ID:</strong> {studentdata.inst_ID}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Student ID:</strong> {studentdata.std_ID}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Name:</strong> {studentdata.name}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Email:</strong> {studentdata.email}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Age:</strong> {studentdata.age}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Address:</strong> {studentdata.address}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Phone:</strong> {studentdata.phone}
      </div>
      
      <div style={{ marginBottom: "10px" }}>
          <strong>Class:</strong>{" "}
          {studentdata.classs.map((classObj, index) => (
            <span key={index}>
              {classObj.subject}
              {index !== studentdata.classs.length - 1 && ", "}
            </span>
          ))}
        </div>
        <div >
          <strong>Last Month Payment Status:</strong> <span style={{ color: "red" }}>{paymentStatus || 'Not paid'}</span>
        </div>
        

      </div>
      {/* 
      Display the image using the imageUrl 
      <img
        src={studentdata.imageUrl}
        alt={`Image of ${studentdata.name}`}
        style={{ width: "100%", height: "auto", marginTop: "20px" }}
      /> */}
    </div>
  );
};

export default StudentProfile;
