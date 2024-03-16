import React, { useState,useEffect } from 'react';
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

    const [grade, setGrade] = useState('');
    const [message, setMessage] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [classSubject,setClassSubject] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [classes, setClasses] = useState([]);

    const instID = sitedetail._id;

    // const handleSubmit = (event) => {
    //     event.preventDefault(); // Prevents the default form submission behavior
    //     // You can perform any logic here with the form data, such as sending it to a server
    //     console.log("Grade:", grade);
    //     console.log("Message:", message);
    // };
    useEffect(() => {
        const fetchClasses = async () => {
          try {
            console.log(sitedetail._id)
            const response = await fetch(
              `http://localhost:3018/api/class/getAllClassesByInsId/${sitedetail._id}`,
              {
                headers: { Authorization: `Bearer ${user.token}` },
              }
            );
            const json = await response.json();
              console.log(json.data)
              const subjectsArray = json.data.map((classObj) => classObj.subject);
              setClassSubject(subjectsArray);
              setClasses(json.data);
            // Log the API response
    
            if (response.ok) {
              //setClz(json.data);
              dispatch({ type: "SET_CLASS", payload: json.data });
            }
          } catch (error) {
            
          }
        };
    
        if (user) {
          fetchClasses();
        }
      }, [dispatch, user, sitedetail._id]);

  
     
  

    useEffect(() => {
        const fetchStudentsBySubject = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3018/api/students/getAllStudentsBySubject/${sitedetail._id}/subject?subject=${selectedClass}`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }
                );
                const json = await response.json();
    
                console.log("API Response:", json.data); // Log the entire response
    
                if (response.ok) {
                    // Handle the response here
                    // For example, dispatch an action to set the students with phone numbers
                    dispatch({ type: "SET_STUDENTS_WITH_PHONE_NUMBERS", payload: json.data });

                    const phonesArray = json.data
                    console.log(phonesArray)
                    setPhoneNumbers(phonesArray); 
                }
            } catch (error) {
                console.error("Error fetching students by subject:", error);
            }
        };
    
        // Check if a subject is selected before fetching students
        if (classSubject && user) {
            fetchStudentsBySubject();
        }
    }, [dispatch, sitedetail._id, classSubject, user.token]);


console.log("phoneNumbers",phoneNumbers)

console.log("selectedClz",selectedClass)

const sendSMSToParent = async (phoneNumber) => {
    try {
        const messageText = message;
        const instID = sitedetail._id;
        const emailDetails = { to: phoneNumber, message: messageText, instID };
        const response = await fetch("http://localhost:3018/api/sms/send-message", {
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
    } catch (error) {
        console.error(`Error sending SMS:`, error);
    }
};


const sendParentSmss = async () => {
    try {
        for (const phoneNumber of phoneNumbers) {
            await sendSMSToParent(phoneNumber);
        }
    } catch (error) {
        console.error(`Error sending SMS:`, error);
    }
};

    
const handleClassSelect = (event) => {
    setSelectedClass(event.target.value);
  };

    
    return (
        
            <div style={{ textAlign: 'center' ,marginTop:'50px'}}>
                <form style={{ display: 'inline-block', textAlign: 'left' }}>

                    <div>
                    <label htmlFor="grade">Grade: <br /></label>
    
    <select style={{ margin: '10px auto', height: '30px' }} value={selectedClass} onChange={handleClassSelect}>
        <option value="">Select a class</option>
        {classes.map((classObj) => (
            <option key={classObj._id} value={classObj.subject}>
                {classObj.subject}
            </option>
        ))}
    </select>
    <br />
                    </div>


                    <div>
                    <label htmlFor="message">Message: <br /></label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{ margin: '10px auto', width: '300px', height: '100px' }}
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
                            marginLeft: "0px",
                        }}
                    >
                        Send SMS
                    </button>
                </form>
            </div>
    );
};

export default BrodcastMsg;
