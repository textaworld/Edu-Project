import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [data, setData] = useState("");
  const { dispatch } = useAuthContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null); // Reset the error state before making the request

    try {
      const response = await fetch(
        "https://edcuation-app.onrender.com/api/superAdmin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await response.json();

      if (response.ok) {
        // No error occurred, set data and return success message
        setData(json);
        setIsLoading(false);
        return { success: true, message: "OTP sent successfully" };
      } else {
        // Error occurred, set error state with the error message
        setError(json.error || "Failed to send OTP");
        setIsLoading(false);
        return { success: false, error: json.error || "Failed to send OTP" };
      }
    } catch (error) {
      // Handle network errors
      
      setError("Network error. Please try again later.");
      setIsLoading(false);
      return {
        success: false,
        error: "Network error. Please try again later.",
      };
    }
  };

  const verifyLogin = async (otp) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://edcuation-app.onrender.com/api/superAdmin/verifylogin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, otp }),
        }
      );

      const json = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(json));

        dispatch({ type: "LOGIN", payload: json });

        setError(null);

        setIsLoading(false);
      } else {
        
        setError(json.error);

        setIsLoading(false);
      }
    } catch (error) {
      
      setError("Internal Server Error");

      setIsLoading(false);
    }
  };

  return { login, verifyLogin, isLoading, error };
};
