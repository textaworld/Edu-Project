import { useParams } from "react-router-dom";
import React, { useContext } from "react";
import { useStudentContext } from "../hooks/useStudentContext";

const StudentProfile = () => {
  const { students } = useStudentContext();

  // Access the student ID from the URL
  const { studentId } = useParams();
  const studentdata = students.find((student) => student._id === studentId);
  if (!studentdata) {
    return <div>Student not found</div>;
  }

  return (
    <div>
      <h1>Student Profile Page</h1>
      <p>Student ID: {studentdata._id}</p>
      <p>{studentdata.inst_ID}</p>
      <p>{studentdata.std_ID}</p>
      <p>{studentdata.name}</p>
      <p>{studentdata.email}</p>
      <p>{studentdata.age}</p>
      <p>{studentdata.address}</p>
      <p>{studentdata.phone}</p>
      {/* <p>{studentdata.imageUrl}</p> */}

      
      {/* Display the image using the imageUrl */}
      {/* <img src={studentdata.imageUrl} alt={`Image of ${studentdata.name}`} /> */}
    </div>
  );
};

export default StudentProfile;
