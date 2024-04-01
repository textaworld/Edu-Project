import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useParams } from "react-router-dom";
import "../styles/updateStudent.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TeachersIncome = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dailyIncome, setDailyIncome] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());


  const fetchMonthlyIncome = async () => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/payments/calculateMonthlyIncome?classID=${id}&month=${selectedMonth}`, 
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();
      //console.log(json);

      if (response.ok) {
        setMonthlyIncome(json.totalIncome);
      } else {
        console.error("Failed to fetch monthly income:", json);
      }
    } catch (error) {
      console.error("Error fetching monthly income:", error);
    }
  };

  const handleCalculateIncome = () => {
    fetchMonthlyIncome();
  };

//   const handleCalculateDailyIncome = async () => {
//     try {
//       const response = await fetch(
//         `https://edu-project-backend.onrender.com/api/payments/calculateDailyIncome?classID=${id}`,
//         {
//           headers: { Authorization: `Bearer ${user.token}` },
//         }
//       );
//       const data = await response.json();

//       if (response.ok) {
//         setDailyIncome(data.totalIncome);
//       } else {
//         console.error("Failed to fetch daily income:", data.error);
//       }
//     } catch (error) {
//       console.error("Error fetching daily income:", error);
//     }
//   };

const handleCalculateDailyIncome = async () => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/payments/calculateIncomeByDate?classID=${id}&date=${selectedDate.toISOString()}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const data = await response.json();

      console.log(data)

      if (response.ok) {
        setDailyIncome(data.totalIncome);
      } else {
        console.error("Failed to fetch daily income:", data.error);
      }
    } catch (error) {
      console.error("Error fetching daily income:", error);
    }
  };


  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
    <div style={{ width: "45%", marginLeft: "300px",marginTop:'100px' }}>
      <div>
        <label htmlFor="month">Select Month:</label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
      </div>
      <button style={{backgroundColor:'#0f172a'}} onClick={handleCalculateIncome}>Calculate Monthly Income</button>
      {monthlyIncome !== null ? (
        <p>Monthly Income:  <span style={{color:'red'}}>Rs.{monthlyIncome}</span></p>
      ) : (
        <p>No monthly income calculated</p>
      )}
    </div>
    <div style={{ width: "45%", marginTop: "100px" }}>
        <DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} />
        <button
          style={{ backgroundColor: "#0f172a" }}
          onClick={handleCalculateDailyIncome}
        >
          Calculate Daily Income
        </button>
        {dailyIncome !== null ? (
          <p>
            Daily Income: <span style={{ color: "red" }}>Rs.{dailyIncome}</span>
          </p>
        ) : (
          <p>No daily income calculated</p>
        )}
      </div>
  </div>
  );
};

export default TeachersIncome;
