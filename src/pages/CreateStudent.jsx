import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import QrCode from "../components/qrGenerator";
import { useStudentContext } from "../hooks/useStudentContext";
import { useAuthContext } from "../hooks/useAuthContext";
import { useClassContext } from "../hooks/useClassContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { FaDownload, FaCheck } from "react-icons/fa";
import { validateAgeInput } from "../validation/validationUtils";

import "../styles/createStudent.css";
//import { backgroundImage } from "html2canvas/dist/types/css/property-descriptors/background-image";

const CreateStudent = () => {
  const { dispatch } = useStudentContext();
  const { user } = useAuthContext();
  const { classs, dispatch: clz } = useClassContext();
  const { sitedetail, dispatch: institute } = useSiteDetailsContext();
  const navigate = useNavigate();
  
  const instID = user.instituteId;
  const [inst_ID, setInst_ID] = useState("");
  const [name, setName] = useState("");
  const [std_ID, setStd_ID] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [classss, setClass] = useState([]);
  const [age, setAge] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [stdClass, setStdClass] = useState([]);
  const [image, setImage] = useState(null);
  const [bgImage , setBgImage] = useState(null);
  const [stdCount, setStdCount] = useState("");
  const [classStates, setClassStates] = useState({});
  const [isDownload, setIsDownload] = useState(false);
  const [error, setError] = useState(null);
  const idCardRef = useRef(null);
  const cardStatus = sitedetail.stdCardcardStatus;
  const [isBgImageSelected, setIsBgImageSelected] = useState(false);
  const [swimHours,setSwimHours] = useState(0)
  // console.log(cardStatus)

  const isAnyCheckboxChecked = () => {
    return Object.values(classStates).some(
      (classState) => classState.isChecked
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
  };

  
  const handleBGImageChange = (e) => {
    const file = e.target.files[0];
    setBgImage(URL.createObjectURL(file));
    setIsBgImageSelected(true); // Set flag when background image is selected
  };
  useEffect(() => {
    const fetchSiteDetails = async () => {
      const response = await fetch(
        `https://edu-project-backend.onrender.com/api/site/getone/${user.instituteId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await response.json();

      if (response.ok) {
        setStdCount(sitedetail.count);
        institute({ type: "SET_SITE_DETAILS", payload: json });
      }
    };

    if (user) {
      fetchSiteDetails();
    }
  }, [institute, user]);

  useEffect(() => {
    const fetchClassesBySite = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/class/getAllClassesByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        if (response.ok && Array.isArray(json.data)) {
          const subjectsArray = json.data.map((classObj) => classObj._id);
          setStdClass(subjectsArray);
          clz({ type: "SET_CLASS", payload: json.data });
        } else {
          
        }
      } catch (error) {
        
      }
    };

    const generateStudentID = () => {
      // Extracting first 2 letters from sitedetail.name
      const firstTwoLetters = sitedetail.name.slice(0, 2).toUpperCase();

      // Getting last two digits of the current year
      const yearLastTwoDigits = new Date().getFullYear().toString().slice(-2);

      // Getting current month and day
      const currentMonth = (new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const currentDay = new Date().getDate().toString().padStart(2, "0");

      // Getting current time
      const currentTime = new Date().toLocaleTimeString().replace(/:| /g, "");

      // Concatenating all parts to form student ID
      const studentID =
        firstTwoLetters +
        yearLastTwoDigits +
        currentMonth +
        currentDay +
        currentTime;

      //setStd_ID(studentID);
    };
    if (user && sitedetail && sitedetail._id) {
      fetchClassesBySite();
      generateStudentID();
    }
  }, [clz, user, sitedetail]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const selectedClasses = Object.keys(classStates).filter(
      (_id) => classStates[_id]?.isChecked
    );

    // const swimHours = 10;
    const student = {
      inst_ID: instID,
      std_ID,
      name,
      email,
      age,
      address,
      swimHours,
      phone,
      classs: selectedClasses.map((classId) => ({
        _id: classId,
        subject: classStates[classId]?.subject,
      })),
      stdCount: sitedetail.count,
    };


    const response = await fetch(
      "https://edu-project-backend.onrender.com/api/students/createStudent",
      {
        method: "POST",
        body: JSON.stringify(student),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    const json = await response.json();

    if (!response.ok) {
      setError(json.error);

      // Display error message in an alert
      alert(`Error: ${json.error}`);
    }

    if (response.ok) {
      setInst_ID("");
      setStd_ID("");      
      setName("");
      setEmail("");
      setAge("");
      setAddress("");
      setPhone("");
      setClass("");
      setSwimHours("")
      setStdCount("");
      setIsDownload(false);
      uncheckAll();
      setQrImage(null);
      setImage(null);
      setError(null);

      // Display success message in an alert
      alert("Student created successfully!");
      dispatch({ type: "CREATE_STUDENT", payload: json });
    }
  };

  const generateQrCode = async () => {
    try {
      // Check if any of the required fields are null or empty
      

      const student = { std_ID };

      const response = await fetch("https://edu-project-backend.onrender.com/api/qr/qrGenerator", {
        method: "POST",
        body: JSON.stringify(student),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        
        // Handle error appropriately
        
        return;
      }

      const data = await response.text();
      setQrImage(data);
    } catch (error) {  
      
      // Handle error appropriately
    }
  };

  const handleDownload = () => {
    const scale = 3; // You can adjust the scale factor as needed

    html2canvas(idCardRef.current, {
      scale: scale,
    }).then((canvas) => {
      const link = document.createElement("a");

      // Convert canvas to data URL with JPEG MIME type and maximum quality
      link.href = canvas.toDataURL("image/jpeg", 1.0);

      link.download = `${std_ID}.jpg`;
      link.click();
      setIsDownload(true);
    });
  };

  const handleCheckboxChange = (classId, selectedClass) => {
    setClassStates((prevStates) => ({
      ...prevStates,
      [classId]: {
        ...prevStates[classId],
        isChecked: !prevStates[classId]?.isChecked,
        subject: selectedClass.subject,
      },
    }));
  };

  const uncheckAll = () => {
    setClassStates((prevStates) => {
      const newState = {};
      for (const classId in prevStates) {
        newState[classId] = {
          ...prevStates[classId],
          isChecked: false,
        };
      }
      return newState;
    });
  };

  return (
    <div>
      <div className="superAdminDashboardContainer">
        <div className="createStudentMainContaner">
          <div className="createStudentFormContaner">
            <form onSubmit={handleSubmit}>
              <div className="createStudentFormContanerTopic">
                <h3>Add Student</h3>
              </div>

              <label>
                Student ID
                <input value={std_ID} type="text" placeholder="Enter Student ID" required onChange={(e)=> setStd_ID(e.target.value)} />
              </label>

              <label>
                Name
                <input
                  value={name}
                  type="text"
                  placeholder="Enter Name"
                  required
                  
                  title="Name must contain only alphabets"
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label>
                Email
                <input
                  value={email}
                  type="email"
                  placeholder="Enter Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  title="Enter a valid email address"
                />
              </label>

              <label>
                Age
                <input
                  value={age}
                  type="number"
                  placeholder="Enter Age"
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="0"
                  max="100"
                />
              </label>

              <label>
                Address
                <input
                  value={address}
                  type="text"
                  placeholder="Enter Address"
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </label>

              <label>
                Phone
                <input
                  value={phone}
                  type="tel"
                  placeholder="Enter Phone Num"
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="[0-9]{11}"
                  title="Enter a valid 10 digit phone number"
                />
              </label>

              {/* <label>
                Background Image
                <input
                  type="file"
                  accept="image/*"
                  
                  onChange={handleBGImageChange}
                  required
                />
              </label> */}

              <label>
                Image
                <input
                  type="file"
                  accept="image/*"
                  
                  onChange={handleImageChange}
                  required
                />
              </label>

              

              <label>
                Select Classes
                <div id="classSelection" className="classSelection">
                  {stdClass.map((classId, index) => {
                    const selectedClass = classs.find(
                      (classObj) => classObj._id === classId
                    );

                    return selectedClass ? (
                      <div className="checkbox-row" key={index}>
                        <label htmlFor={`class_${index}`}>
                          <input
                            type="checkbox"
                            id={`class_${index}`}
                            value={classId}
                            checked={classStates[classId]?.isChecked || false}
                            onChange={() => {
                              handleCheckboxChange(classId, selectedClass);
                            }}
                          />
                          {selectedClass.subject}
                        </label>
                      </div>
                    ) : null;
                  })}
                </div>
              </label>

              <label>
                SwimHours
                <input
                  value={swimHours}
                  type="number"
                  placeholder="Only for swimming class students "
                  onChange={(e) => setSwimHours(e.target.value)}
                  required

                />
              </label>

              <div className="errorContainer">
            {error && <div className="error">{error}</div>} 
          </div>

              
                 
                    <button type="submit" className="createstudentsubmitButton">Submit</button>
                   
                 
              

             

             
            </form>
          </div>
          <div className="createStudentIdCardContaner">
            <div className="id-card-container" ref={idCardRef}>
              <div className="id-card-qr">
                {/* <img src={image1} alt="ID Card1" width="180px" /> */}
                {qrImage && <QrCode qrImage={qrImage} />}
              </div>

              <div className="id-card-Bgimage">
                <img src={bgImage}  />
              </div>

              <div className="id-card-image">
                <img src={image}  />
              </div>

              <div className="id-card-details">
  <div>
    
    <input
      type="text"
      id="std_ID"
      value={std_ID}
      disabled
      style={{ width: "250px", height: "25px", fontWeight: "bold",fontSize:'22px',marginBottom:'5px',marginTop:'8px' }}
    />
  </div>
  <div>
   
    <input
      type="text"
      id="name"
      value={name}
      disabled
      style={{ width: "260px", height: "25px",fontSize:'20px'}}
    />
  </div>
  <div>
    
    <input
      id="address"
      value={address}
      disabled
      style={{
        width: "360px",
        height: "25px",marginTop:'0px',fontSize:'15px'
      }}
    />
  </div>
</div>


              <div className="id-card-logo">
                <img src={sitedetail.image} alt="Logo" />
              </div>

              {!isBgImageSelected && (
            <div className="id-card">
              <p>{sitedetail.name}</p>
            </div>
          )}

            </div>

            <div>
            <label>
                Background Image
                <input
                  type="file"
                  accept="image/*"
                  
                  onChange={handleBGImageChange}
                  required
                />
              </label>
            </div>

            <div className="createStudentIdCardContanerButton">
              {/* Step 1 */}
              <div
                className="stepBox"
                style={{
                  borderColor:
                    std_ID &&
                    
                    isAnyCheckboxChecked()
                      ? "rgb(23,  211, 23)"
                      : "#ccc",
                }}
              >
                <h3
                  className="stepTitle"
                  style={{
                    color:
                      std_ID &&
                      
                      isAnyCheckboxChecked()
                        ? "rgb(23, 211, 23)"
                        : "black",
                  }}
                >
                  Step 1
                </h3>
                
                  <div className="stepIconGreen">
                    <FaCheck />
                  </div>
                
                <p className="stepDescription">
                  Please fill all fields. Make sure to provide accurate
                  information.
                </p>
              </div>

              {/* Step 2 */}
              <div
                className="stepBox"
                style={{ borderColor: qrImage ? "rgb(23, 211, 23)" : "#ccc" }}
              >
                <h3
                  className="stepTitle"
                  style={{ color: qrImage ? "rgb(23, 211, 23)" : "black" }}
                >
                  Step 2
                </h3>
                <p className="stepDescription">Generate QR Code</p>
                {qrImage ? (
                  <div className="stepIconGreen">
                    <FaCheck />
                  </div>
                ) : null}
                
               
                {cardStatus === 'yes' && (
    <button type="button" onClick={generateQrCode} className="stepButton">
      Generate QR Code
    </button>
  )}
              </div>

              {/* Step 3 */}
              <div
                className="stepBox"
                style={{
                  borderColor: isDownload ? "rgb(23, 211, 23)" : "#ccc",
                }}
              >
                <h3
                  className="stepTitle"
                  style={{ color: isDownload ? "rgb(23, 211, 23)" : "black" }}
                >
                  Step 3
                </h3>
                <p className="stepDescription">Download ID Card</p>
                {qrImage && std_ID  ? (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="stepButton"
                  >
                    Download ID Card
                    <FaDownload className="IdCardContanerdownicon" />
                  </button>
                ) : null}
                {isDownload ? (
                  <div className="stepIconGreen">
                    <FaCheck />
                  </div>
                ) : null}
              </div>

              {/* Step 4 */}
              <div className="stepBox">
                <h3 className="stepTitle">Step 4</h3>
                <p className="stepDescription">Finalize submission</p>
                {isDownload ? (
                  <div>
                    <p style={{ color: "rgb(23, 211, 23)" }}>Ready to submit</p>
                   
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent;

// const handleIdcardImageData = async () => {
//   const scale = 3; // You can adjust the scale factor as needed

//   try {
//     const canvas = await html2canvas(idCardRef.current, {
//       scale: scale,
//     });

//     // Convert canvas to a Blob
//     return new Promise((resolve, reject) => {
//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             resolve(blob);
//           } else {
//             reject(new Error("Failed to convert canvas to Blob"));
//           }
//         },
//         "image/jpeg",
//         1.0
//       );
//     });
//   } catch (error) {
//     
//     return null;
//   }
// };

{
  /* <div className="mb-2">
<label>Select Classes</label>
<div>
  {stdClass.map((classId, index) => {
    // Find the class object based on the ID
    const selectedClass = classs.find(
      (classObj) => classObj._id === classId
    );

    if (selectedClass) {
      return (
        <div key={index}>
          <input
            type="checkbox"
            id={`class_${index}`}
            value={classId}
            checked={classStates[classId]?.isChecked || false}
            onChange={() =>
              setClassStates((prevStates) => ({
                ...prevStates,
                [classId]: {
                  ...prevStates[classId],
                  isChecked: !prevStates[classId]?.isChecked,
                  subject: selectedClass.subject,
                },
              }))
            }
          />
          <label htmlFor={`class_${index}`}>
            {selectedClass.subject}
          </label>
        </div>
      );
    } else {
      // Handle case where class details are not found
      return null;
    }
  })}
</div>
</div> */
}

{
  /* <div className="createStudentIdCardContanerButton">
{!qrImage || !std_ID || !name || !address || !image ? ( 
 <button type="button" onClick={generateQrCode}>
   Generate QR Code
 </button>
) : ( 
 <button type="button" onClick={handleDownload}>
   Download ID Card
   <FaDownload className="IdCardContanerdownicon" />
 </button>
)} 
</div> */
}
