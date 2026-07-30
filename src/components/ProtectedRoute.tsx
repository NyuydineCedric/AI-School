import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole, Role } from "../lib/auth";

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allow?: Role[];
}> = ({ children, allow }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(getRole() as Role))
    return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
