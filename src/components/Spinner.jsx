import React from 'react';
import { FaSpinner } from 'react-icons/fa'; // Assuming you have a library like react-icons installed
import "../styles/spinner.css";

const Spinner = () => {
  return (
    <div className="spinner-container">
      <FaSpinner className="spinner" />
    </div>
  );
};

export default Spinner;