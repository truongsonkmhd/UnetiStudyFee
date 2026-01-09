import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import { Role } from "@/types/Auth";
import { actionAuth } from "./context/AuthContext";
import PageLoader from "@/views/common/PageLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles: requiredRoles,
}) => {
  const { isAuthenticated, isLoading, hasRole } = actionAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={PATHS.AUTH} replace state={{ from: location }} />;
  }

  if (!hasRole(requiredRoles)) {
    return <Navigate to={PATHS.UNAUTHORIZED} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
