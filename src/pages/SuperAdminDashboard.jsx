

import { useState } from "react";
import InstituteDetails from "../components/InstituteDetails";

import "../styles/superAdminDashboard.css"

export default function SuperAdminDashboard() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmissionSuccessful, setSubmissionSuccessful] = useState(false);

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
      <div className="instituteAddButtonContainer">
        <button onClick={openModal}>Add Institute</button>
      </div>

      {isModalOpen && (
        <InstituteCreate onClose={closeModal} onSuccess={handleSubmissionSuccess} />
      )}
      
      <InstituteDetails />
    </div>
  );
}

