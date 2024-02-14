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
