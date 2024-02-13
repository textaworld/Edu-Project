import { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";
import InstituteDetailsComponent from "../components/InstituteDetailsComponent";
import AdminCreate from "../components/AdminCreate";
import AdminDetails from "../components/AdminDetails";
import "../styles/superAdminDashboard.css";
import { FaArrowLeft } from 'react-icons/fa';

const SuperAdminDashboardAdmins = () => {
  const { id } = useParams();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmissionSuccessful, setSubmissionSuccessful] = useState(false);


  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous screen
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmissionSuccess = () => {
    setSubmissionSuccessful(true);
    closeModal();
  };
  

  return (
    <div className="superAdminDashboardContainer">
      {/* <button className="sadc-backbutton"onClick={handleGoBack}><FaArrowLeft /></button> */}

      {isModalOpen && (
        <AdminCreate
          instituteId={id}
          onClose={closeModal}
          onSuccess={handleSubmissionSuccess}
        />
      )}

      <InstituteDetailsComponent instituteId={id} onOpen={openModal}/>

      

      <AdminDetails instituteId={id} />
    </div>
  );
};

export default SuperAdminDashboardAdmins;
