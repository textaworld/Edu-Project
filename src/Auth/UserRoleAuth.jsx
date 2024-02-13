import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const UserRoleAuth = ({ userRole }) => {
  const { user } = useAuthContext();
  const location = useLocation();

  const navipath = (uRole) => {
    if (uRole === "SUPER_ADMIN") {
      return "/login";
    } else {
      return "/adminlogin";
    }
  };

  return user && user.role === userRole ? (
    <Outlet />
  ) : (
    <Navigate to={navipath(userRole)} state={{ from: location }} replace />
  );
};

export default UserRoleAuth;
