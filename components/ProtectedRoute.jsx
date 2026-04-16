import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const ProtectedRoute = ({ children }) => {

  const { userData } = useContext(AppContext);

  //  still loading user
  if (!userData) return null;

  //  block if profile not completed
  if (!userData.isProfileComplete) {
    return <Navigate to="/profile" />;
  }

  //  allow access
  return children;
};

export default ProtectedRoute;