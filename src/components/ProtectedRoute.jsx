import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const deptId = localStorage.getItem("department_id");
  return deptId ? children : <Navigate to="/auth" replace />;
}
