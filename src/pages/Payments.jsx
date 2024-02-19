import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePaymentContext } from "../hooks/usePaymentContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useStudentContext } from "../hooks/useStudentContext";
import "../styles/payment.css";

const CreatePayment = () => {
  const { id } = useParams();
  const { classs, dispatch: clz } = useClassContext();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const { dispatch } = usePaymentContext();
  const { user } = useAuthContext();
  const { students, dispatch: student } = useStudentContext();

  const instID = user.instituteId;

  const [inst_ID, setInst_ID] = useState();
  const [name, setName] = useState("");
  const [std_ID, setStd_ID] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [className, setClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false); // State for tracking submission success

  useEffect(() => {
    const currentDate = new Date();
    const monthName = currentDate.toLocaleString("en-US", { month: "long" });
    setMonth(monthName);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    // Form validation
    if (!name || !std_ID || !amount || !selectedClassId || !className) {
      setError("All fields are required");
      return;
    }

    const status = 'paid'

    const date = new Date();
    const payment = {
      inst_ID: instID,
      std_ID,
      name,
      amount,
      month,
      classID: selectedClassId,
      className,
      status,
      date,
    };

    const response = await fetch(
      "https://edu-project-backend.onrender.com/api/payments/createPayment",
      {
        method: "POST",
        body: JSON.stringify(payment),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const json = await response.json();
    console.log("payment",json)

    if (!response.ok) {
      setError(json.error);
      return;
    }

    setStd_ID("");
    setName("");
    setAmount("");
    setSelectedClassId("");
    setClassName("");
    setError(null);
    setSubmissionSuccess(true); // Set submission success to true
    dispatch({ type: "CREATE_PAYMENT", payload: json });
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/class/getAllClassesByInsId/${instID}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        // Log the API response

        if (response.ok) {
          setClasses(json.data);
          //setClz(json.data);
          clz({ type: "SET_CLASS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchClasses();
    }
  }, [clz, user, instID]);

  const handleClassSelect = (event) => {
    setSelectedClassId(event.target.value);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          "https://edu-project-backend.onrender.com/api/students/getStudentById/" + id,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok) {
          setStd_ID(json.std_ID);
          setName(json.name);

          student({ type: "SET_STUDENTS", payload: json });
        }
      } catch (error) {
        
        // Handle the error as needed
      }
    };

    if (user) {
      fetchStudents();
    }
  }, [student, user, id]);

  return (
    <div className="container">
      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Make Payments</h2>
          <div className="form-group">
            <label htmlFor="std_ID">Student ID</label>
            <input
              value={std_ID}
              type="text"
              placeholder="Enter Student ID"
              className="form-control"
              onChange={(e) => setStd_ID(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              value={name}
              type="text"
              placeholder="Enter Name"
              className="form-control"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              value={amount}
              type="number"
              placeholder="Enter Amount"
              className="form-control"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Month</label>
            <input value={month} readOnly className="form-control" />
          </div>
          <div className="form-group">
            <label>Select a class</label>
            <select
              value={selectedClass}
              onChange={handleClassSelect}
              className="form-control"
            >
              <option value="">Select a class</option>
              {classes.map((classObj) => (
                <option key={classObj._id} value={classObj._id}>
                  {classObj.subject}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="className">Re-Enter Class Name</label>
            <input
              value={className}
              type="text"
              placeholder="Enter Class Name"
              className="form-control"
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-submit">
            Submit
          </button>
          {error && <div className="error">{error}</div>}
          {submissionSuccess && (
            <div className="success"> submitted successfully!</div>
          )}{" "}
         
        </form>
      </div>
    </div>
  );
};

export default CreatePayment;
