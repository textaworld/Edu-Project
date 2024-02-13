import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useSiteDetailsContext } from "./useSiteDetailsContext";

export const useAdminLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, dispatch } = useAuthContext();
  const { dispatch: instituteDispatch } = useSiteDetailsContext();

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://edcuation-app.onrender.com/api/site/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
        setIsLoading(false);
      }

      if (response.ok) {
      // Save the user to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // Update the auth context
      dispatch({ type: "LOGIN", payload: json });

      // Fetch site details
      // await fetchSiteDetails(json.instituteId, json.token);

      // Update loading state
      setIsLoading(false);
      
      }

      
    } catch (error) {
      
      setError("An error occurred during login.");
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
