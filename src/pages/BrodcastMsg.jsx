import React, { useState, useEffect } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";

const BrodcastMsg = () => {
  // const { id } = useParams();
  const { classs, dispatch } = useClassContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: sitedispatch } = useSiteDetailsContext();
  const [clzs, setClz] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  const [grade, setGrade] = useState("");
  const [message, setMessage] = useState("");
  const [stdMessage, setStdMessage] = useState("");

  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [classSubject, setClassSubject] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classes, setClasses] = useState([]);

  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");
  const [remainingSMSCount, setRemainingSMSCount] = useState(0);
  const [instNotification, setInstNotification] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false); // State to track button click
  const [hideButton, setHideButton] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [std_ID, setStd_ID] = useState("");
  const [stdPhone, setStdPhone] = useState("");

  const instID = sitedetail._id;

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

  const fetchSiteDetails = async () => {
    const response = await fetch(
      `https://edu-project-backend.onrender.com/api/site/getone/${user.instituteId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    );
    const json = await response.json();

    if (response.ok) {
      setNewPackageStatus(json.packageStatus);
      setInstNotification(json.notification);

      dispatch({ type: "SET_SITE_DETAILS", payload: json });

      // Check if expiration check has already been performed
      const expirationCheckPerformed = localStorage.getItem(
        "expirationCheckPerformed"
      );

      if (!expirationCheckPerformed) {
        const interval = setInterval(() => {
          // Convert string representations to Date objects
          const currentTime = new Date();
          const expireTime = new Date(json.expireTime);
          //console.log(expireTime)
          if (currentTime > expireTime) {
            const status = "Deactivate";
            updateDetails({ packageStatus: status });
            setPackageStatus("No");
            clearInterval(interval);
            localStorage.setItem("expirationCheckPerformed", "true");
          } else {
            setPackageStatus("Yes");
          }
        }, 1000);
        // Check every second (adjust as needed)
      } else {
        setPackageStatus("No"); // Set 'No' if expiration check already performed
      }
    }
  };

  const updateDetails = async (data) => {
    try {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/institute/update/${user.instituteId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update details: ${response.status}`);
      }

      dispatch({
        type: "UPDATE_INSTITUTE",
        payload: { _id: sitedetail._id, data },
      });

      //setInstituteDetails(getInstituteDetails(instituteId));
    } catch (error) {
      // Handle error (e.g., display an error message)
    }
  };

  const handleRestartProcess = async () => {
    if (newPackageStatus === "Active") {
      // Clear the expiration check flag in localStorage
      localStorage.removeItem("expirationCheckPerformed");

      // Update newPackageStatus to 'Deactive' call the API and update
    }

    // Call fetchSiteDetails to restart the process
    await fetchSiteDetails();
  };

  useEffect(() => {
    let expirationCheckPerformed;

    if (user) {
      fetchSiteDetails();
    }

    if (expirationCheckPerformed && packageStatus === "No") {
      // Restart the process if expiration check performed and package status is 'No'
      handleRestartProcess();
    }

    return () => {
      // Cleanup logic if needed
    };
  }, [dispatch, user, packageStatus]);

  useEffect(() => {
    // Check if expiration check has already been performed
    const expirationCheckPerformed = localStorage.getItem(
      "expirationCheckPerformed"
    );

    if (expirationCheckPerformed && packageStatus === "No") {
      // Restart the process if expiration check performed and package status is 'No'
      handleRestartProcess();
    }
  }, [packageStatus]);

  useEffect(() => {
    const TopP = sitedetail.topUpPrice;
    const SMSP = sitedetail.smsPrice;

    //console.log(TopP)
    //console.log(SMSP)

    //console.log(sitedetail.topUpPrice / sitedetail.smsPrice)

    const remSmsCount = parseInt(
      sitedetail.topUpPrice / sitedetail.smsPrice - sitedetail.smsCount
    );
    setRemainingSMSCount(remSmsCount);
  }, [sitedetail.smsPrice, sitedetail.topUpPrice, sitedetail.smsCount]);

  // const handleSubmit = (event) => {
  //     event.preventDefault(); // Prevents the default form submission behavior
  //     // You can perform any logic here with the form data, such as sending it to a server
  //     console.log("Grade:", grade);
  //     console.log("Message:", message);
  // };
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // console.log(sitedetail._id)
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/class/getAllClassesByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();
        // console.log(json.data)
        const subjectsArray = json.data.map((classObj) => classObj.subject);
        setClassSubject(subjectsArray);
        setClasses(json.data);
        // Log the API response

        if (response.ok) {
          //setClz(json.data);
          dispatch({ type: "SET_CLASS", payload: json.data });
        }
      } catch (error) {}
    };

    if (user) {
      fetchClasses();
    }
  }, [dispatch, user, sitedetail._id]);

  useEffect(() => {
    const fetchStudentsBySubject = async () => {
      try {
        if (!selectedClass) return; // Return if no class is selected

        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/students/getAllStudentsBySubject/${instID}/subject?subject=${selectedClass}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        // console.log("API Response:", json.data); // Log the entire response

        if (response.ok) {
          // Handle the response here
          // For example, dispatch an action to set the students with phone numbers
          dispatch({
            type: "SET_STUDENTS_WITH_PHONE_NUMBERS",
            payload: json.data,
          });

          // Check if json.data is not empty
          if (json.data && json.data.length > 0) {
            // Log the structure of json.data
            // console.log("Data Structure:", json.data);

            // Directly use the array of phone numbers as phoneNumbers
            const phonesArray = Array.isArray(json.data)
              ? json.data
              : [json.data];

            //console.log("Phone Numbers:", phonesArray);
            setPhoneNumbers(phonesArray);
          } else {
            console.error("Empty data returned");
          }
        }
      } catch (error) {
        console.error("Error fetching students by subject:", error);
      }
    };

    // Check if a subject is selected before fetching students
    if (selectedClass && user) {
      fetchStudentsBySubject();
    }
  }, [dispatch, instID, selectedClass, user.token]);

  //console.log(classSubject)
  //console.log("phoneNumbers",phoneNumbers)

  //console.log("selectedClz",selectedClass)

  const sendSMSToParent = async (phoneNumber) => {
    try {
      const messageText = message;
      const instID = sitedetail._id;
      const emailDetails = { to: phoneNumber, message: messageText, instID };
      const response = await fetch(
        "https://edu-project-backend.onrender.com/api/sms/send-message",
        {
          method: "POST",
          body: JSON.stringify(emailDetails),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error sending SMS.");
      }
    } catch (error) {
      console.error(`Error sending SMS:`, error);
    }
  };

  const sendParentSmss = async () => {
    try {
      for (const phoneNumber of phoneNumbers) {
        if (remainingSMSCount >= 10) {
          // setInstNotification((prevNotification) => {
          //   if (prevNotification === "Yes") {
              sendSMSToParent(phoneNumber);
          //   }
          //   return prevNotification; // Return the current state
          // });
        } else {
          alert("Your SMS account balance is low. Please topUp");
        }
        setButtonClicked(true);
        setSubmissionSuccess(true);
      }
    } catch (error) {
      console.error(`Error sending SMS:`, error);
    }
  };

  const sendStudentSmss = async () => {
    try {
      if (remainingSMSCount >= 10) {
        // setInstNotification((prevNotification) => {
        //   if (prevNotification === "Yes") {
            sendSMSToStudent(stdPhone);
        //  }
        //   return prevNotification;
        // });
      } else {
        alert("Your SMS account balance is low. Please topUp");
      }
      setButtonClicked(true);
      setSubmissionSuccess(true);
    } catch (error) {
      console.error(`Error sending SMS:`, error);
    }
  };

  const sendSMSToStudent = async (phoneNumber) => {
    try {
      const messageText = stdMessage;
      const instID = sitedetail._id;
      const emailDetails = { to: phoneNumber, message: messageText, instID };
      const response = await fetch(
        "https://edu-project-backend.onrender.com/api/sms/send-message",
        {
          method: "POST",
          body: JSON.stringify(emailDetails),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error sending SMS.");
      }
    } catch (error) {
      console.error(`Error sending SMS:`, error);
    }
  };

  const handleClassSelect = (event) => {
    setSelectedClass(event.target.value);
  };

  const fetchStudents = async () => {
    try {
      console.log(std_ID);
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/students/searchStudentByStd_ID?std_ID=${std_ID}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();
      // console.log(json.phone);
      setStdPhone(json.phone);

      if (response.ok) {
        dispatch({ type: "SET_STUDENTS", payload: json.data });
      }
    } catch (error) {
      console.error(`Error :`, error);
    }
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleStd_IDChange = (e) => {
    setStd_ID(e.target.value);
  };

  //console.log(std_ID)

  const handleChangeMessage = (e) => {
    // Limit message to 160 characters
    const inputValue = e.target.value;
    if (inputValue.length <= 160) {
      setMessage(inputValue);
    }
  };

  const handleChangeStdMessage = (e) => {
    // Limit stdMessage to 160 characters
    const inputValue = e.target.value;
    if (inputValue.length <= 160) {
      setStdMessage(inputValue);
    }
  };

  return (
    <div>
    {packageStatus !== "Yes" ? (
      <div>
        <h1>Processing</h1>
      </div>
    ) : (
      
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h3>Send Messages for grade or class</h3>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "left", marginRight: "20px" }}>
            <div style={{ marginBottom: "50px", marginLeft: "500px" }}>
              
              <label htmlFor="grade">
                Grade & Class: <br />
              </label>
              <select
                style={{ margin: "10px auto", height: "30px" }}
                value={selectedClass}
                onChange={handleClassSelect}
              >
                <option value="">Select a class</option>
                {classes.map((classObj) => (
                  <option key={classObj._id} value={classObj.subject}>
                    {classObj.subject}
                  </option>
                ))}
              </select>
              <br />
            </div>
          </div>
  
          <div style={{ textAlign: "right", marginRight: "400px" }}>
            <div>
              <label htmlFor="message" style={{ marginRight: "230px" }}>
                Message: <br />
              </label>
              <textarea
        id="message"
        value={message}
        onChange={handleChangeMessage}
        style={{
          margin: "10px auto",
          width: "300px",
          height: "100px",
        }}
      />
              <br />
            </div>
  
            <button
              type="button"
              onClick={sendParentSmss}
              style={{
                background: "#0f172a",
                color: "white",
                padding: "10px 20px",
                fontSize: "16px",
                borderRadius: "5px",
                cursor: "pointer",
                marginLeft: "190px",
                display: hideButton ? "none" : "block",
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
  
        {/* Separate section for Search by std_ID */}
        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid black" }} />

        <h3>Send Messages for a student</h3>
        <div style={{marginTop:'20px'}}>
          <label style={{marginRight:'20px'}} htmlFor="std_ID">Search by std_ID:</label>
          <input
            type="text"
            id="std_ID"
            value={std_ID}
            onChange={handleStd_IDChange}
          />
          <button  style={{marginLeft:'20px'}} onClick={handleSearch}>Search</button>
          <p>Student's Phone Number:{stdPhone}</p>
        </div>
  
        <div>
          <label htmlFor="message" style={{ marginRight: "230px" }}>
            Message: <br />
          </label>
          <textarea
        id="stdMessage"
        value={stdMessage}
        onChange={handleChangeStdMessage}
        style={{
          margin: "10px auto",
          width: "300px",
          height: "100px",
        }}
      />
          <br />
        </div>
  
        <button
          type="button"
          onClick={sendStudentSmss}
          style={{
            background: "#0f172a",
            color: "white",
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "713px",
            display: hideButton ? "none" : "block",
          }}
        >
          Send SMS
        </button>
        {error && <div className="error">{error}</div>}
        {submissionSuccess && (
          <div className="success">SMS sent successfully!</div>
        )}
      </div>
    )}
  </div>
  
  );
};

export default BrodcastMsg;
