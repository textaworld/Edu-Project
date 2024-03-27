import { useParams, } from "react-router-dom";
import React, { useContext ,useEffect,useState} from "react";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useAttendanceContext } from "../hooks/useAttendanceContext";



const StudentProfile = () => {
  const { students  } = useStudentContext();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const { user } = useAuthContext();
  const {attendences, dispatch} = useAttendanceContext();

  const [attendanceCounts, setAttendanceCounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  

  // Access the student ID from the URL
  const { studentId } = useParams();
  const { std_ID } = useParams();
  const studentdata = students.find((student) => student._id === studentId);

  useEffect(() => {
    const fetchAttendanceCounts = async () => {
      try {
        console.log(studentdata.std_ID);
        const response = await fetch(
          `http://localhost:3018/api/attendance/getAttendanceCountsByMonth?std_ID=${studentdata.std_ID}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {

          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const formattedData = json.data.map(item => ({
            month: months[item.month - 1], // Subtract 1 because months are zero-indexed in JavaScript Date objects
            count: item.count
          }));

          setAttendanceCounts(formattedData);
          setIsLoading(false);
        } else {
          setError(json.error || 'Failed to fetch attendance counts');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to fetch attendance counts');
        setIsLoading(false);
      }
    };

    fetchAttendanceCounts(); // Call the function unconditionally

  }, []);

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
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Student Profile 
      </h1>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
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
        <div style={{ flex: 1 , marginBottom:'20px'}}>
          <h4  >Student Attendences</h4>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <ul>
              {attendanceCounts.map((count, index) => (
                <li key={index}>{count.month}: {count.count}</li>
              ))}
            </ul>
          )}
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
