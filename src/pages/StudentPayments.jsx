import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { usePaymentContext } from "../hooks/usePaymentContext";
import { useSiteDetailsContext } from "../hooks/useSiteDetailsContext";
import { FaTrash } from "react-icons/fa";

const Payments = () => {
  const { id } = useParams();
  const { payments, dispatch } = usePaymentContext();
  const { user } = useAuthContext();
  const { sitedetail, dispatch: sitedispatch } = useSiteDetailsContext();
  const navigate = useNavigate();
  const [paymentss, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [packageStatus, setPackageStatus] = useState("");
  const [newPackageStatus, setNewPackageStatus] = useState("");
  const [scrollPosition, setScrollPosition] = useState(0); // Add state to store scroll position

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
    const fetchPayments = async () => {
      try {
        const response = await fetch(
          `https://edu-project-backend.onrender.com/api/payments/getAllPaymentsByInsId/${sitedetail._id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const json = await response.json();

        // Log the API response

        if (response.ok) {
          setPayments(json.data);
          //setClz(json.data);
          dispatch({ type: "SET_PAYMENTS", payload: json.data });
        }
      } catch (error) {
        
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [dispatch, user, sitedetail._id]);

  const filteredAttendance = paymentss.filter((payment) => {
    return (
      payment.std_ID.includes(searchTerm) ||
      (payment.className &&
        payment.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.month &&
        payment.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.name &&
        payment.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, scrollPosition); // Restore scroll position on component mount
  }, []);

  return (
    <div>
      <div className="superAdminDashboardContainer">
        {packageStatus !== "Yes" ? (
          <div>
            <h1>You need to pay</h1>
          </div>
        ) : (
          <div className="instituteTableContainer">
            <p>
              You can Filter by Student_ID,Student name , Class name & Month and{" "}
            </p>
            <input
              type="text"
              placeholder="Search by Student_ID , Student name, month & Class name"
              value={searchTerm}
              size={100}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="instituteTable">
              <thead>
                <tr className="test">
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Month</th>
                  <th>Class Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((payment, index) => {
                    const colomboTime = new Date(payment.date).toLocaleString(
                      "en-US",
                      { timeZone: "Asia/Colombo" }
                    );
                    return (
                      <tr key={index}>
                        <td>{payment.std_ID}</td>
                        <td>{payment.name}</td>
                        <td>{payment.amount}</td> {/* Display Colombo time */}
                        <td>{payment.month}</td>
                        <td>{payment.className}</td>
                        <td>{colomboTime}</td>
                        <td>{payment.status}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8">No Attendences found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
         )} 
      </div>
    </div>
  );
};

export default Payments;
