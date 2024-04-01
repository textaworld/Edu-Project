import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const TestAuth = ({ userRole }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  const navipath = (uRole) => {
    if (uRole === "SUPER_ADMIN") {
      return "/sadmin";
    } else if (uRole === "ADMIN") {
      return "/";
    } else if (uRole === "SUB_ADMIN") {
      return "/subadminhome";
    }else{
      return "/scladminhome";
    }
  };

  return user && user.role === userRole ? (
    <Navigate to={navipath(userRole)} state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

export default TestAuth;
