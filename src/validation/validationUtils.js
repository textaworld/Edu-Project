// Function to validate age input
export const validateAgeInput = (inputAge) => {
    let sanitizedAge = parseInt(inputAge);
  
    // Ensure inputAge is not negative
    if (isNaN(sanitizedAge) || sanitizedAge < 0) {
      sanitizedAge = 0;
    }
  
    // Ensure inputAge is not above 100
    if (sanitizedAge > 100) {
      sanitizedAge = 100;
    }
  
    return sanitizedAge;
  };
  
  // Function to validate email format
  export const validateEmail = (email) => {
    // Regular expression for validating email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Function to validate phone number format
  export const validatePhoneNumber = (phoneNumber) => {
    // Regular expression for validating phone number format
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
  };
  
  // Function to validate name format
  export const validateName = (name) => {
    // Regular expression for validating name format
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name);
  };
  