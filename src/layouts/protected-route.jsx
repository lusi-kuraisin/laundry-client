// src/layouts/ProtectedRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context";

function ProtectedRoute() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
